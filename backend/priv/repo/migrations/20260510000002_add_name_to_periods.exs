defmodule PlanfinBackend.Repo.Migrations.AddNameToPeriods do
  use Ecto.Migration

  def change do
    alter table(:periods) do
      add :name, :string, null: true
    end
  end
end
