defmodule PlanfinBackendWeb.Plugs.LoadCurrentGroup do
  @moduledoc """
  Loads the user's active group from `user.active_group_id` and injects it
  into the Absinthe context under `:current_group`.

  Runs AFTER `PlanfinBackendWeb.Plugs.AuthContext` in the `:graphql`
  pipeline. When there is no authenticated user or no active group, the
  context is left unchanged (resolvers then return a "no active group"
  error where appropriate).
  """
  @behaviour Plug

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Groups.{Group, GroupMembership}

  def init(opts), do: opts

  def call(conn, _opts) do
    absinthe_opts = conn.private[:absinthe] || %{}
    context = Map.get(absinthe_opts, :context, %{})

    case Map.get(context, :current_user) do
      nil ->
        conn

      user ->
        case load_active_group(user) do
          nil ->
            conn

          %Group{} = group ->
            Absinthe.Plug.put_options(conn, context: Map.put(context, :current_group, group))
        end
    end
  end

  defp load_active_group(%{active_group_id: nil}), do: nil
  defp load_active_group(%{active_group_id: _} = user), do: do_load(user)
  defp load_active_group(_), do: nil

  # Defensive check: the membership must still exist. If the user was
  # removed from the group since their last session, `active_group_id`
  # still points at it; don't expose the group in that case.
  defp do_load(%{id: user_id, active_group_id: group_id}) do
    import Ecto.Query

    Group
    |> join(:inner, [g], m in GroupMembership, on: m.group_id == g.id)
    |> where([g, m], g.id == ^group_id and m.user_id == ^user_id)
    |> Repo.one()
  end
end
