defmodule PlanfinBackend.Groups.Invites do
  @moduledoc """
  Shareable invite codes that let a user join an existing group without
  requiring email delivery.

  Codes are 8 characters, uppercased alphanumerics (A-Z, 0-9). They have an
  optional expiration (default 7 days) and optional `max_uses`. When a user
  redeems a valid code, a membership is created and the user's active group
  is switched to the group.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Accounts.User
  alias PlanfinBackend.Groups
  alias PlanfinBackend.Groups.{Group, GroupInvite, GroupMembership}

  @default_ttl_days 7
  @code_length 8
  @code_alphabet ~c"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

  @doc """
  Generates a new invite code for `group`. The user must be a member.

  Options:
  - `:expires_in_days` (default 7; pass `nil` for no expiration)
  - `:max_uses` (default `nil` = unlimited)
  """
  def generate_code(%User{} = user, %Group{} = group, opts \\ []) do
    with true <- Groups.member?(user, group) || {:error, :forbidden} do
      attrs = %{
        code: generate_unique_code(),
        group_id: group.id,
        created_by_id: user.id,
        expires_at: compute_expires_at(opts),
        max_uses: Keyword.get(opts, :max_uses)
      }

      %GroupInvite{}
      |> GroupInvite.changeset(attrs)
      |> Repo.insert()
    end
  end

  @doc """
  Redeems a code: creates a membership and switches the user's active group.

  Returns `{:ok, %{group: group, user: user, invite: invite}}` or one of:
  - `{:error, :invalid_code}` — code not found or revoked
  - `{:error, :expired}` — past `expires_at`
  - `{:error, :exhausted}` — `uses_count >= max_uses`
  - `{:error, :already_member}` — user already in this group
  """
  def redeem_code(%User{} = user, code) when is_binary(code) do
    normalized = normalize_code(code)

    Repo.transaction(fn ->
      case lock_invite(normalized) do
        nil ->
          Repo.rollback(:invalid_code)

        %GroupInvite{revoked_at: revoked_at} when not is_nil(revoked_at) ->
          Repo.rollback(:invalid_code)

        %GroupInvite{} = invite ->
          now = DateTime.utc_now(:second)

          cond do
            invite.expires_at != nil and DateTime.compare(invite.expires_at, now) != :gt ->
              Repo.rollback(:expired)

            invite.max_uses != nil and invite.uses_count >= invite.max_uses ->
              Repo.rollback(:exhausted)

            already_member?(user.id, invite.group_id) ->
              Repo.rollback(:already_member)

            true ->
              with {:ok, _membership} <- insert_membership(user, invite.group_id, now),
                   {:ok, updated_invite} <- increment_uses(invite),
                   group when not is_nil(group) <- Repo.get(Group, invite.group_id),
                   {:ok, user} <-
                     user
                     |> User.active_group_changeset(%{active_group_id: group.id})
                     |> Repo.update() do
                %{group: group, user: user, invite: updated_invite}
              else
                {:error, reason} -> Repo.rollback(reason)
                nil -> Repo.rollback(:invalid_code)
              end
          end
      end
    end)
  end

  @doc """
  Revokes an invite. Any member of the group may revoke it.
  """
  def revoke_code(%User{} = user, %GroupInvite{} = invite) do
    with %Group{} = group <- Repo.get(Group, invite.group_id),
         true <- Groups.member?(user, group) || {:error, :forbidden} do
      invite
      |> GroupInvite.changeset(%{revoked_at: DateTime.utc_now(:second)})
      |> Repo.update()
    end
  end

  @doc """
  Lists active (non-revoked, non-expired) invites for the given group.
  User must be a member.
  """
  def list_active_invites(%User{} = user, %Group{} = group) do
    if Groups.member?(user, group) do
      now = DateTime.utc_now(:second)

      invites =
        GroupInvite
        |> where([i], i.group_id == ^group.id and is_nil(i.revoked_at))
        |> where([i], is_nil(i.expires_at) or i.expires_at > ^now)
        |> where([i], is_nil(i.max_uses) or i.uses_count < i.max_uses)
        |> order_by([i], desc: i.inserted_at)
        |> Repo.all()

      {:ok, invites}
    else
      {:error, :forbidden}
    end
  end

  # --- Private helpers ---

  defp normalize_code(code), do: code |> String.trim() |> String.upcase()

  defp generate_unique_code do
    code =
      for _ <- 1..@code_length, into: "", do: <<Enum.random(@code_alphabet)>>

    if Repo.exists?(from(i in GroupInvite, where: i.code == ^code)) do
      generate_unique_code()
    else
      code
    end
  end

  defp compute_expires_at(opts) do
    case Keyword.get(opts, :expires_in_days, @default_ttl_days) do
      nil -> nil
      days when is_integer(days) and days > 0 -> DateTime.utc_now(:second) |> DateTime.add(days * 86_400, :second)
    end
  end

  defp lock_invite(code) do
    from(i in GroupInvite, where: i.code == ^code, lock: "FOR UPDATE")
    |> Repo.one()
  end

  defp already_member?(user_id, group_id) do
    Repo.exists?(
      from(m in GroupMembership, where: m.user_id == ^user_id and m.group_id == ^group_id)
    )
  end

  defp insert_membership(user, group_id, now) do
    %GroupMembership{}
    |> GroupMembership.changeset(%{
      user_id: user.id,
      group_id: group_id,
      joined_at: now
    })
    |> Repo.insert()
  end

  defp increment_uses(invite) do
    invite
    |> GroupInvite.changeset(%{uses_count: invite.uses_count + 1})
    |> Repo.update()
  end
end
