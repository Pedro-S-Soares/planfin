defmodule PlanfinBackend.Periods.Period do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @valid_statuses ~w(active closed abandoned)

  schema "periods" do
    field :start_date, :date
    field :end_date, :date
    field :daily_limit, :decimal
    field :status, :string, default: "active"

    belongs_to :group, PlanfinBackend.Groups.Group

    has_many :budget_days, PlanfinBackend.Periods.BudgetDay,
      foreign_key: :period_id,
      references: :id

    has_many :expenses, PlanfinBackend.Expenses.Expense

    timestamps()
  end

  @doc """
  Changeset for creating a period.
  """
  def changeset(period, attrs) do
    period
    |> cast(attrs, [:start_date, :end_date, :daily_limit, :status, :group_id])
    |> validate_required([:start_date, :end_date, :daily_limit, :group_id])
    |> validate_inclusion(:status, @valid_statuses)
    |> validate_end_date_after_start_date()
    |> validate_daily_limit_positive()
  end

  defp validate_end_date_after_start_date(changeset) do
    start_date = get_field(changeset, :start_date)
    end_date = get_field(changeset, :end_date)

    if start_date && end_date && Date.compare(end_date, start_date) != :gt do
      add_error(changeset, :end_date, "must be after start_date")
    else
      changeset
    end
  end

  defp validate_daily_limit_positive(changeset) do
    case get_field(changeset, :daily_limit) do
      nil ->
        changeset

      limit ->
        if Decimal.compare(limit, Decimal.new("0")) != :gt do
          add_error(changeset, :daily_limit, "must be greater than 0")
        else
          changeset
        end
    end
  end
end
