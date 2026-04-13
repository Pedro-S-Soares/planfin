defmodule PlanfinBackendWeb.Plugs.AuthContext do
  @moduledoc """
  Extracts the Bearer token from the Authorization header and loads
  the current user into the Absinthe context.
  """
  @behaviour Plug

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  defp build_context(conn) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         user when not is_nil(user) <- PlanfinBackend.Accounts.get_user_by_token(token, "api") do
      %{current_user: user}
    else
      _ -> %{}
    end
  end
end
