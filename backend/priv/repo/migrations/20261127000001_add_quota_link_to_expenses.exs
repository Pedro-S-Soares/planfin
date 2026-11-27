defmodule PlanfinBackend.Repo.Migrations.AddQuotaLinkToExpenses do
  use Ecto.Migration

  # Schema only, additive: no existing row is rewritten.
  #
  # * expenses.quota_id — the spending quota a purchase uses, chosen in the entry
  #   sheet (new and edited purchases only; old ones keep no link).
  # * recurring_bills.per_invoice — true for quotas in the new model (by invoice,
  #   purchases chosen explicitly). Existing quotas stay false and keep working as
  #   before (matched by subcategory, calendar month) until edited.
  def change do
    alter table(:expenses) do
      add :quota_id, references(:recurring_bills, type: :binary_id, on_delete: :nilify_all)
    end

    create index(:expenses, [:quota_id])

    alter table(:recurring_bills) do
      add :per_invoice, :boolean, default: false, null: false
    end
  end
end
