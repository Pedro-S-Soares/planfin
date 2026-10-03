defmodule PlanfinBackend.Finance.SalaryDateOverride do
  @moduledoc "Manual salary date for one month."
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "salary_date_overrides" do
    field :month, :date
    field :date, :date

    belongs_to :group, PlanfinBackend.Groups.Group

    timestamps()
  end

  def changeset(override, attrs) do
    override
    |> cast(attrs, [:month, :date, :group_id])
    |> validate_required([:month, :date, :group_id])
    |> unique_constraint([:group_id, :month])
  end
end
