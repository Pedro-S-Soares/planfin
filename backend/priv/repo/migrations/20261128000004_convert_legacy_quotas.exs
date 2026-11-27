defmodule PlanfinBackend.Repo.Migrations.ConvertLegacyQuotas do
  use Ecto.Migration

  alias PlanfinBackend.Finance.QuotaConversion

  # Converts every legacy quota to the invoice model and links the expenses the
  # legacy rule counted (see Finance.QuotaConversion). Logs counts only.
  @disable_ddl_transaction true

  def up do
    flush()
    %{quotas: q, expenses_linked: e} = QuotaConversion.run("migration")

    IO.puts(
      "\n[CX-79] Cotas convertidas para o modelo por fatura: #{q}; lançamentos vinculados: #{e}\n"
    )
  end

  def down do
    %{quotas: q, expenses_unlinked: e} = QuotaConversion.revert("migration")
    IO.puts("\n[CX-79] Conversão revertida: #{q} cotas, #{e} lançamentos desvinculados\n")
  end
end
