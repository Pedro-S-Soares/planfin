defmodule PlanfinBackend.Repo.Migrations.AddInvoiceGoalToFinancialAccounts do
  use Ecto.Migration

  def change do
    alter table(:financial_accounts) do
      # Optional target for the card invoice (reduce it month by month).
      add :invoice_goal, :decimal, precision: 12, scale: 2
    end
  end
end
