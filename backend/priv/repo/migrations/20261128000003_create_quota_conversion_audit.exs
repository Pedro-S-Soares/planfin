defmodule PlanfinBackend.Repo.Migrations.CreateQuotaConversionAudit do
  use Ecto.Migration

  # Old values of every quota and expense the legacy-quota conversion changes
  # (CX-79), so it can be reverted.
  def change do
    create table(:quota_conversion_audit) do
      add :run_at, :utc_datetime, null: false
      add :origin, :string, null: false
      # quota | expense
      add :entity, :string, null: false
      add :entity_id, :binary_id, null: false
      add :quota_id, :binary_id, null: false
      add :old_once_month, :date
      add :new_once_month, :date
      add :old_last_month, :date
      add :new_last_month, :date
      add :reverted_at, :utc_datetime
    end

    create index(:quota_conversion_audit, [:origin, :entity])
  end
end
