defmodule PlanfinBackend.Periods.BudgetDay do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "budget_days" do
    field :date, :date
    field :daily_limit, :decimal
    field :carryover, :decimal, default: Decimal.new("0.00")
    field :closed_at, :utc_datetime

    belongs_to :period, PlanfinBackend.Periods.Period, type: :binary_id
    has_many :expenses, PlanfinBackend.Expenses.Expense

    timestamps()
  end

  @doc """
  Changeset for creating or updating a budget_day.
  """
  def changeset(budget_day, attrs) do
    budget_day
    |> cast(attrs, [:date, :daily_limit, :carryover, :closed_at, :period_id])
    |> validate_required([:date, :daily_limit, :period_id])
    |> unique_constraint(:date, name: :budget_days_period_id_date_index)
  end
end
