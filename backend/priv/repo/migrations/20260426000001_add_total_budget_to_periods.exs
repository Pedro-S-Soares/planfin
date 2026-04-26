defmodule PlanfinBackend.Repo.Migrations.AddTotalBudgetToPeriods do
  use Ecto.Migration

  def up do
    # Step 1: add nullable so existing rows are accepted
    alter table(:periods) do
      add :total_budget, :decimal, precision: 10, scale: 2, null: true
    end

    # Step 2: backfill — existing periods get total_budget = daily_limit × total_days
    execute """
    UPDATE periods
    SET total_budget = daily_limit * (end_date - start_date + 1)
    """

    # Step 3: enforce NOT NULL now that every row has a value
    alter table(:periods) do
      modify :total_budget, :decimal, precision: 10, scale: 2, null: false
    end
  end

  def down do
    alter table(:periods) do
      remove :total_budget
    end
  end
end
