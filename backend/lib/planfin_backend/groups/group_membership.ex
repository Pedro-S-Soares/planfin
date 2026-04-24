defmodule PlanfinBackend.Groups.GroupMembership do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "group_memberships" do
    field :joined_at, :utc_datetime

    belongs_to :user, PlanfinBackend.Accounts.User, type: :integer
    belongs_to :group, PlanfinBackend.Groups.Group

    timestamps()
  end

  def changeset(membership, attrs) do
    membership
    |> cast(attrs, [:user_id, :group_id, :joined_at])
    |> validate_required([:user_id, :group_id, :joined_at])
    |> unique_constraint([:user_id, :group_id])
  end
end
