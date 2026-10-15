defmodule PlanfinBackend.Repo.Migrations.AddNoteToBillPayments do
  use Ecto.Migration

  def change do
    alter table(:bill_payments) do
      add :note, :string
    end
  end
end
