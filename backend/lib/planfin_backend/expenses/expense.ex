defmodule PlanfinBackend.Expenses.Expense do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, only: [from: 2]

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Categories.Subcategory

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "expenses" do
    field :amount, :decimal
    field :date, :date
    field :note, :string
    field :is_extra, :boolean, default: false
    field :type, :string, default: "expense"
    field :counts_in_budget, :boolean, default: true
    field :installment_group_id, :binary_id
    field :installment_number, :integer
    field :installment_count, :integer
    field :source, :string

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :created_by, PlanfinBackend.Accounts.User, type: :integer
    belongs_to :period, PlanfinBackend.Periods.Period, type: :binary_id
    belongs_to :budget_day, PlanfinBackend.Periods.BudgetDay, type: :binary_id
    belongs_to :subcategory, PlanfinBackend.Categories.Subcategory, type: :binary_id
    belongs_to :account, PlanfinBackend.Finance.Account, type: :binary_id

    timestamps()
  end

  @doc """
  Entries that feed the daily/period budget. Every budget calculation must start
  from this query: entries with `counts_in_budget: false` (future installments,
  bills, salary, reserve and allowance movements) never touch the budget.
  """
  def in_budget do
    from(e in __MODULE__, where: e.counts_in_budget == true)
  end

  @doc """
  Changeset for creating or updating an expense.
  """
  def changeset(expense, attrs) do
    expense
    |> cast(attrs, [
      :amount,
      :date,
      :note,
      :is_extra,
      :type,
      :group_id,
      :created_by_id,
      :period_id,
      :budget_day_id,
      :subcategory_id,
      :account_id,
      :counts_in_budget,
      :installment_group_id,
      :installment_number,
      :installment_count,
      :source
    ])
    |> validate_required([:amount, :date, :group_id, :created_by_id])
    |> validate_inclusion(:type, ["expense", "income"])
    |> validate_amount_positive()
    |> validate_type_matches_subcategory()
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

  defp validate_type_matches_subcategory(changeset) do
    subcategory_id = get_field(changeset, :subcategory_id)
    expense_type = get_field(changeset, :type)

    if subcategory_id && expense_type do
      case Repo.get(Subcategory, subcategory_id) do
        nil ->
          changeset

        subcategory ->
          if subcategory.type != expense_type do
            add_error(changeset, :type, "must match subcategory type (#{subcategory.type})")
          else
            changeset
          end
      end
    else
      changeset
    end
  end
end
