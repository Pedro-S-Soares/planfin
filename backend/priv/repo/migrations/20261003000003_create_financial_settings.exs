defmodule PlanfinBackend.Repo.Migrations.CreateFinancialSettings do
  use Ecto.Migration

  def change do
    create table(:financial_settings, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      # Net monthly salary the cycle budget is built from.
      add :salary_amount, :decimal, precision: 12, scale: 2
      # Salary arrives on the N-th labor business day (Mon–Sat) of the month.
      add :salary_business_day, :integer, null: false, default: 10

      add :salary_account_id,
          references(:financial_accounts, type: :uuid, on_delete: :nilify_all)

      # Optional emergency reserve goal (no lock, just progress).
      add :reserve_goal, :decimal, precision: 12, scale: 2

      timestamps()
    end

    create unique_index(:financial_settings, [:group_id])

    # Manual salary date for a month (holiday, company paying earlier...).
    create table(:salary_date_overrides, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      add :month, :date, null: false
      add :date, :date, null: false

      timestamps()
    end

    create unique_index(:salary_date_overrides, [:group_id, :month])

    alter table(:expenses) do
      # What produced the entry: "salary", "bill" or nil for a manual entry.
      add :source, :string, size: 20
    end
  end
end
