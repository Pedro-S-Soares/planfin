defmodule PlanfinBackend.Repo.Migrations.CreateBudgetDays do
  use Ecto.Migration

  def change do
    create table(:budget_days, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :period_id, references(:periods, type: :uuid, on_delete: :delete_all), null: false
      add :date, :date, null: false
      add :daily_limit, :decimal, precision: 10, scale: 2, null: false
      add :carryover, :decimal, precision: 10, scale: 2, null: false, default: 0.0
      add :closed_at, :utc_datetime

      timestamps()
    end

    create unique_index(:budget_days, [:period_id, :date])
  end
end
