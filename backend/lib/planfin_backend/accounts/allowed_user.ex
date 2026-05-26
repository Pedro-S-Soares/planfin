defmodule PlanfinBackend.Accounts.AllowedUser do
  use Ecto.Schema
  import Ecto.Changeset

  schema "allowed_users" do
    field :email, :string
    timestamps(updated_at: false)
  end

  def changeset(allowed_user, attrs) do
    allowed_user
    |> cast(attrs, [:email])
    |> validate_required([:email])
    |> validate_format(:email, ~r/^[^@,;\s]+@[^@,;\s]+$/)
    |> unique_constraint(:email)
  end
end
