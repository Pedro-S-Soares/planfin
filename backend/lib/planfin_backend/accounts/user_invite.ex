defmodule PlanfinBackend.Accounts.UserInvite do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :integer

  schema "user_invites" do
    field :token, :string
    field :used_by_email, :string
    field :used_at, :utc_datetime
    field :expires_at, :utc_datetime
    field :revoked_at, :utc_datetime

    belongs_to :invited_by, PlanfinBackend.Accounts.User

    timestamps()
  end

  def changeset(invite, attrs) do
    invite
    |> cast(attrs, [:token, :invited_by_id, :used_by_email, :used_at, :expires_at, :revoked_at])
    |> validate_required([:token])
    |> unique_constraint(:token)
  end
end
