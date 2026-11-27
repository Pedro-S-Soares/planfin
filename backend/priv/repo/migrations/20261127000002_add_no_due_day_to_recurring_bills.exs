defmodule PlanfinBackend.Repo.Migrations.AddNoDueDayToRecurringBills do
  use Ecto.Migration

  # Schema only, additive: a planned one-off expense can have no day, only the
  # invoice (card) or month it falls in. Existing rows stay false (with a day).
  def change do
    alter table(:recurring_bills) do
      add :no_due_day, :boolean, default: false, null: false
    end
  end
end
