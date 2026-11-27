defmodule PlanfinBackend.Repo.Migrations.CreateInstallmentFixAudit do
  use Ecto.Migration

  # Old and new date of every installment the date fix looked at (moved, re-dated
  # or left alone because its invoice was settled), so any run can be reverted.
  def change do
    create table(:installment_fix_audit) do
      add :run_at, :utc_datetime, null: false
      add :origin, :string, null: false
      add :expense_id, :binary_id, null: false
      add :installment_group_id, :binary_id, null: false
      add :installment_number, :integer, null: false
      add :account_id, :binary_id, null: false
      add :old_date, :date, null: false
      add :new_date, :date, null: false
      add :old_invoice, :string, null: false
      add :new_invoice, :string, null: false
      # move | redate | skipped_locked
      add :action, :string, null: false
      add :reason, :string
      add :reverted_at, :utc_datetime
    end

    create index(:installment_fix_audit, [:expense_id])
    create index(:installment_fix_audit, [:origin, :run_at])
  end
end
