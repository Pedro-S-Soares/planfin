defmodule PlanfinBackend.Repo.Migrations.MarkOneOffBillEntries do
  use Ecto.Migration

  # Entries paid by a one-off bill were saved as "bill", the source of the
  # recurring ones, and showed the "Recorrente" badge.
  def up do
    execute("""
    UPDATE expenses SET source = 'one_off_bill'
    FROM bill_payments p
    JOIN recurring_bills b ON b.id = p.bill_id
    WHERE p.expense_id = expenses.id AND b.once_month IS NOT NULL AND expenses.source = 'bill'
    """)
  end

  def down do
    execute("UPDATE expenses SET source = 'bill' WHERE source = 'one_off_bill'")
  end
end
