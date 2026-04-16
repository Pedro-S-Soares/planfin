defmodule PlanfinBackend.Repo.Migrations.CreateGroupMemberships do
  use Ecto.Migration

  def change do
    create table(:group_memberships, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      add :joined_at, :utc_datetime, null: false

      timestamps()
    end

    create unique_index(:group_memberships, [:user_id, :group_id])
    create index(:group_memberships, [:group_id])
  end
end
