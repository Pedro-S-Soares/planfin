defmodule PlanfinBackend.Groups do
  @moduledoc """
  The Groups context.

  A group is the primary collaboration unit. All domain data (periods,
  categories, expenses) is scoped to a group. Users become members of a
  group either by creating one or by redeeming an invite code. A user's
  `active_group_id` decides which group their requests operate on.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Accounts.User
  alias PlanfinBackend.Groups.{Group, GroupMembership}
  alias PlanfinBackend.Categories

  @doc """
  Creates a group owned by `user` and makes `user` its first member.

  On success:
  - creates the group with `owner_id = user.id`
  - creates a membership for `user`
  - sets `user.active_group_id` to the new group
  - seeds the default categories for the group

  Returns `{:ok, %{group: %Group{}, user: %User{}}}` or `{:error, step, changeset, _}`.
  """
  def create_group(%User{} = user, attrs) do
    now = DateTime.utc_now(:second)

    Ecto.Multi.new()
    |> Ecto.Multi.insert(
      :group,
      Group.changeset(%Group{}, Map.put(attrs, :owner_id, user.id))
    )
    |> Ecto.Multi.insert(:membership, fn %{group: group} ->
      GroupMembership.changeset(%GroupMembership{}, %{
        user_id: user.id,
        group_id: group.id,
        joined_at: now
      })
    end)
    |> Ecto.Multi.update(:user, fn %{group: group} ->
      User.active_group_changeset(user, %{active_group_id: group.id})
    end)
    |> Ecto.Multi.run(:seed_categories, fn _repo, %{group: group} ->
      Categories.seed_default_categories(group.id)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{group: group, user: user}} -> {:ok, %{group: group, user: user}}
      {:error, _step, reason, _changes} -> {:error, reason}
    end
  end

  @doc """
  Lists all groups the user is a member of, most recently joined first.
  """
  def list_user_groups(%User{} = user) do
    Group
    |> join(:inner, [g], m in GroupMembership, on: m.group_id == g.id)
    |> where([_g, m], m.user_id == ^user.id)
    |> order_by([_g, m], desc: m.joined_at)
    |> Repo.all()
  end

  @doc """
  Fetches a group by id if the user is a member. Returns `{:ok, group}` or
  `{:error, :not_found}`.
  """
  def get_user_group(%User{} = user, group_id) do
    group =
      Group
      |> join(:inner, [g], m in GroupMembership, on: m.group_id == g.id)
      |> where([g, m], g.id == ^group_id and m.user_id == ^user.id)
      |> Repo.one()

    case group do
      nil -> {:error, :not_found}
      g -> {:ok, g}
    end
  end

  @doc """
  Returns `true` if the user is a member of the group.
  """
  def member?(%User{} = user, %Group{} = group) do
    GroupMembership
    |> where([m], m.user_id == ^user.id and m.group_id == ^group.id)
    |> Repo.exists?()
  end

  @doc """
  Switches the user's active group to `group_id`. The user must already be a
  member.
  """
  def switch_active_group(%User{} = user, group_id) do
    with {:ok, group} <- get_user_group(user, group_id),
         {:ok, user} <-
           user
           |> User.active_group_changeset(%{active_group_id: group.id})
           |> Repo.update() do
      {:ok, %{user: user, group: group}}
    end
  end

  @doc """
  Lists members of a group (only if the current user is also a member).
  """
  def list_members(%User{} = user, %Group{} = group) do
    if member?(user, group) do
      users =
        User
        |> join(:inner, [u], m in GroupMembership, on: m.user_id == u.id)
        |> where([_u, m], m.group_id == ^group.id)
        |> order_by([_u, m], asc: m.joined_at)
        |> Repo.all()

      {:ok, users}
    else
      {:error, :forbidden}
    end
  end

  @doc """
  Removes the user from the group.

  - If the user is the owner and there are other members, returns
    `{:error, :owner_cannot_leave}`. The owner must transfer ownership or
    delete the group.
  - If the user is the owner and is the only member, the group is deleted
    (cascade via FKs).
  - Otherwise, the membership is deleted. If it was the user's active group,
    `active_group_id` is cleared.
  """
  def leave_group(%User{} = user, %Group{} = group) do
    case Repo.get_by(GroupMembership, user_id: user.id, group_id: group.id) do
      nil ->
        {:error, :not_member}

      membership ->
        cond do
          group.owner_id == user.id and other_members_exist?(group, user.id) ->
            {:error, :owner_cannot_leave}

          group.owner_id == user.id ->
            Repo.delete(group)
            maybe_clear_active_group(user, group.id)
            {:ok, :group_deleted}

          true ->
            Repo.delete(membership)
            maybe_clear_active_group(user, group.id)
            {:ok, :left}
        end
    end
  end

  @doc """
  Deletes the group (only the owner can). Cascades to all related rows via
  DB constraints.
  """
  def delete_group(%User{} = user, %Group{} = group) do
    if group.owner_id == user.id do
      Repo.delete(group)
      maybe_clear_active_group(user, group.id)
      :ok
    else
      {:error, :forbidden}
    end
  end

  @doc """
  Removes `target_user_id` from the group. Only the owner may do this, and
  the owner cannot remove themselves (use `leave_group/2` or `delete_group/2`
  for that).
  """
  def remove_member(%User{} = actor, %Group{} = group, target_user_id)
      when is_integer(target_user_id) do
    cond do
      group.owner_id != actor.id ->
        {:error, :forbidden}

      target_user_id == group.owner_id ->
        {:error, :cannot_remove_owner}

      true ->
        case Repo.get_by(GroupMembership, group_id: group.id, user_id: target_user_id) do
          nil ->
            {:error, :not_member}

          membership ->
            Repo.delete(membership)

            User
            |> where([u], u.id == ^target_user_id and u.active_group_id == ^group.id)
            |> Repo.update_all(set: [active_group_id: nil])

            :ok
        end
    end
  end

  @doc """
  Internal: adds `user` to `group`. Used by `Invites.redeem_code/2`.
  """
  def add_member(%User{} = user, %Group{} = group) do
    %GroupMembership{}
    |> GroupMembership.changeset(%{
      user_id: user.id,
      group_id: group.id,
      joined_at: DateTime.utc_now(:second)
    })
    |> Repo.insert()
  end

  # --- Private helpers ---

  defp other_members_exist?(group, user_id) do
    GroupMembership
    |> where([m], m.group_id == ^group.id and m.user_id != ^user_id)
    |> Repo.exists?()
  end

  defp maybe_clear_active_group(%User{active_group_id: active_id} = user, left_group_id)
       when active_id == left_group_id do
    user
    |> User.active_group_changeset(%{active_group_id: nil})
    |> Repo.update()
  end

  defp maybe_clear_active_group(_user, _left_group_id), do: :ok
end
