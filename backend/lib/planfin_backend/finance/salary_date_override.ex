defmodule PlanfinBackend.Finance.SalaryDateOverride do
  @moduledoc "What is specific to one month's salary: its date and/or its amount."
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "salary_date_overrides" do
    field :month, :date
    field :date, :date
    field :amount, :decimal

    belongs_to :group, PlanfinBackend.Groups.Group

    timestamps()
  end

  def changeset(override, attrs) do
    override
    |> cast(attrs, [:month, :date, :amount, :group_id])
    |> validate_number(:amount, greater_than: 0)
    |> validate_required([:month, :date, :group_id])
    |> unique_constraint([:group_id, :month])
  end
end
