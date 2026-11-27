defmodule PlanfinBackend.Repo.Migrations.FixInstallmentDates do
  use Ecto.Migration

  alias PlanfinBackend.Finance.Installments

  # Retroactive fix asked by the owner (CX-77): parcels 2..n of existing card
  # purchases go to the invoice `parcel 1's invoice + k − 1`, dated on its opening
  # day. Only the `date` of those rows changes (never amounts, categories, parcel 1
  # or other entries); invoices with a payment or a bank-typed total are left as
  # they are and listed. Every row looked at is written to installment_fix_audit
  # first. Idempotent: a second run finds nothing to change.
  #
  # down: puts back the dates changed by this migration (audit origin "migration").
  @disable_ddl_transaction true

  def up do
    flush()
    plan = Installments.plan(:all, Date.utc_today())
    summary = Installments.apply_plan(plan, "migration")
    IO.puts("\n[CX-77] Correção das datas das parcelas\n" <> Installments.report(summary) <> "\n")
  end

  def down do
    count = Installments.revert("migration")
    IO.puts("\n[CX-77] Revertidas #{count} datas de parcelas\n")
  end
end
