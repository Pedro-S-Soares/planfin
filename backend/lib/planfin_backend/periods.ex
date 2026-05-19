defmodule PlanfinBackend.Periods do
  @moduledoc """
  The Periods context. Periods are scoped by group.
  """

  import Ecto.Query, warn: false
  alias PlanfinBackend.Repo

  alias PlanfinBackend.Periods.{Period, BudgetDay}
  alias PlanfinBackend.Expenses.Expense

  @doc """
  Creates a period for the given group.

  When `start_date` is today or in the future, creates a single BudgetDay for
  `start_date` with carryover=0.

  When `start_date` is in the past, retroactively generates BudgetDays for every
  day from `start_date` up to `min(end_date, today)`. Carryover is calculated
  sequentially:

    carryover(day_N) = max(0, daily_limit + carryover(day_N-1) - total_spent(day_N-1))

  The first day (start_date) always has carryover=0.

  All inserts happen inside a transaction. If a BudgetDay for a given
  (period_id, date) already exists it is skipped (on_conflict: :nothing).

  Multiple active periods per group are allowed.
  """
  def create_period(group_id, attrs, today \\ Date.utc_today()) do
    Repo.transaction(fn ->
      with {:ok, period} <- insert_period(group_id, attrs),
           :ok <- generate_budget_days(period, today) do
        period
      else
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
  end

  defp insert_period(group_id, attrs) do
    %Period{}
    |> Period.changeset(Map.put(attrs, :group_id, group_id))
    |> Repo.insert()
  end

  # Generates BudgetDays from start_date up to min(end_date, today).
  #
  # - start_date today or in the future  → create a single BudgetDay for start_date
  # - start_date in the past             → create BudgetDays for every day from
  #                                        start_date to min(end_date, today),
  #                                        computing carryover sequentially
  defp generate_budget_days(period, today) do
    cmp = Date.compare(period.start_date, today)

    if cmp == :gt do
      # start_date is in the future — create exactly one BudgetDay for start_date
      insert_budget_day_if_missing(period, period.start_date, Decimal.new("0"))
      |> case do
        {:ok, _} -> :ok
        {:error, reason} -> {:error, reason}
      end
    else
      # start_date is today or in the past — generate all days up to min(end_date, today)
      last_day = earlier_date(period.end_date, today)
      dates = Date.range(period.start_date, last_day)

      Enum.reduce_while(dates, {Decimal.new("0"), :ok}, fn date, {carryover, _} ->
        case insert_budget_day_if_missing(period, date, carryover) do
          {:ok, _} ->
            next_carryover = compute_next_carryover(period, date, carryover)
            {:cont, {next_carryover, :ok}}

          {:error, reason} ->
            {:halt, {Decimal.new("0"), {:error, reason}}}
        end
      end)
      |> elem(1)
    end
  end

  # Inserts a BudgetDay for (period_id, date) if none exists yet.
  defp insert_budget_day_if_missing(period, date, carryover) do
    %BudgetDay{}
    |> BudgetDay.changeset(%{
      period_id: period.id,
      date: date,
      daily_limit: period.daily_limit,
      carryover: carryover
    })
    |> Repo.insert(on_conflict: :nothing, conflict_target: [:period_id, :date])
  end

  # carryover for the NEXT day = max(0, daily_limit + current_carryover - spent_today)
  defp compute_next_carryover(period, date, current_carryover) do
    total_spent = get_total_spent_for_day(period.group_id, date)

    raw =
      period.daily_limit
      |> Decimal.add(current_carryover)
      |> Decimal.sub(total_spent)

    if Decimal.compare(raw, Decimal.new("0")) == :lt do
      Decimal.new("0")
    else
      raw
    end
  end

  defp get_total_spent_for_day(group_id, date) do
    base_query =
      Expense
      |> where([e], e.group_id == ^group_id and e.date == ^date and e.is_extra == false)

    total_expenses =
      base_query
      |> where([e], e.type == "expense")
      |> select([e], sum(e.amount))
      |> Repo.one()

    total_income =
      base_query
      |> where([e], e.type == "income")
      |> select([e], sum(e.amount))
      |> Repo.one()

    (total_expenses || Decimal.new("0"))
    |> Decimal.sub(total_income || Decimal.new("0"))
  end

  # Returns the earlier of two dates.
  defp earlier_date(date_a, date_b) do
    if Date.compare(date_a, date_b) == :lt, do: date_a, else: date_b
  end

  @doc """
  Returns `{:ok, period}` with budget_days preloaded if the group has an active
  period, or `{:ok, nil}` otherwise.
  """
  def get_active_period(group_id) do
    period =
      Period
      |> where([p], p.group_id == ^group_id and p.status == "active")
      |> order_by([p], desc: p.inserted_at)
      |> limit(1)
      |> preload(:budget_days)
      |> Repo.one()

    {:ok, period}
  end

  def preload_budget_days(period), do: {:ok, Repo.preload(period, :budget_days)}

  @doc """
  Returns `{:ok, period}` if the period belongs to the group, or
  `{:error, :not_found}` otherwise.
  """
  def get_period(group_id, period_id) do
    case Repo.get_by(Period, id: period_id, group_id: group_id) do
      nil -> {:error, :not_found}
      period -> {:ok, period}
    end
  end

  @doc """
  Updates daily_limit and/or total_budget of an active period.

  Returns `{:ok, period}` or `{:error, changeset}`.
  """
  def update_period(%Period{} = period, attrs) do
    period
    |> Period.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Closes a period by setting its status to "closed".
  """
  def close_period(%Period{} = period) do
    period
    |> Period.changeset(%{status: "closed"})
    |> Repo.update()
  end

  @doc """
  Abandons a period by setting its status to "abandoned".
  """
  def abandon_period(%Period{} = period) do
    period
    |> Period.changeset(%{status: "abandoned"})
    |> Repo.update()
  end

  @doc """
  Returns a summary map for a period with:
  - `total_budgeted`: daily_limit * number of days in the period
  - `total_spent`: sum of all expenses for the period
  - `difference`: total_budgeted - total_spent
  - `days_count`: number of days in the period
  """
  def get_period_summary(%Period{} = period) do
    days_count = Date.diff(period.end_date, period.start_date) + 1

    total_budgeted =
      Decimal.mult(period.daily_limit, Decimal.new(days_count))

    total_spent = get_total_spent(period)

    difference = Decimal.sub(total_budgeted, total_spent)

    %{
      total_budgeted: total_budgeted,
      total_spent: total_spent,
      difference: difference,
      days_count: days_count
    }
  end

  defp get_total_spent(%Period{} = period) do
    base_query =
      Expense
      |> where(
        [e],
        e.group_id == ^period.group_id and
          e.date >= ^period.start_date and
          e.date <= ^period.end_date
      )

    total_expenses =
      base_query
      |> where([e], e.type == "expense")
      |> select([e], sum(e.amount))
      |> Repo.one()

    total_income =
      base_query
      |> where([e], e.type == "income")
      |> select([e], sum(e.amount))
      |> Repo.one()

    (total_expenses || Decimal.new("0"))
    |> Decimal.sub(total_income || Decimal.new("0"))
  end

  @doc """
  Lists all periods for a group ordered by start_date descending.
  """
  def list_periods(group_id) do
    Period
    |> where([p], p.group_id == ^group_id)
    |> order_by([p], desc: p.start_date)
    |> Repo.all()
  end
end
