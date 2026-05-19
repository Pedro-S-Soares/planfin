defmodule PlanfinBackend.Repo.Migrations.AddTypeToCategoriesAndSubcategories do
  use Ecto.Migration

  def change do
    alter table(:categories) do
      add :type, :string, null: false, default: "expense", size: 10
    end

    alter table(:subcategories) do
      add :type, :string, null: false, default: "expense", size: 10
    end
  end
end
