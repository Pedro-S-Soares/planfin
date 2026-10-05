defmodule PlanfinBackend.Repo.Migrations.AddDirectionAndOnceToRecurringBills do
  use Ecto.Migration

  def change do
    alter table(:recurring_bills) do
      # "expense" (a bill) or "income" (expected money in, e.g. variable income)
      add :direction, :string, null: false, default: "expense", size: 10
      # When set (first day of a month), the item happens only in that month:
      # a one-off boleto or a one-off expected income.
      add :once_month, :date
    end
  end
end
