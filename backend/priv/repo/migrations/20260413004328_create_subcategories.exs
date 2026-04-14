defmodule PlanfinBackend.Repo.Migrations.CreateSubcategories do
  use Ecto.Migration

  def change do
    create table(:subcategories, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :category_id, references(:categories, type: :uuid, on_delete: :delete_all), null: false
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :name, :string, null: false

      timestamps()
    end

    create index(:subcategories, [:category_id])
    create index(:subcategories, [:user_id])
  end
end
