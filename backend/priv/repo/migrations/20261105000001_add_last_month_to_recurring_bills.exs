defmodule PlanfinBackend.Repo.Migrations.AddLastMonthToRecurringBills do
  use Ecto.Migration

  def change do
    alter table(:recurring_bills) do
      add :last_month, :date
    end
  end
end
