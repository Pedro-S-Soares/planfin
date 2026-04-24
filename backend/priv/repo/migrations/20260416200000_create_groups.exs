defmodule PlanfinBackend.Repo.Migrations.CreateGroups do
  use Ecto.Migration

  def change do
    create table(:groups, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :name, :string, null: false
      add :owner_id, references(:users, on_delete: :restrict), null: false

      timestamps()
    end

    create index(:groups, [:owner_id])
  end
end
