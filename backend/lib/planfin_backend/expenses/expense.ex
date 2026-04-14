defmodule PlanfinBackend.Expenses.Expense do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "expenses" do
    field :amount, :decimal
    field :date, :date
    field :note, :string

    belongs_to :user, PlanfinBackend.Accounts.User, type: :integer
    belongs_to :period, PlanfinBackend.Periods.Period, type: :binary_id
    belongs_to :budget_day, PlanfinBackend.Periods.BudgetDay, type: :binary_id
    belongs_to :subcategory, PlanfinBackend.Categories.Subcategory, type: :binary_id

    timestamps()
  end

  @doc """
  Changeset for creating or updating an expense.
  """
  def changeset(expense, attrs) do
    expense
    |> cast(attrs, [:amount, :date, :note, :user_id, :period_id, :budget_day_id, :subcategory_id])
    |> validate_required([:amount, :date, :user_id, :period_id, :budget_day_id])
    |> validate_amount_positive()
  end

  defp validate_amount_positive(changeset) do
    case get_field(changeset, :amount) do
      nil ->
        changeset

      amount ->
        if Decimal.compare(amount, Decimal.new("0")) != :gt do
          add_error(changeset, :amount, "must be greater than 0")
        else
          changeset
        end
    end
  end
end
