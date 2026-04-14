defmodule PlanfinBackend.Repo.Migrations.CreateExpenses do
  use Ecto.Migration

  def change do
    create table(:expenses, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :period_id, references(:periods, type: :uuid, on_delete: :delete_all), null: false

      add :budget_day_id, references(:budget_days, type: :uuid, on_delete: :delete_all),
        null: false

      add :subcategory_id, references(:subcategories, type: :uuid, on_delete: :nilify_all)
      add :amount, :decimal, precision: 10, scale: 2, null: false
      add :date, :date, null: false
      add :note, :string

      timestamps()
    end

    create index(:expenses, [:user_id])
    create index(:expenses, [:budget_day_id])
    create index(:expenses, [:period_id])
  end
end
