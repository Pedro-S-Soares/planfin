defmodule PlanfinBackendWeb.Resolvers.Groups do
  alias PlanfinBackend.Groups
  alias PlanfinBackend.Groups.Invites
  alias PlanfinBackend.Repo

  # ---- Queries ----

  def my_groups(_parent, _args, %{context: %{current_user: user}}) do
    groups = Groups.list_user_groups(user) |> Enum.map(&format_group/1)
    {:ok, groups}
  end

  def my_groups(_parent, _args, _context), do: {:error, "Not authenticated"}

  def active_group(_parent, _args, %{context: %{current_group: group}}) do
    {:ok, format_group(group)}
  end

  def active_group(_parent, _args, %{context: %{current_user: _}}), do: {:ok, nil}
  def active_group(_parent, _args, _context), do: {:error, "Not authenticated"}

  def group_members(_parent, %{group_id: group_id}, %{context: %{current_user: user}}) do
    with {:ok, group} <- Groups.get_user_group(user, group_id),
         {:ok, members} <- Groups.list_members(user, group) do
      payload =
        members
        |> Repo.preload(:memberships)
        |> Enum.map(fn u ->
          membership = Enum.find(u.memberships, &(&1.group_id == group.id))

          %{
            id: u.id,
            email: u.email,
            joined_at: membership && DateTime.to_iso8601(membership.joined_at),
            is_owner: u.id == group.owner_id
          }
        end)

      {:ok, payload}
    else
      {:error, :not_found} -> {:error, "Group not found"}
      {:error, :forbidden} -> {:error, "Not a member of this group"}
    end
  end

  def group_members(_parent, _args, _context), do: {:error, "Not authenticated"}

  def group_invites(_parent, %{group_id: group_id}, %{context: %{current_user: user}}) do
    with {:ok, group} <- Groups.get_user_group(user, group_id),
         {:ok, invites} <- Invites.list_active_invites(user, group) do
      {:ok, Enum.map(invites, &format_invite/1)}
    else
      {:error, :not_found} -> {:error, "Group not found"}
      {:error, :forbidden} -> {:error, "Not a member of this group"}
    end
  end

  def group_invites(_parent, _args, _context), do: {:error, "Not authenticated"}

  # ---- Mutations ----

  def create_group(_parent, %{name: name}, %{context: %{current_user: user}}) do
    case Groups.create_group(user, %{name: name}) do
      {:ok, %{group: group}} -> {:ok, format_group(group)}
      {:error, changeset} -> {:error, format_errors(changeset)}
    end
  end

  def create_group(_parent, _args, _context), do: {:error, "Not authenticated"}

  def rename_group(_parent, %{id: id, name: name}, %{context: %{current_user: user}}) do
    with {:ok, group} <- Groups.get_user_group(user, id),
         {:ok, updated} <-
           group
           |> PlanfinBackend.Groups.Group.changeset(%{name: name})
           |> Repo.update() do
      {:ok, format_group(updated)}
    else
      {:error, :not_found} -> {:error, "Group not found"}
      {:error, changeset} -> {:error, format_errors(changeset)}
    end
  end

  def rename_group(_parent, _args, _context), do: {:error, "Not authenticated"}

  def delete_group(_parent, %{id: id}, %{context: %{current_user: user}}) do
    with {:ok, group} <- Groups.get_user_group(user, id),
         :ok <- Groups.delete_group(user, group) do
      {:ok, true}
    else
      {:error, :not_found} -> {:error, "Group not found"}
      {:error, :forbidden} -> {:error, "Only the owner can delete the group"}
    end
  end

  def delete_group(_parent, _args, _context), do: {:error, "Not authenticated"}

  def switch_active_group(_parent, %{id: id}, %{context: %{current_user: user}}) do
    case Groups.switch_active_group(user, id) do
      {:ok, %{group: group}} -> {:ok, format_group(group)}
      {:error, :not_found} -> {:error, "Group not found"}
    end
  end

  def switch_active_group(_parent, _args, _context), do: {:error, "Not authenticated"}

  def leave_group(_parent, %{id: id}, %{context: %{current_user: user}}) do
    with {:ok, group} <- Groups.get_user_group(user, id),
         result when result in [{:ok, :left}, {:ok, :group_deleted}] <-
           Groups.leave_group(user, group) do
      {:ok, true}
    else
      {:error, :not_found} -> {:error, "Group not found"}
      {:error, :not_member} -> {:error, "Not a member of this group"}
      {:error, :owner_cannot_leave} -> {:error, "Owner must transfer or delete the group"}
    end
  end

  def leave_group(_parent, _args, _context), do: {:error, "Not authenticated"}

  def remove_member(_parent, %{group_id: group_id, user_id: user_id}, %{
        context: %{current_user: user}
      }) do
    with {:ok, group} <- Groups.get_user_group(user, group_id),
         :ok <- Groups.remove_member(user, group, user_id) do
      {:ok, true}
    else
      {:error, :not_found} -> {:error, "Group or member not found"}
      {:error, :not_member} -> {:error, "User is not a member of this group"}
      {:error, :forbidden} -> {:error, "Only the owner can remove members"}
      {:error, :cannot_remove_owner} -> {:error, "Cannot remove the owner"}
    end
  end

  def remove_member(_parent, _args, _context), do: {:error, "Not authenticated"}

  def generate_invite_code(_parent, %{group_id: group_id} = args, %{
        context: %{current_user: user}
      }) do
    opts =
      []
      |> maybe_put_opt(:expires_in_days, Map.get(args, :expires_in_days))
      |> maybe_put_opt(:max_uses, Map.get(args, :max_uses))

    with {:ok, group} <- Groups.get_user_group(user, group_id),
         {:ok, invite} <- Invites.generate_code(user, group, opts) do
      {:ok, format_invite(invite)}
    else
      {:error, :not_found} -> {:error, "Group not found"}
      {:error, :forbidden} -> {:error, "Not a member of this group"}
      {:error, changeset} -> {:error, format_errors(changeset)}
    end
  end

  def generate_invite_code(_parent, _args, _context), do: {:error, "Not authenticated"}

  def revoke_invite_code(_parent, %{invite_id: invite_id}, %{context: %{current_user: user}}) do
    case Repo.get(PlanfinBackend.Groups.GroupInvite, invite_id) do
      nil ->
        {:error, "Invite not found"}

      invite ->
        case Invites.revoke_code(user, invite) do
          {:ok, _} -> {:ok, true}
          {:error, :forbidden} -> {:error, "Not a member of this group"}
          {:error, changeset} -> {:error, format_errors(changeset)}
        end
    end
  end

  def revoke_invite_code(_parent, _args, _context), do: {:error, "Not authenticated"}

  def redeem_invite_code(_parent, %{code: code}, %{context: %{current_user: user}}) do
    case Invites.redeem_code(user, code) do
      {:ok, %{group: group, invite: invite}} ->
        {:ok, %{group: format_group(group), invite: format_invite(invite)}}

      {:error, :invalid_code} ->
        {:error, "Invalid or revoked code"}

      {:error, :expired} ->
        {:error, "Code has expired"}

      {:error, :exhausted} ->
        {:error, "Code has reached its max uses"}

      {:error, :already_member} ->
        {:error, "You are already a member of this group"}
    end
  end

  def redeem_invite_code(_parent, _args, _context), do: {:error, "Not authenticated"}

  # ---- Private helpers ----

  defp format_group(nil), do: nil

  defp format_group(group) do
    %{
      id: to_string(group.id),
      name: group.name,
      owner_id: group.owner_id,
      inserted_at: group.inserted_at && NaiveDateTime.to_iso8601(group.inserted_at)
    }
  end

  defp format_invite(invite) do
    %{
      id: to_string(invite.id),
      code: invite.code,
      expires_at: invite.expires_at && DateTime.to_iso8601(invite.expires_at),
      max_uses: invite.max_uses,
      uses_count: invite.uses_count,
      revoked_at: invite.revoked_at && DateTime.to_iso8601(invite.revoked_at),
      inserted_at: invite.inserted_at && NaiveDateTime.to_iso8601(invite.inserted_at)
    }
  end

  defp maybe_put_opt(opts, _key, nil), do: opts
  defp maybe_put_opt(opts, key, value), do: Keyword.put(opts, key, value)

  defp format_errors(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, val}, acc ->
        String.replace(acc, "%{#{key}}", to_string(val))
      end)
    end)
    |> Enum.map(fn {field, errors} -> "#{field}: #{Enum.join(errors, ", ")}" end)
    |> Enum.join("; ")
  end
end
