defmodule PlanfinBackend.Finance.Settings do
  @moduledoc "Per-group financial settings: salary, salary day and reserve goal."
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "financial_settings" do
    field :salary_amount, :decimal
    field :salary_business_day, :integer, default: 10
    field :reserve_goal, :decimal

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :salary_account, PlanfinBackend.Finance.Account

    timestamps()
  end

  def changeset(settings, attrs) do
    settings
    |> cast(attrs, [
      :salary_amount,
      :salary_business_day,
      :salary_account_id,
      :reserve_goal,
      :group_id
    ])
    |> validate_required([:group_id, :salary_business_day])
    |> validate_number(:salary_amount, greater_than: 0)
    |> validate_number(:salary_business_day,
      greater_than_or_equal_to: 1,
      less_than_or_equal_to: 22
    )
    |> validate_number(:reserve_goal, greater_than_or_equal_to: 0)
    |> unique_constraint(:group_id)
  end
end
