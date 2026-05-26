defmodule PlanfinBackend.Accounts.BetaTesters do
  @moduledoc """
  Gate that checks whether an email is allowed to receive transactional emails
  and to register in the app during the closed beta.

  Allowed emails are stored in the `allowed_users` table. The config
  `:planfin_backend, :beta_tester_emails` still accepts `:all` to bypass
  the gate in dev/test environments.
  """

  import Ecto.Query, warn: false
  alias PlanfinBackend.Repo
  alias PlanfinBackend.Accounts.AllowedUser

  @spec allowed?(String.t() | nil) :: boolean()
  def allowed?(nil), do: false

  def allowed?(email) when is_binary(email) do
    case Application.get_env(:planfin_backend, :beta_tester_emails, []) do
      :all -> true
      _ -> db_allowed?(email)
    end
  end

  defp db_allowed?(email) do
    normalized = String.downcase(email)
    Repo.exists?(from(u in AllowedUser, where: u.email == ^normalized))
  end
end
