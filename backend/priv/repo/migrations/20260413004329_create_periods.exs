defmodule PlanfinBackend.Repo.Migrations.CreatePeriods do
  use Ecto.Migration

  def change do
    create table(:periods, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :start_date, :date, null: false
      add :end_date, :date, null: false
      add :daily_limit, :decimal, precision: 10, scale: 2, null: false
      add :status, :string, null: false, default: "active"

      timestamps()
    end

    create index(:periods, [:user_id, :status])
  end
end
