defmodule PlanfinBackend.Repo.Migrations.CreateGroupInvites do
  use Ecto.Migration

  def change do
    create table(:group_invites, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :code, :string, null: false
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      add :created_by_id, references(:users, on_delete: :nilify_all)
      add :expires_at, :utc_datetime
      add :max_uses, :integer
      add :uses_count, :integer, null: false, default: 0
      add :revoked_at, :utc_datetime

      timestamps()
    end

    create unique_index(:group_invites, [:code])
    create index(:group_invites, [:group_id])
  end
end
