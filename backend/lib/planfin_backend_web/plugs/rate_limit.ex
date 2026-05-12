defmodule PlanfinBackendWeb.Plugs.RateLimit do
  @moduledoc """
  Coarse-grained IP rate limiting for the GraphQL endpoint.
  Limits each IP to 120 requests per minute.
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    ip = conn |> remote_ip() |> :inet.ntoa() |> to_string()

    case PlanfinBackend.RateLimit.check({:graphql_global, ip}, 120, :timer.minutes(1)) do
      {:allow, _} ->
        conn

      {:deny, _} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(429, ~s({"errors":[{"message":"Too many requests. Please slow down."}]}))
        |> halt()
    end
  end

  defp remote_ip(conn) do
    forwarded =
      conn
      |> get_req_header("x-forwarded-for")
      |> List.first()

    if forwarded do
      forwarded
      |> String.split(",")
      |> List.first()
      |> String.trim()
      |> parse_ip()
    else
      conn.remote_ip
    end
  end

  defp parse_ip(ip_string) do
    case :inet.parse_address(String.to_charlist(ip_string)) do
      {:ok, ip} -> ip
      _ -> {0, 0, 0, 0}
    end
  end
end
