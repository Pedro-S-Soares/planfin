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
        %BudgetDay{}
        |> BudgetDay.changeset(%{
          period_id: period.id,
          date: today,
          daily_limit: period.daily_limit,
          carryover: Decimal.new("0")
        })
        |> Repo.insert()
    end
  end

  @doc """
  Calculates the available balance for a budget_day.

  Formula: `daily_limit + carryover - sum(expenses)`

  Expects `budget_day.expenses` to be preloaded.
  """
  def available_balance(%BudgetDay{} = budget_day) do
    total_spent =
      budget_day.expenses
      |> Enum.reduce(Decimal.new("0"), fn expense, acc ->
        Decimal.add(acc, expense.amount)
      end)

    budget_day.daily_limit
    |> Decimal.add(budget_day.carryover)
    |> Decimal.sub(total_spent)
  end

  # Closes a single budget_day and propagates carryover to the next day
  # if the next day falls within the period and doesn't already exist.
  defp close_day(%BudgetDay{} = budget_day, period) do
    # Compute carryover: daily_limit + carryover - sum(expenses for this day)
    total_spent = get_total_spent_for_day(budget_day.id)

    carryover =
      budget_day.daily_limit
      |> Decimal.add(budget_day.carryover)
      |> Decimal.sub(total_spent)

    # Create next day's budget_day if applicable
    next_date = Date.add(budget_day.date, 1)

    if Date.compare(next_date, period.end_date) != :gt do
      case Repo.get_by(BudgetDay, period_id: period.id, date: next_date) do
        nil ->
          %BudgetDay{}
          |> BudgetDay.changeset(%{
            period_id: period.id,
            date: next_date,
            daily_limit: budget_day.daily_limit,
            carryover: carryover
          })
          |> Repo.insert!()

        existing ->
          existing
          |> BudgetDay.changeset(%{carryover: carryover})
          |> Repo.update!()
      end
    end

    # Mark the current day as closed
    budget_day
    |> BudgetDay.changeset(%{closed_at: DateTime.utc_now()})
    |> Repo.update!()
  end

  defp get_total_spent_for_day(budget_day_id) do
    result =
      Expense
      |> where([e], e.budget_day_id == ^budget_day_id)
      |> select([e], sum(e.amount))
      |> Repo.one()

    result || Decimal.new("0")
  end
end
