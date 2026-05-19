defmodule PlanfinBackend.Accounts.BetaTesters do
  @moduledoc """
  Allowlist de emails autorizados a receber transactional emails durante o beta fechado.

  Bloqueia envio de magic links, confirmações e reset password para endereços não
  autorizados — defesa contra spam ao Resend usando o app como vetor (ver CX-28/CX-29).

  A lista vem do config `:planfin_backend, :beta_tester_emails`. Use `:all` em
  ambientes de teste/dev pra desabilitar o gate.
  """

  @spec allowed?(String.t() | nil) :: boolean()
  def allowed?(nil), do: false

  def allowed?(email) when is_binary(email) do
    case Application.get_env(:planfin_backend, :beta_tester_emails, []) do
      :all -> true
      list when is_list(list) -> String.downcase(email) in list
    end
  end
end
