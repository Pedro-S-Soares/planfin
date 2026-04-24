defmodule PlanfinBackend.Groups.GroupInvite do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "group_invites" do
    field :code, :string
    field :expires_at, :utc_datetime
    field :max_uses, :integer
    field :uses_count, :integer, default: 0
    field :revoked_at, :utc_datetime

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :created_by, PlanfinBackend.Accounts.User, type: :integer

    timestamps()
  end

  def changeset(invite, attrs) do
    invite
    |> cast(attrs, [
      :code,
      :group_id,
      :created_by_id,
      :expires_at,
      :max_uses,
      :uses_count,
      :revoked_at
    ])
    |> validate_required([:code, :group_id])
    |> validate_format(:code, ~r/^[A-Z0-9]{6,8}$/)
    |> validate_number(:uses_count, greater_than_or_equal_to: 0)
    |> validate_number(:max_uses, greater_than: 0)
    |> unique_constraint(:code)
  end
end
