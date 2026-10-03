defmodule PlanfinBackendWeb.Middleware.LogErrors do
  @moduledoc """
  Logs every top-level query or mutation that resolved with errors.

  GraphQL errors travel inside a 200 response, so without this they never
  show up in the server logs. Arguments are not logged; the field name, the
  error messages, the user and the group are enough to find the cause.
  """
  @behaviour Absinthe.Middleware

  require Logger

  @impl true
  def call(%Absinthe.Resolution{errors: []} = resolution, _opts), do: resolution

  def call(%Absinthe.Resolution{errors: errors} = resolution, _opts) do
    messages = Enum.map(errors, &message/1)

    # Expired sessions are routine; logging them would bury real failures.
    if messages != ["Not authenticated"], do: log(resolution, messages)

    resolution
  end

  defp log(resolution, messages) do
    kind = resolution.parent_type.identifier
    field = resolution.definition.name
    context = resolution.context
    user_id = get_in(context, [:current_user, Access.key(:id)])
    group_id = get_in(context, [:current_group, Access.key(:id)])

    Logger.warning(
      "[graphql] #{kind} #{field} failed: #{Enum.join(messages, " | ")}" <>
        " user=#{inspect(user_id)} group=#{inspect(group_id)}"
    )
  end

  defp message(%{message: message}), do: to_string(message)
  defp message(message) when is_binary(message), do: message
  defp message(other), do: inspect(other)
end
