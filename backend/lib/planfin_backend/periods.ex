defmodule PlanfinBackend.Periods do
  @moduledoc """
  The Periods context. Periods are scoped by group.
  """

  import Ecto.Query, warn: false
  alias PlanfinBackend.Repo

  alias PlanfinBackend.Periods.{Period, BudgetDay}

  @doc """
  Creates a period for the given group.

  Returns `{:error, :already_has_active_period}` if the group already has an
  active period. Otherwise, creates the period and the budget_day for the
  start_date with carryover=0 and daily_limit = period.daily_limit.
  """
  def create_period(group_id, attrs) do
    with :ok <- check_no_active_period(group_id),
         {:ok, period} <- insert_period(group_id, attrs),
         {:ok, _budget_day} <- create_first_budget_day(period) do
      {:ok, period}
    end
  end

  defp check_no_active_period(group_id) do
    exists =
      Period
      |> where([p], p.group_id == ^group_id and p.status == "active")
      |> Repo.exists?()

    if exists do
      {:error, :already_has_active_period}
    else
      :ok
    end
  end

  defp insert_period(group_id, attrs) do
    %Period{}
    |> Period.changeset(Map.put(attrs, :group_id, group_id))
    |> Repo.insert()
  end

  defp create_first_budget_day(period) do
    %BudgetDay{}
    |> BudgetDay.changeset(%{
      period_id: period.id,
      date: period.start_date,
      daily_limit: period.daily_limit,
      carryover: Decimal.new("0.00")
    })
    |> Repo.insert()
  end

  @doc """
  Returns `{:ok, period}` with budget_days preloaded if the group has an active
  period, or `{:ok, nil}` otherwise.
  """
  def get_active_period(group_id) do
    period =
      Period
      |> where([p], p.group_id == ^group_id and p.status == "active")
      |> preload(:budget_days)
      |> Repo.one()

    {:ok, period}
  end

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

    total_spent = get_total_spent(period.id)

    difference = Decimal.sub(total_budgeted, total_spent)

    %{
      total_budgeted: total_budgeted,
      total_spent: total_spent,
      difference: difference,
      days_count: days_count
    }
  end

  defp get_total_spent(period_id) do
    alias PlanfinBackend.Expenses.Expense

    result =
      Expense
      |> where([e], e.period_id == ^period_id)
      |> select([e], sum(e.amount))
      |> Repo.one()

    result || Decimal.new("0")
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
