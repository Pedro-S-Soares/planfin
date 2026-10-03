defmodule PlanfinBackend.Repo.Migrations.CreateRecurringBills do
  use Ecto.Migration

  def change do
    create table(:recurring_bills, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false

      add :account_id,
          references(:financial_accounts, type: :uuid, on_delete: :delete_all),
          null: false

      add :subcategory_id, references(:subcategories, type: :uuid, on_delete: :nilify_all)
      add :name, :string, null: false
      # Estimated monthly amount; each payment records the real one.
      add :amount, :decimal, precision: 12, scale: 2, null: false
      add :due_day, :integer, null: false
      add :active, :boolean, null: false, default: true

      timestamps()
    end

    create index(:recurring_bills, [:group_id])

    create table(:bill_payments, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false

      add :bill_id, references(:recurring_bills, type: :uuid, on_delete: :delete_all), null: false

      # Deleting the entry undoes the payment.
      add :expense_id, references(:expenses, type: :uuid, on_delete: :delete_all), null: false
      # First day of the month this payment settles.
      add :month, :date, null: false

      timestamps()
    end

    create unique_index(:bill_payments, [:bill_id, :month])
    create index(:bill_payments, [:expense_id])
  end
end
