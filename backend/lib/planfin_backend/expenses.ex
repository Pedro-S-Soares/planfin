defmodule PlanfinBackend.Expenses do
  @moduledoc """
  The Expenses context. Expenses are scoped by group; each expense records
  `created_by_id` to preserve authorship when multiple users share a group.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Periods
  alias PlanfinBackend.Periods.BudgetDay

  @doc """
  Creates an entry owned by `group_id` and authored by `created_by_id`.

  Optional attrs beyond the expense fields:

    * `:account_id` — account/card the money moved through. Entries on an
      `allowance`, `reserve` or `benefit` account never count in the budget.
    * `:installments` — number of card installments (requires a credit card).
      The amount is the purchase total; it is split in equal parcels (the cent
      remainder goes to the first). Only the first parcel follows
      `counts_in_budget`; parcels 2..N are dated one month apart and are
      budget commitments of later cycles (`counts_in_budget: false`).
    * `:counts_in_budget` — `false` records a movement outside the daily/period
      budget; it needs no active period.

  Budget entries follow the original rules: the active period must exist and
  contain the date, and the entry is linked to its period and budget_day.
  Returns `{:ok, entry}` (the first parcel for installments).
  """
  def create_expense(group_id, created_by_id, attrs) do
    attrs = atomize(attrs)
    installments = Map.get(attrs, :installments) || 1

    with {:ok, account} <- fetch_account(group_id, Map.get(attrs, :account_id)),
         :ok <- validate_installments(installments, account) do
      counts_in_budget = counts_in_budget?(Map.get(attrs, :counts_in_budget, true), account)
      options = Map.take(attrs, [:first_invoice, :amount_per_installment, :today])

      attrs =
        attrs
        |> Map.drop([:installments, :first_invoice, :amount_per_installment, :today])
        |> Map.put(:counts_in_budget, counts_in_budget)

      if installments > 1 do
        create_installments(group_id, created_by_id, attrs, installments, account, options)
      else
        create_single(group_id, created_by_id, attrs)
      end
    end
  end

  defp create_single(group_id, created_by_id, %{counts_in_budget: true} = attrs) do
    date = attrs[:date]

    with {:ok, period} <- get_active_period_or_error(group_id),
         :ok <- validate_date_in_range(date, period),
         {:ok, budget_day} <- get_or_create_budget_day(period, date),
         {:ok, expense} <-
           insert_expense(group_id, created_by_id, period.id, budget_day.id, attrs) do
      {:ok, preload_entry(expense)}
    end
  end

  defp create_single(group_id, created_by_id, attrs) do
    case insert_expense(group_id, created_by_id, nil, nil, attrs) do
      {:ok, expense} -> {:ok, preload_entry(expense)}
      error -> error
    end
  end

  # Card purchase in `count` parcels. Parcel k lands on the invoice
  # `first_invoice + k - 1` (default: the invoice of the purchase date).
  # Parcels on invoices already due before `today` were paid outside the app
  # and are not created; the rest keep their real numbering (k/N).
  # Only parcel 1 of a purchase made in the current invoice can count in the
  # daily budget; a retroactive purchase stays entirely outside it.
  defp create_installments(group_id, created_by_id, attrs, count, card, options) do
    alias PlanfinBackend.Finance.{Calendar, Invoices}

    today = Map.get(options, :today) || Date.utc_today()
    date_invoice = Invoices.month_for(card, attrs[:date])
    first_invoice = Map.get(options, :first_invoice) || date_invoice
    retroactive? = first_invoice != date_invoice

    base_date =
      if retroactive?, do: Invoices.start_date(card, first_invoice), else: attrs[:date]

    amounts =
      parcel_amounts(attrs[:amount], count, Map.get(options, :amount_per_installment, false))

    group_uuid = Ecto.UUID.generate()

    numbers =
      Enum.filter(1..count, fn number ->
        invoice = Calendar.add_months(first_invoice, number - 1)
        Date.compare(Invoices.due_date(card, invoice), today) != :lt
      end)

    if numbers == [] do
      {:error, :all_installments_past}
    else
      Repo.transaction(fn ->
        parcels =
          for number <- numbers do
            parcel_attrs =
              attrs
              |> Map.put(:amount, Enum.at(amounts, number - 1))
              |> Map.put(:date, Calendar.shift_date(base_date, number - 1))
              |> Map.put(:installment_group_id, group_uuid)
              |> Map.put(:installment_number, number)
              |> Map.put(:installment_count, count)
              |> Map.put(
                :counts_in_budget,
                number == 1 and not retroactive? and attrs[:counts_in_budget]
              )

            case create_single(group_id, created_by_id, parcel_attrs) do
              {:ok, parcel} -> parcel
              {:error, reason} -> Repo.rollback(reason)
            end
          end

        hd(parcels)
      end)
    end
  end

  # Equal parcels; when splitting a total the cent remainder goes to parcel 1.
  defp parcel_amounts(amount, count, true = _per_installment),
    do: List.duplicate(Decimal.round(amount, 2), count)

  defp parcel_amounts(total, count, _per_installment) do
    total_cents = total |> Decimal.mult(100) |> Decimal.round(0) |> Decimal.to_integer()
    base = div(total_cents, count)
    remainder = rem(total_cents, count)

    for number <- 1..count do
      cents = if number == 1, do: base + remainder, else: base
      Decimal.div(Decimal.new(cents), 100) |> Decimal.round(2)
    end
  end

  @doc """
  Parcels of the installment purchase `expense` belongs to, ordered by number
  (an anticipation entry, without number, comes last).
  """
  def list_installments(group_id, expense_id) do
    with %Expense{installment_group_id: group_uuid} when not is_nil(group_uuid) <-
           Repo.get_by(Expense, id: expense_id, group_id: group_id) do
      Expense
      |> where([e], e.group_id == ^group_id and e.installment_group_id == ^group_uuid)
      |> order_by([e], asc_nulls_last: e.installment_number, asc: e.date)
      |> preload([:created_by, :account, subcategory: :category])
      |> Repo.all()
    else
      _ -> []
    end
  end

  @doc """
  Anticipates the parcels after `expense_id` (k/N): parcels k+1..N are replaced
  by a single entry on the same date (same invoice) as parcel k. `amount`
  defaults to their sum; a smaller one records the anticipation discount.
  Returns `{:ok, entry}`.
  """
  def anticipate_installments(group_id, user_id, expense_id, amount \\ nil) do
    with %Expense{installment_number: number, installment_group_id: group_uuid} = parcel
         when is_integer(number) <- Repo.get_by(Expense, id: expense_id, group_id: group_id),
         [_ | _] = later <- later_parcels(group_id, group_uuid, number),
         sum = Enum.reduce(later, Decimal.new("0"), &Decimal.add(&2, &1.amount)),
         amount = amount || sum,
         :ok <- validate_anticipation(amount) do
      last = List.last(later)
      range = "#{number + 1}–#{last.installment_count}/#{last.installment_count}"

      note =
        Enum.join(
          Enum.reject(["Antecipação das parcelas #{range}", parcel.note], &is_nil/1),
          " · "
        )

      Repo.transaction(fn ->
        later_ids = Enum.map(later, & &1.id)
        Repo.delete_all(from(e in Expense, where: e.id in ^later_ids))

        case insert_expense(group_id, user_id, nil, nil, %{
               amount: amount,
               date: parcel.date,
               type: "expense",
               note: note,
               account_id: parcel.account_id,
               subcategory_id: parcel.subcategory_id,
               counts_in_budget: false,
               installment_group_id: group_uuid,
               source: "anticipation"
             }) do
          {:ok, entry} -> preload_entry(entry)
          {:error, reason} -> Repo.rollback(reason)
        end
      end)
    else
      nil -> {:error, :not_found}
      %Expense{} -> {:error, :not_an_installment}
      [] -> {:error, :nothing_to_anticipate}
      {:error, reason} -> {:error, reason}
    end
  end

  defp later_parcels(group_id, group_uuid, number) do
    Expense
    |> where(
      [e],
      e.group_id == ^group_id and e.installment_group_id == ^group_uuid and
        e.installment_number > ^number
    )
    |> order_by([e], asc: e.installment_number)
    |> Repo.all()
  end

  defp validate_anticipation(amount) do
    if Decimal.compare(amount, 0) == :gt, do: :ok, else: {:error, :invalid_amount}
  end

  defp validate_installments(1, _account), do: :ok

  defp validate_installments(n, %{kind: "credit_card"}) when is_integer(n) and n >= 2 and n <= 48,
    do: :ok

  defp validate_installments(n, _account) when is_integer(n) and n >= 2,
    do: {:error, :installments_require_card}

  defp validate_installments(_n, _account), do: {:error, :invalid_installments}

  defp counts_in_budget?(_requested, %{kind: kind})
       when kind in ["allowance", "reserve", "benefit"],
       do: false

  defp counts_in_budget?(false, _account), do: false
  defp counts_in_budget?(_requested, _account), do: true

  defp fetch_account(_group_id, nil), do: {:ok, nil}

  defp fetch_account(group_id, account_id) do
    case Repo.get_by(PlanfinBackend.Finance.Account, id: account_id, group_id: group_id) do
      nil -> {:error, :account_not_found}
      account -> {:ok, account}
    end
  end

  defp atomize(attrs) do
    Map.new(attrs, fn
      {k, v} when is_binary(k) -> {String.to_existing_atom(k), v}
      pair -> pair
    end)
  end

  defp preload_entry(expense) do
    Repo.preload(expense, [:created_by, :account, subcategory: :category], force: true)
  end

  @doc """
  Updates an expense that belongs to the given group. Any member of the group
  may update any expense — authorship (`created_by_id`) is preserved.

  Allowed fields: amount, date, note, subcategory_id.
  If the date changes, re-links to the correct budget_day.
  """
  def update_expense(group_id, expense_id, attrs) do
    case Repo.get_by(Expense, id: expense_id, group_id: group_id) do
      nil ->
        {:error, :not_found}

      expense ->
        with {:ok, account} <- fetch_new_account(group_id, attrs),
             {:ok, attrs} <- budget_link_attrs(expense, attrs, account) do
          expense
          |> Expense.changeset(attrs)
          |> Repo.update()
          |> case do
            {:ok, updated} -> {:ok, preload_entry(updated)}
            {:error, changeset} -> {:error, changeset}
          end
        end
    end
  end

  defp fetch_new_account(group_id, attrs) do
    if Map.has_key?(attrs, :account_id),
      do: fetch_account(group_id, attrs.account_id),
      else: {:ok, :unchanged}
  end

  # Budget entries must stay inside their period and keep the right budget_day;
  # moving one to an allowance/reserve account takes it out of the budget.
  defp budget_link_attrs(%Expense{counts_in_budget: true} = expense, attrs, account) do
    expense = Repo.preload(expense, :period)
    new_date = Map.get(attrs, :date, expense.date)

    cond do
      match?(%{kind: kind} when kind in ["allowance", "reserve", "benefit"], account) ->
        {:ok, Map.merge(attrs, %{counts_in_budget: false, period_id: nil, budget_day_id: nil})}

      is_nil(expense.period) ->
        {:ok, attrs}

      true ->
        with :ok <- validate_date_in_range(new_date, expense.period),
             {:ok, budget_day} <- get_or_create_budget_day(expense.period, new_date) do
          {:ok, Map.put(attrs, :budget_day_id, budget_day.id)}
        end
    end
  end

  defp budget_link_attrs(_expense, attrs, _account), do: {:ok, attrs}

  @doc """
  Deletes an expense that belongs to the given group. Deleting any parcel of an
  installment purchase deletes the whole purchase (all its parcels).

  Returns `{:ok, expense}` on success, `{:error, :not_found}` if the expense
  does not exist or belongs to a different group.
  """
  def delete_expense(group_id, expense_id) do
    case Repo.get_by(Expense, id: expense_id, group_id: group_id) do
      nil ->
        {:error, :not_found}

      %Expense{installment_group_id: nil} = expense ->
        Repo.delete(expense)

      %Expense{installment_group_id: installment_group_id} = expense ->
        Expense
        |> where([e], e.group_id == ^group_id and e.installment_group_id == ^installment_group_id)
        |> Repo.delete_all()

        {:ok, expense}
    end
  end

  @doc """
  Moves every entry of the group without an account, dated on or after
  `from_date`, to `account_id`. Used once when the user starts tracking
  accounts, so the purchases already logged land on the card's invoice.
  Returns `{:ok, count}`.
  """
  def assign_unassigned_to_account(group_id, account_id, %Date{} = from_date) do
    with {:ok, %{} = _account} <- fetch_account(group_id, account_id) do
      {count, _} =
        Expense
        |> where(
          [e],
          e.group_id == ^group_id and is_nil(e.account_id) and e.date >= ^from_date
        )
        |> Repo.update_all(set: [account_id: account_id])

      {:ok, count}
    end
  end

  @doc """
  Lists expenses for the given budget_day in the given group, ordered by
  inserted_at descending. Preloads created_by and subcategory with category.
  """
  def list_expenses_by_day(group_id, budget_day_id) do
    Expense
    |> where([e], e.budget_day_id == ^budget_day_id and e.group_id == ^group_id)
    |> order_by([e], desc: e.inserted_at)
    |> preload([:created_by, subcategory: :category])
    |> Repo.all()
  end

  @doc """
  Lists every entry of the group dated within the period, grouped by date —
  budget entries and movements outside the budget (installments, bills,
  salary) alike, so the history matches the bank statement.

  Returns a list of maps `%{date: ~D[...], expenses: [...], total: Decimal}`,
  ordered by date descending. `total` is the day's net result (income minus
  expenses), so a day with only spending has a negative total.
  """
  def list_expenses_by_period(group_id, period_id) do
    case Repo.get_by(PlanfinBackend.Periods.Period, id: period_id, group_id: group_id) do
      nil -> []
      period -> group_by_day(list_entries_between(group_id, period.start_date, period.end_date))
    end
  end

  defp list_entries_between(group_id, from, to) do
    Expense
    |> where([e], e.group_id == ^group_id and e.date >= ^from and e.date <= ^to)
    |> order_by([e], desc: e.date, desc: e.inserted_at)
    |> preload([:created_by, :account, subcategory: :category])
    |> Repo.all()
  end

  defp group_by_day(expenses) do
    expenses
    |> Enum.group_by(& &1.date)
    |> Enum.sort_by(fn {date, _} -> date end, {:desc, Date})
    |> Enum.map(fn {date, day_expenses} ->
      total =
        Enum.reduce(day_expenses, Decimal.new("0"), fn e, acc ->
          case e.type do
            "income" -> Decimal.add(acc, e.amount)
            _ -> Decimal.sub(acc, e.amount)
          end
        end)

      %{date: date, expenses: day_expenses, total: total}
    end)
  end

  @max_range_days 400

  @doc """
  Lists the group's expenses of `type` dated between `from` and `to`
  (inclusive), regardless of period, ordered oldest first. Preloads
  created_by and subcategory. Used by the analytics dashboard.

  Returns `{:error, :invalid_range}` when `from` is after `to` or the range
  spans more than #{@max_range_days} days.
  """
  def list_expenses_in_range(group_id, %Date{} = from, %Date{} = to, type \\ "expense") do
    days = Date.diff(to, from)

    if days < 0 or days > @max_range_days do
      {:error, :invalid_range}
    else
      expenses =
        Expense.in_budget()
        |> where([e], e.group_id == ^group_id and e.type == ^type)
        |> where([e], e.date >= ^from and e.date <= ^to)
        |> order_by([e], asc: e.date, asc: e.inserted_at)
        |> preload([:created_by, :subcategory])
        |> Repo.all()

      {:ok, expenses}
    end
  end

  @doc """
  Gets a single expense for the group. Raises `Ecto.NoResultsError` if not
  found or does not belong to the group.
  """
  def get_expense!(group_id, expense_id) do
    Expense
    |> where([e], e.id == ^expense_id and e.group_id == ^group_id)
    |> Repo.one!()
  end

  # --- Private helpers ---

  defp get_active_period_or_error(group_id) do
    case Periods.get_active_period(group_id) do
      {:ok, nil} -> {:error, :no_active_period}
      {:ok, period} -> {:ok, period}
    end
  end

  defp validate_date_in_range(date, period) do
    if Date.compare(date, period.start_date) in [:gt, :eq] and
         Date.compare(date, period.end_date) in [:lt, :eq] do
      :ok
    else
      {:error, :date_out_of_range}
    end
  end

  defp get_or_create_budget_day(period, date) do
    case Repo.get_by(BudgetDay, period_id: period.id, date: date) do
      %BudgetDay{} = bd ->
        {:ok, bd}

      nil ->
        %BudgetDay{}
        |> BudgetDay.changeset(%{
          period_id: period.id,
          date: date,
          daily_limit: period.daily_limit,
          carryover: Decimal.new("0")
        })
        |> Repo.insert()
    end
  end

  defp insert_expense(group_id, created_by_id, period_id, budget_day_id, attrs) do
    %Expense{}
    |> Expense.changeset(
      attrs
      |> Map.put(:group_id, group_id)
      |> Map.put(:created_by_id, created_by_id)
      |> Map.put(:period_id, period_id)
      |> Map.put(:budget_day_id, budget_day_id)
    )
    |> Repo.insert()
  end
end
