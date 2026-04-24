defmodule PlanfinBackend.Repo.Migrations.CreateCategories do
  use Ecto.Migration

  def change do
    create table(:categories, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      add :name, :string, null: false

      timestamps()
    end

    create index(:categories, [:group_id])
  end
end
