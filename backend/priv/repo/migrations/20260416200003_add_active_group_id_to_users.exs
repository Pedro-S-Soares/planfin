defmodule PlanfinBackend.Repo.Migrations.AddActiveGroupIdToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :active_group_id, references(:groups, type: :uuid, on_delete: :nilify_all)
    end

    create index(:users, [:active_group_id])
  end
end
