defmodule PlanfinBackend.Repo.Migrations.MakeExpensePeriodBudgetDayNullable do
  use Ecto.Migration

  def up do
    # Drop the existing FK constraints before modifying the columns
    drop constraint(:expenses, "expenses_period_id_fkey")
    drop constraint(:expenses, "expenses_budget_day_id_fkey")

    alter table(:expenses) do
      modify :period_id, references(:periods, type: :uuid, on_delete: :nilify_all), null: true

      modify :budget_day_id, references(:budget_days, type: :uuid, on_delete: :nilify_all),
        null: true
    end
  end

  def down do
    drop constraint(:expenses, "expenses_period_id_fkey")
    drop constraint(:expenses, "expenses_budget_day_id_fkey")

    alter table(:expenses) do
      modify :period_id, references(:periods, type: :uuid, on_delete: :delete_all), null: false

      modify :budget_day_id, references(:budget_days, type: :uuid, on_delete: :delete_all),
        null: false
    end
  end
end
