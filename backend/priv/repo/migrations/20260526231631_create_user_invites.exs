defmodule PlanfinBackend.Repo.Migrations.CreateUserInvites do
  use Ecto.Migration

  def change do
    create table(:user_invites, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :token, :string, null: false
      add :invited_by_id, references(:users, on_delete: :nilify_all)
      add :used_by_email, :string
      add :used_at, :utc_datetime
      add :expires_at, :utc_datetime
      add :revoked_at, :utc_datetime
      timestamps()
    end

    create unique_index(:user_invites, [:token])
    create index(:user_invites, [:invited_by_id])
  end
end
