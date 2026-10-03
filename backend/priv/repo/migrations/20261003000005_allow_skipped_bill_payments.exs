defmodule PlanfinBackend.Repo.Migrations.AllowSkippedBillPayments do
  use Ecto.Migration

  # A bill payment without entry marks a card bill month as skipped: the
  # automatic charge must not come back after the user removed it.
  def change do
    alter table(:bill_payments) do
      modify :expense_id, references(:expenses, type: :uuid, on_delete: :nilify_all),
        null: true,
        from: {references(:expenses, type: :uuid, on_delete: :delete_all), null: false}
    end
  end
end
