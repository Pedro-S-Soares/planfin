defmodule PlanfinBackend.Repo.Migrations.CreateFinancialAccountsAndTransfers do
  use Ecto.Migration

  def change do
    create table(:financial_accounts, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      add :owner_user_id, references(:users, on_delete: :nilify_all)
      add :name, :string, null: false
      add :kind, :string, null: false, size: 20
      add :is_primary, :boolean, null: false, default: false
      # Reconciled balance: `balance` was the real balance at `balance_date`
      # (entries created up to `balance_set_at` on that day are already in it).
      add :balance, :decimal, precision: 12, scale: 2, null: false, default: 0
      add :balance_date, :date, null: false
      add :balance_set_at, :naive_datetime, null: false
      add :closing_day, :integer
      add :due_day, :integer
      add :archived_at, :naive_datetime

      timestamps()
    end

    create index(:financial_accounts, [:group_id])

    create unique_index(:financial_accounts, [:group_id],
             where: "is_primary = true",
             name: :financial_accounts_one_primary_per_group
           )

    create table(:transfers, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :group_id, references(:groups, type: :uuid, on_delete: :delete_all), null: false
      add :created_by_id, references(:users, on_delete: :nilify_all)

      add :from_account_id,
          references(:financial_accounts, type: :uuid, on_delete: :delete_all),
          null: false

      add :to_account_id,
          references(:financial_accounts, type: :uuid, on_delete: :delete_all),
          null: false

      add :amount, :decimal, precision: 12, scale: 2, null: false
      add :date, :date, null: false
      add :kind, :string, null: false, size: 20
      # For card payments: first day of the invoice month being paid.
      add :invoice_month, :date
      add :note, :string

      timestamps()
    end

    create index(:transfers, [:group_id])
    create index(:transfers, [:from_account_id])
    create index(:transfers, [:to_account_id])

    alter table(:expenses) do
      add :account_id, references(:financial_accounts, type: :uuid, on_delete: :nilify_all)
      # false = movement outside the daily/period budget (future installments,
      # bills, salary, reserve). Ignored by every budget calculation.
      add :counts_in_budget, :boolean, null: false, default: true
      add :installment_group_id, :uuid
      add :installment_number, :integer
      add :installment_count, :integer
    end

    create index(:expenses, [:account_id])
    create index(:expenses, [:installment_group_id])
    create index(:expenses, [:group_id, :date])
  end
end
