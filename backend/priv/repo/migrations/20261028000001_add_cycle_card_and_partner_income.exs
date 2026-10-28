defmodule PlanfinBackend.Repo.Migrations.AddCycleCardAndPartnerIncome do
  use Ecto.Migration

  def change do
    alter table(:financial_settings) do
      add :cycle_card_id, references(:financial_accounts, type: :uuid, on_delete: :nilify_all)
    end

    alter table(:recurring_bills) do
      add :partner_income, :boolean, null: false, default: false
    end
  end
end
