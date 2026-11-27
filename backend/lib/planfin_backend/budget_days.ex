defmodule PlanfinBackend.BudgetDays do
  @moduledoc """
  Context for managing budget days within a period.

  Handles carryover calculation, cascade closing of past days,
  and the abandon logic when a period has been left unattended too long.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Periods
  alias PlanfinBackend.Periods.BudgetDay
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.Quotas

  @cascade_abandon_threshold_days 60

  @doc """
  Closes all open budget_days whose date is before today, in ascending date order.

  If the oldest unclosed past day is more than #{@cascade_abandon_threshold_days} days ago,
  the period is abandoned and `{:abandoned, period}` is returned.

  Otherwise, each day is closed in sequence with carryover propagated to the next day.

  Returns `{:ok, period}` when all past days are closed (or there were none to close).
  """
  def close_past_days(period, today \\ Date.utc_today()) do
    open_past_days =
      BudgetDay
      |> where([bd], bd.period_id == ^period.id and is_nil(bd.closed_at) and bd.date < ^today)
      |> order_by([bd], asc: bd.date)
      |> Repo.all()

    case open_past_days do
      [] ->
        {:ok, period}

      [oldest | _] ->
        gap = Date.diff(today, oldest.date)

        if gap > @cascade_abandon_threshold_days do
          {:ok, abandoned_period} = Periods.abandon_period(period)
          {:abandoned, abandoned_period}
        else
          Enum.each(open_past_days, fn bd -> close_day(bd, period) end)
          {:ok, period}
        end
    end
  end

  @doc """
  Returns the budget_day for today in the given period.
  If none exists, creates one with `daily_limit = period.daily_limit` and `carryover = 0`.

  Returns `{:ok, budget_day}`.
  """
  def get_or_create_today(period, today \\ Date.utc_today()) do
    case Repo.get_by(BudgetDay, period_id: period.id, date: today) do
      %BudgetDay{} = bd ->
        {:ok, bd}

      nil ->
        # Requests arriving together may all miss the row: the first insert wins and the
        # others read the row it created, instead of failing on the unique index.
        %BudgetDay{}
        |> BudgetDay.changeset(%{
          period_id: period.id,
          date: today,
          daily_limit: period.daily_limit,
          carryover: Decimal.new("0")
        })
        |> Repo.insert(on_conflict: :nothing, conflict_target: [:period_id, :date])
        |> case do
          # On a conflict nothing is written but the struct keeps its client-side id: read the stored row.
          {:ok, _} -> {:ok, Repo.get_by!(BudgetDay, period_id: period.id, date: today)}
          error -> error
        end
    end
  end

  @doc """
  Calculates the available balance for a budget_day.

  Formula: `daily_limit + carryover - sum(expenses WHERE group_id = G AND date = D)`

  Queries expenses by `group_id` and `date` rather than relying on a preloaded
  `budget_day.expenses` association. The `group_id` is resolved from the period
  that owns this budget_day, so `budget_day.period` must be preloaded (or the
  `period` struct passed explicitly via `available_balance/2`).

  Used internally for carryover propagation when closing days.
  """
  def available_balance(%BudgetDay{period: %{group_id: group_id}} = budget_day) do
    total_spent = get_total_spent_for_day(group_id, budget_day.date)

    budget_day.daily_limit
    |> Decimal.add(budget_day.carryover)
    |> Decimal.sub(total_spent)
  end

  @doc """
  Calculates the available balance for a budget_day given an explicit `group_id`.

  Use this overload when the `budget_day.period` association is not preloaded.
  """
  def available_balance(%BudgetDay{} = budget_day, group_id) do
    total_spent = get_total_spent_for_day(group_id, budget_day.date)

    budget_day.daily_limit
    |> Decimal.add(budget_day.carryover)
    |> Decimal.sub(total_spent)
  end

  @doc """
  Computes the available balance for today without relying on the stored carryover.

  Uses a live DB query to sum all expenses for the group up to and including `today`,
  so retroactive edits to past days are always reflected correctly.

  Formula: `period.daily_limit × days_elapsed - sum(expenses where group_id = G and date ≤ today)`

  Filters by `group_id + date` instead of `period_id` so that the query correctly
  reflects the group's actual spending regardless of which period each expense was
  originally recorded in.
  """
  def compute_today_balance(period, today \\ Date.utc_today()) do
    days_elapsed = Date.diff(today, period.start_date) + 1
    total_budget = Decimal.mult(period.daily_limit, Decimal.new(days_elapsed))

    # Only regular (non-extra) entries count toward the daily balance.
    # Filter by group_id and date range instead of period_id.
    base_query =
      Expense.in_budget()
      |> where(
        [e],
        e.group_id == ^period.group_id and
          e.date >= ^period.start_date and
          e.date <= ^today and
          e.is_extra == false
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

    total_budget
    |> Decimal.sub(total_expenses || Decimal.new("0"))
    |> Decimal.add(total_income || Decimal.new("0"))
    |> Decimal.sub(Quotas.excess_between(period.group_id, period.start_date, today))
  end

  @doc """
  Computes the remaining total budget for a period.

  Formula: `period.total_budget - sum(all expenses WHERE group_id = G AND date IN period range)`

  Both regular and extra expenses reduce the total budget.
  Filters by `group_id + date range` instead of `period_id`.
  """
  def compute_remaining_total(period) do
    # Both regular and extra entries affect the total budget.
    base_query =
      Expense.in_budget()
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

    period.total_budget
    |> Decimal.sub(total_expenses || Decimal.new("0"))
    |> Decimal.add(total_income || Decimal.new("0"))
    |> Decimal.sub(Quotas.excess_between(period.group_id, period.start_date, period.end_date))
  end

  @doc """
  Computes the extra budget of a period and how much of it was consumed.

  The extra budget is the part of `total_budget` beyond `daily_limit × period days`.
  Extra expenses consume it and extra income gives it back; regular entries never touch it.

  Returns `%{budget: Decimal, spent: Decimal, remaining: Decimal}`.
  """
  def compute_extra(period) do
    days = Date.diff(period.end_date, period.start_date) + 1
    budget = Decimal.sub(period.total_budget, Decimal.mult(period.daily_limit, Decimal.new(days)))

    base_query =
      Expense.in_budget()
      |> where(
        [e],
        e.group_id == ^period.group_id and
          e.date >= ^period.start_date and
          e.date <= ^period.end_date and
          e.is_extra == true
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

    spent =
      (total_expenses || Decimal.new("0"))
      |> Decimal.sub(total_income || Decimal.new("0"))

    %{budget: budget, spent: spent, remaining: Decimal.sub(budget, spent)}
  end

  @doc false
  # Closes a single budget_day and carries its balance into the next day (if the next
  # day is still in the period).
  #
  # Idempotent under concurrency: several activePeriod queries arrive together when the
  # app opens and all try to close the same past day. The day row is locked and
  # re-read inside a transaction, so only the first request closes it and the others see
  # it closed and change nothing; the next day is upserted on (period_id, date). The
  # carryover is always recomputed from the day itself, never added to, so money is
  # never counted twice. Returns the closed day.
  def close_day(%BudgetDay{} = budget_day, period) do
    {:ok, closed} =
      Repo.transaction(fn ->
        locked =
          BudgetDay
          |> where([bd], bd.id == ^budget_day.id)
          |> lock("FOR UPDATE")
          |> Repo.one!()

        if locked.closed_at, do: locked, else: do_close_day(locked, period)
      end)

    closed
  end

  defp do_close_day(%BudgetDay{} = budget_day, period) do
    # Uses group_id + date instead of budget_day_id to find related expenses.
    total_spent = get_total_spent_for_day(period.group_id, budget_day.date)

    carryover =
      budget_day.daily_limit
      |> Decimal.add(budget_day.carryover)
      |> Decimal.sub(total_spent)

    next_date = Date.add(budget_day.date, 1)

    if Date.compare(next_date, period.end_date) != :gt do
      %BudgetDay{}
      |> BudgetDay.changeset(%{
        period_id: period.id,
        date: next_date,
        daily_limit: budget_day.daily_limit,
        carryover: carryover
      })
      |> Repo.insert!(
        on_conflict: [set: [carryover: carryover, updated_at: NaiveDateTime.utc_now(:second)]],
        conflict_target: [:period_id, :date]
      )
    end

    budget_day
    |> BudgetDay.changeset(%{closed_at: DateTime.utc_now()})
    |> Repo.update!()
  end

  @doc """
  Net regular spending of the group on `date`: regular expenses minus regular income.

  Extra entries are excluded, matching the daily balance. What a purchase spent
  beyond its quota counts too (see `Finance.Quotas`). Always computed live, so
  it stays correct when entries are logged or edited after the day was closed.
  """
  def get_total_spent_for_day(group_id, date) do
    base_query =
      Expense.in_budget()
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
    |> Decimal.add(Quotas.excess_between(group_id, date, date))
  end
end
