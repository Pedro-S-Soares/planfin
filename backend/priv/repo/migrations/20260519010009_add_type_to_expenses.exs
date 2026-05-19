defmodule PlanfinBackend.Repo.Migrations.AddTypeToExpenses do
  use Ecto.Migration

  def change do
    alter table(:expenses) do
      add :type, :string, null: false, default: "expense", size: 10
    end
  end
end
