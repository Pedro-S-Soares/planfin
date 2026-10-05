defmodule PlanfinBackend.Finance.Allowance do
  @moduledoc """
  Monthly allowance for the couple.

  The allowance is the month's left over from `MonthPlan` (balance + salary
  still to come + expected income − invoices − boletos until the eve of next
  month's salary), capped by what is in the primary account right now: money
  that has not arrived yet can't be transferred. When positive it is split
  equally between the allowance accounts and moved there out of the primary
  account. There is no mandatory reserve. Distribution is offered in the last
  3 days before the next salary (the month closing); a negative left over is
  shown as the shortfall.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Finance, Repo}
  alias PlanfinBackend.Finance.{MonthPlan, Salary, Transfer}

  @closing_days 3

  def build(group_id, today) do
    primary = Finance.get_primary_account(group_id)
    balance = if primary, do: Finance.account_balance(primary, today), else: Decimal.new("0")

    {leftover, cycle_start, cycle_end} =
      case MonthPlan.build(group_id, today) do
        {:ok, plan} ->
          cycle = Salary.cycle(group_id, today)
          {plan.current.leftover, cycle.start_date, cycle.end_date}

        {:error, _} ->
          {Decimal.new("0"), Date.beginning_of_month(today), Date.end_of_month(today)}
      end

    amount =
      leftover
      |> Decimal.min(balance)
      |> Decimal.max(Decimal.new("0"))
      |> Decimal.round(2, :down)

    shortfall = leftover |> Decimal.negate() |> Decimal.max(Decimal.new("0"))
    accounts = allowance_accounts(group_id)
    shares = split(amount, length(accounts))
    distributable_from = Date.add(cycle_end, -(@closing_days - 1))

    %{
      cycle_end_date: cycle_end,
      opens_on: distributable_from,
      free: leftover,
      shortfall: shortfall,
      amount: amount,
      can_distribute:
        accounts != [] and primary != nil and Decimal.compare(amount, 0) == :gt and
          Date.compare(today, distributable_from) != :lt,
      distributed: distributed_between(group_id, cycle_start, cycle_end),
      primary_account_id: primary && primary.id,
      shares:
        Enum.zip_with(accounts, shares, fn account, share ->
          %{account: account, amount: share}
        end)
    }
  end

  @doc """
  Moves the allowance from the primary account to each allowance account in
  equal parts. `amount` defaults to the computed left over and can't exceed it.
  """
  def distribute(group_id, user_id, today, amount \\ nil) do
    plan = build(group_id, today)
    amount = amount || plan.amount

    cond do
      not plan.can_distribute ->
        {:error, :not_available}

      Decimal.compare(amount, plan.amount) == :gt or Decimal.compare(amount, 0) != :gt ->
        {:error, :invalid_amount}

      true ->
        shares = split(amount, length(plan.shares))

        Repo.transaction(fn ->
          plan.shares
          |> Enum.zip(shares)
          |> Enum.each(fn {%{account: account}, share} ->
            case Finance.create_transfer(group_id, user_id, %{
                   from_account_id: plan.primary_account_id,
                   to_account_id: account.id,
                   amount: share,
                   date: today,
                   kind: "allowance",
                   note: "Mesada"
                 }) do
              {:ok, _} -> :ok
              {:error, reason} -> Repo.rollback(reason)
            end
          end)

          build(group_id, today)
        end)
    end
  end

  @doc "Reserve goal and how much the reserve accounts hold today."
  def reserve_status(group_id, today) do
    goal = Salary.get_settings(group_id).reserve_goal

    total =
      group_id
      |> Finance.list_accounts()
      |> Enum.filter(&(&1.kind == "reserve"))
      |> Enum.reduce(Decimal.new("0"), &Decimal.add(&2, Finance.account_balance(&1, today)))

    %{goal: goal, total: total}
  end

  defp allowance_accounts(group_id) do
    group_id
    |> Finance.list_accounts()
    |> Enum.filter(&(&1.kind == "allowance"))
    |> Enum.sort_by(& &1.inserted_at, NaiveDateTime)
  end

  # Equal parts in cents; the remainder goes to the first ones.
  defp split(_amount, 0), do: []

  defp split(amount, n) do
    cents = amount |> Decimal.mult(100) |> Decimal.round(0, :down) |> Decimal.to_integer()
    base = div(cents, n)
    extra = rem(cents, n)

    for i <- 0..(n - 1) do
      Decimal.div(Decimal.new(base + if(i < extra, do: 1, else: 0)), 100) |> Decimal.round(2)
    end
  end

  defp distributed_between(group_id, from, to) do
    Transfer
    |> where(
      [t],
      t.group_id == ^group_id and t.kind == "allowance" and t.date >= ^from and t.date <= ^to
    )
    |> select([t], sum(t.amount))
    |> Repo.one()
    |> Kernel.||(Decimal.new("0"))
  end
end
