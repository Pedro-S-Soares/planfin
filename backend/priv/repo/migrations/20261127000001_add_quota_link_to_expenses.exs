defmodule PlanfinBackend.Repo.Migrations.AddQuotaLinkToExpenses do
  use Ecto.Migration

  # A purchase now says which spending quota it uses (chosen in the entry sheet)
  # instead of being matched by subcategory. Additive: nothing is removed.
  def change do
    alter table(:expenses) do
      add :quota_id, references(:recurring_bills, type: :binary_id, on_delete: :nilify_all)
      # Marks the links made by the backfill below, so it can be undone exactly.
      add :quota_backfilled, :boolean, default: false, null: false
    end

    create index(:expenses, [:quota_id])
  end
end
