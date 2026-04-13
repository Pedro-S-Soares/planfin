defmodule PlanfinBackendWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket, schema: PlanfinBackendWeb.Schema

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case PlanfinBackend.Accounts.get_user_by_token(token, "api") do
      nil -> :error
      user -> {:ok, Absinthe.Phoenix.Socket.put_options(socket, context: %{current_user: user})}
    end
  end

  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  @impl true
  def id(%{assigns: %{current_user: user}}), do: "user_socket:#{user.id}"
  def id(_socket), do: nil
end
