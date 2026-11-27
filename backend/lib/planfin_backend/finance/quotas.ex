defmodule PlanfinBackend.Finance.Quotas do
  @moduledoc """
  Spending quotas: an amount planned for a kind of purchase (e.g. R$ 150 of car
  washes) and spent little by little.

  * **A quota belongs to an invoice**, not to a date. On a card, its month is the
    invoice month: purchases from that invoice's start to the eve of its closing.
    Off a card (a checking account), its month is the calendar month. A recurring
    quota (`once_month` nil) has one occurrence per invoice/month; a one-off quota
    only in `once_month`.
  * **Purchases choose their quota** (`expenses.quota_id`), in the entry sheet. A
    linked purchase stays outside the daily budget: the quota was already planned.
  * **Overspend hits the daily budget.** The part of a purchase beyond what is left
    in its quota counts in the daily allowance of the day it was made
    (`excess_between/3`, added by `BudgetDays` and `Periods` to the spent totals).
  * **Underspend goes to the next cycle.** The plan reserves a quota at its full
    value; what was not spent comes back once its invoice closes (see `CyclePlan`).

  **Legacy quotas** (`per_invoice: false`, every quota created before this model)
  keep the old rule untouched: their month is the calendar month, their spending
  is every expense of their subcategory in it, and a new purchase of that
  subcategory goes outside the daily budget by itself. No excess reaches the
  daily budget. Editing one (saving its form) moves it to the invoice model; old
  purchases are never rewritten.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Account, Bills, Invoices, RecurringBill}

  @doc "Active quotas of the group in the invoice model, with account and subcategory."
  def list(group_id) do
    RecurringBill
    |> where(
      [b],
      b.group_id == ^group_id and b.active == true and b.kind == "quota" and b.per_invoice == true
    )
    |> order_by([b], asc: b.name)
    |> preload([:account, subcategory: :category])
    |> Repo.all()
  end

  def legacy?(%RecurringBill{per_invoice: per_invoice}), do: not per_invoice

  def card?(%RecurringBill{per_invoice: true, account: %Account{kind: "credit_card"}}), do: true
  def card?(_quota), do: false

  @doc "The invoice (card) or calendar month whose quota a purchase dated `date` uses."
  def month_for(%RecurringBill{} = quota, %Date{} = date) do
    if card?(quota),
      do: Invoices.month_for(quota.account, date),
      else: {date.year, date.month}
  end

  @doc "First and last purchase day of the quota's `month`."
  def window(%RecurringBill{} = quota, {year, mon} = month) do
    if card?(quota) do
      {Invoices.start_date(quota.account, month),
       Date.add(Invoices.closing_date(quota.account, month), -1)}
    else
      first = Date.new!(year, mon, 1)
      {first, Date.end_of_month(first)}
    end
  end

  @doc "Quotas a purchase dated `date` can use: those with an occurrence in its month."
  def open_for(group_id, %Date{} = date) do
    group_id |> list() |> Enum.filter(&Bills.exists_in?(&1, month_for(&1, date)))
  end

  @doc "What the purchases linked to the quota add up to in `month`."
  def spent(%RecurringBill{per_invoice: false} = quota, {year, mon}) do
    # Legacy rule: every expense of the subcategory in the calendar month.
    from = Date.new!(year, mon, 1)
    to = Date.end_of_month(from)

    Expense
    |> where(
      [e],
      e.group_id == ^quota.group_id and e.subcategory_id == ^quota.subcategory_id and
        e.type == "expense" and e.date >= ^from and e.date <= ^to
    )
    |> select([e], sum(e.amount))
    |> Repo.one()
    |> Kernel.||(Decimal.new("0"))
  end

  def spent(%RecurringBill{} = quota, month) do
    {from, to} = window(quota, month)

    Expense
    |> where(
      [e],
      e.quota_id == ^quota.id and e.type == "expense" and e.date >= ^from and e.date <= ^to
    )
    |> select([e], sum(e.amount))
    |> Repo.one()
    |> Kernel.||(Decimal.new("0"))
  end

  @doc """
  The quota in `month`: planned (its amount), spent, what is left and what went
  beyond it.
  """
  def status(%RecurringBill{} = quota, month) do
    spent = spent(quota, month)
    {from, to} = window(quota, month)

    %{
      quota: quota,
      month: month,
      planned: quota.amount,
      spent: spent,
      remaining: Decimal.max(Decimal.sub(quota.amount, spent), Decimal.new("0")),
      excess: Decimal.max(Decimal.sub(spent, quota.amount), Decimal.new("0")),
      starts_on: from,
      ends_on: to
    }
  end

  @doc """
  Part of the group's quota purchases dated from `from` to `to` that went beyond
  their quota. Purchases fill a quota in date order (then by when they were
  typed): the one that crosses the limit counts only its excess, the next ones
  count whole. This money comes out of the daily budget. A linked purchase that
  already counts in the budget (one from before the quota was converted) fills
  the quota but adds no excess: it is in the daily budget once already.
  """
  def excess_between(group_id, %Date{} = from, %Date{} = to) do
    # A quota month spans at most a month, so the purchases before `from` that
    # share a month with one in the range are within the 40 days before it.
    lookback = Date.add(from, -40)

    group_id
    |> linked_purchases(lookback, to)
    |> Enum.group_by(fn {expense, quota} -> {quota.id, month_for(quota, expense.date)} end)
    |> Enum.flat_map(fn {_key, purchases} -> excess_per_purchase(purchases) end)
    |> Enum.filter(fn {expense, _excess} ->
      not expense.counts_in_budget and in_range?(expense.date, from, to)
    end)
    |> Enum.reduce(Decimal.new("0"), fn {_expense, excess}, acc -> Decimal.add(acc, excess) end)
  end

  defp linked_purchases(group_id, from, to) do
    Expense
    |> join(:inner, [e], q in RecurringBill, on: q.id == e.quota_id)
    |> where(
      [e, q],
      e.group_id == ^group_id and e.type == "expense" and e.date >= ^from and e.date <= ^to and
        q.active == true and q.kind == "quota" and q.per_invoice == true
    )
    |> select([e, q], {e, q})
    |> Repo.all()
    |> Enum.map(fn {e, q} -> {e, Repo.preload(q, :account)} end)
  end

  defp excess_per_purchase([{_e, quota} | _] = purchases) do
    purchases
    |> Enum.sort_by(fn {e, _q} -> {Date.to_gregorian_days(e.date), e.inserted_at, e.id} end)
    |> Enum.map_reduce(Decimal.new("0"), fn {e, _q}, used ->
      before = Decimal.max(Decimal.sub(quota.amount, used), Decimal.new("0"))
      excess = Decimal.max(Decimal.sub(e.amount, before), Decimal.new("0"))
      {{e, excess}, Decimal.add(used, e.amount)}
    end)
    |> elem(0)
  end

  @doc "Whether `quota_id` is an active invoice-model quota of the group."
  def valid?(_group_id, nil), do: true

  def valid?(group_id, quota_id) do
    RecurringBill
    |> where(
      [b],
      b.id == ^quota_id and b.group_id == ^group_id and b.kind == "quota" and b.active == true and
        b.per_invoice == true
    )
    |> Repo.exists?()
  end

  @doc """
  Whether an expense in `subcategory_id` falls in a legacy quota of the group:
  such purchases keep going outside the daily budget by themselves, as before.
  """
  def legacy_subcategory?(_group_id, nil), do: false

  def legacy_subcategory?(group_id, subcategory_id) do
    RecurringBill
    |> where(
      [b],
      b.group_id == ^group_id and b.active == true and b.kind == "quota" and
        b.per_invoice == false and b.subcategory_id == ^subcategory_id
    )
    |> Repo.exists?()
  end

  defp in_range?(date, from, to),
    do: Date.compare(date, from) != :lt and Date.compare(date, to) != :gt
end
