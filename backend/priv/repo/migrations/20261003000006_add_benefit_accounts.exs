defmodule PlanfinBackend.Repo.Migrations.AddBenefitAccounts do
  use Ecto.Migration

  def change do
    alter table(:financial_accounts) do
      # Meal voucher (kind "benefit"): fixed credit received every month.
      add :monthly_credit, :decimal, precision: 12, scale: 2
      add :credit_day, :integer
    end

    # The automatic monthly credit lands at most once per account and day.
    create unique_index(:expenses, [:account_id, :date],
             where: "source = 'benefit_credit'",
             name: :expenses_benefit_credit_once
           )
  end
end
