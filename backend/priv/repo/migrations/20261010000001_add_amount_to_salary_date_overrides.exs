defmodule PlanfinBackend.Repo.Migrations.AddAmountToSalaryDateOverrides do
  use Ecto.Migration

  def change do
    alter table(:salary_date_overrides) do
      # Expected salary of this month when it differs from the usual one.
      add :amount, :decimal, precision: 12, scale: 2
    end
  end
end
