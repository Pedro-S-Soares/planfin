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
    field :total_budget, :decimal
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
    |> cast(attrs, [:start_date, :end_date, :daily_limit, :total_budget, :status, :group_id])
    |> validate_required([:start_date, :end_date, :daily_limit, :total_budget, :group_id])
    |> validate_inclusion(:status, @valid_statuses)
    |> validate_end_date_after_start_date()
    |> validate_daily_limit_positive()
    |> validate_total_budget_gte_daily_total()
  end

  @doc """
  Changeset for updating daily_limit and/or total_budget of an active period.
  """
  def update_changeset(period, attrs) do
    period
    |> cast(attrs, [:daily_limit, :total_budget])
    |> validate_daily_limit_positive()
    |> validate_total_budget_gte_daily_total()
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

  defp validate_total_budget_gte_daily_total(changeset) do
    daily_limit = get_field(changeset, :daily_limit)
    total_budget = get_field(changeset, :total_budget)
    start_date = get_field(changeset, :start_date)
    end_date = get_field(changeset, :end_date)

    with %Decimal{} <- daily_limit,
         %Decimal{} <- total_budget,
         %Date{} <- start_date,
         %Date{} <- end_date do
      days = Date.diff(end_date, start_date) + 1
      minimum = Decimal.mult(daily_limit, Decimal.new(days))

      if Decimal.compare(total_budget, minimum) == :lt do
        add_error(
          changeset,
          :total_budget,
          "must be at least daily_limit × total days (#{Decimal.to_string(minimum)})"
        )
      else
        changeset
      end
    else
      _ -> changeset
    end
  end
end
