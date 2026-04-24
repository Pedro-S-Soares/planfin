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
  Creates an expense owned by `group_id` and authored by `created_by_id`.

  Steps:
  1. Fetch the group's active period via `Periods.get_active_period/1`.
  2. If none → `{:error, :no_active_period}`.
  3. Validate that `attrs.date` is within the period → `{:error, :date_out_of_range}`.
  4. Find or create the budget_day for that date.
  5. Insert the expense and return `{:ok, expense}` with subcategory and
     created_by preloaded.
  """
  def create_expense(group_id, created_by_id, attrs) do
    with {:ok, period} <- get_active_period_or_error(group_id),
         :ok <- validate_date_in_range(attrs[:date] || attrs["date"], period),
         {:ok, budget_day} <- get_or_create_budget_day(period, attrs[:date] || attrs["date"]),
         {:ok, expense} <-
           insert_expense(group_id, created_by_id, period.id, budget_day.id, attrs) do
      expense = Repo.preload(expense, [:created_by, subcategory: :category])
      {:ok, expense}
    end
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
        expense = Repo.preload(expense, :period)
        new_date = Map.get(attrs, :date, expense.date)

        with :ok <- validate_date_in_range(new_date, expense.period),
             {:ok, budget_day} <- get_or_create_budget_day(expense.period, new_date) do
          expense
          |> Expense.changeset(Map.put(attrs, :budget_day_id, budget_day.id))
          |> Repo.update()
          |> case do
            {:ok, updated} ->
              {:ok, Repo.preload(updated, [:created_by, subcategory: :category])}

            {:error, changeset} ->
              {:error, changeset}
          end
        end
    end
  end

  @doc """
  Deletes an expense that belongs to the given group.

  Returns `{:ok, expense}` on success, `{:error, :not_found}` if the expense
  does not exist or belongs to a different group.
  """
  def delete_expense(group_id, expense_id) do
    case Repo.get_by(Expense, id: expense_id, group_id: group_id) do
      nil ->
        {:error, :not_found}

      expense ->
        Repo.delete(expense)
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
  Lists expenses for the given period belonging to the group, grouped by date.

  Returns a list of maps `%{date: ~D[...], expenses: [...], total: Decimal}`,
  ordered by date descending.
  """
  def list_expenses_by_period(group_id, period_id) do
    expenses =
      Expense
      |> where([e], e.period_id == ^period_id and e.group_id == ^group_id)
      |> order_by([e], desc: e.date, desc: e.inserted_at)
      |> preload([:created_by, subcategory: :category])
      |> Repo.all()

    expenses
    |> Enum.group_by(& &1.date)
    |> Enum.sort_by(fn {date, _} -> date end, {:desc, Date})
    |> Enum.map(fn {date, day_expenses} ->
      total =
        Enum.reduce(day_expenses, Decimal.new("0"), fn e, acc ->
          Decimal.add(acc, e.amount)
        end)

      %{date: date, expenses: day_expenses, total: total}
    end)
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
