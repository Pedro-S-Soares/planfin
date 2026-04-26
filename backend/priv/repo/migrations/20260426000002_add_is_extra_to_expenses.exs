defmodule PlanfinBackend.Repo.Migrations.AddIsExtraToExpenses do
  use Ecto.Migration

  def change do
    alter table(:expenses) do
      add :is_extra, :boolean, default: false, null: false
    end
  end
end
