defmodule PlanfinBackend.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "groups" do
    field :name, :string

    belongs_to :owner, PlanfinBackend.Accounts.User, type: :integer

    has_many :memberships, PlanfinBackend.Groups.GroupMembership
    has_many :invites, PlanfinBackend.Groups.GroupInvite

    many_to_many :members, PlanfinBackend.Accounts.User,
      join_through: PlanfinBackend.Groups.GroupMembership

    timestamps()
  end

  def changeset(group, attrs) do
    group
    |> cast(attrs, [:name, :owner_id])
    |> validate_required([:name, :owner_id])
    |> validate_length(:name, min: 1, max: 80)
  end
end
