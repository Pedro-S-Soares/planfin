defmodule PlanfinBackendWeb.UserSessionHTML do
  use PlanfinBackendWeb, :html

  embed_templates "user_session_html/*"

  defp local_mail_adapter? do
    Application.get_env(:planfin_backend, PlanfinBackend.Mailer)[:adapter] ==
      Swoosh.Adapters.Local
  end
end
