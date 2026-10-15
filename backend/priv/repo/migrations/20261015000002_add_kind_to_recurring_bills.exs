defmodule PlanfinBackend.Repo.Migrations.AddKindToRecurringBills do
  use Ecto.Migration

  def change do
    alter table(:recurring_bills) do
      add :kind, :string, null: false, default: "fixed"
    end
  end
end
