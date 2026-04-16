defmodule PlanfinBackend.GroupsInvitesTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.{Groups, Repo}
  alias PlanfinBackend.Groups.{Invites, GroupInvite, GroupMembership}

  import PlanfinBackend.AccountsFixtures

  describe "generate_code/3" do
    test "creates a code with default 7-day expiration" do
      {owner, group} = user_with_group_fixture()

      assert {:ok, %GroupInvite{} = invite} = Invites.generate_code(owner, group)

      assert Regex.match?(~r/^[A-Z0-9]{8}$/, invite.code)
      assert invite.uses_count == 0
      assert is_nil(invite.max_uses)
      assert is_nil(invite.revoked_at)
      assert invite.expires_at != nil

      # expires around +7 days
      now = DateTime.utc_now(:second)
      diff_days = DateTime.diff(invite.expires_at, now, :day)
      assert diff_days in [6, 7]
    end

    test "respects expires_in_days: nil (no expiration)" do
      {owner, group} = user_with_group_fixture()

      assert {:ok, invite} = Invites.generate_code(owner, group, expires_in_days: nil)
      assert is_nil(invite.expires_at)
    end

    test "non-member cannot generate a code" do
      {_owner, group} = user_with_group_fixture()
      other = user_fixture()

      assert {:error, :forbidden} = Invites.generate_code(other, group)
    end
  end

  describe "redeem_code/2" do
    test "happy path: creates membership, switches active group, increments uses" do
      {_owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(_owner_user = user_fixture_owner(group), group)
      joiner = user_fixture()

      assert {:ok, %{group: joined_group, user: updated_user, invite: updated_invite}} =
               Invites.redeem_code(joiner, invite.code)

      assert joined_group.id == group.id
      assert updated_user.active_group_id == group.id
      assert updated_invite.uses_count == 1

      assert Repo.get_by(GroupMembership, user_id: joiner.id, group_id: group.id)
    end

    test "code is case-insensitive and trimmed" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group)
      joiner = user_fixture()

      assert {:ok, _} = Invites.redeem_code(joiner, "  #{String.downcase(invite.code)}  ")
    end

    test "returns :invalid_code for unknown code" do
      user = user_fixture()

      assert {:error, :invalid_code} = Invites.redeem_code(user, "NOTEXIST")
    end

    test "returns :invalid_code when code is revoked" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group)
      {:ok, _} = Invites.revoke_code(owner, invite)

      other = user_fixture()
      assert {:error, :invalid_code} = Invites.redeem_code(other, invite.code)
    end

    test "returns :expired when invite is past its expires_at" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group)

      past = DateTime.utc_now(:second) |> DateTime.add(-1, :second)

      Repo.update!(Ecto.Changeset.change(invite, %{expires_at: past}))

      other = user_fixture()
      assert {:error, :expired} = Invites.redeem_code(other, invite.code)
    end

    test "returns :exhausted when max_uses reached" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group, max_uses: 1)

      u1 = user_fixture()
      u2 = user_fixture()

      assert {:ok, _} = Invites.redeem_code(u1, invite.code)
      assert {:error, :exhausted} = Invites.redeem_code(u2, invite.code)
    end

    test "returns :already_member when user is already in the group" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group)

      other = user_fixture()
      {:ok, _} = Groups.add_member(other, group)

      assert {:error, :already_member} = Invites.redeem_code(other, invite.code)
    end
  end

  describe "revoke_code/2" do
    test "member can revoke a code" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group)

      assert {:ok, updated} = Invites.revoke_code(owner, invite)
      assert updated.revoked_at != nil
    end

    test "non-member cannot revoke" do
      {owner, group} = user_with_group_fixture()
      {:ok, invite} = Invites.generate_code(owner, group)
      other = user_fixture()

      assert {:error, :forbidden} = Invites.revoke_code(other, invite)
    end
  end

  describe "list_active_invites/2" do
    test "excludes revoked and expired invites" do
      {owner, group} = user_with_group_fixture()

      {:ok, ok_invite} = Invites.generate_code(owner, group)

      {:ok, to_revoke} = Invites.generate_code(owner, group)
      {:ok, _} = Invites.revoke_code(owner, to_revoke)

      {:ok, to_expire} = Invites.generate_code(owner, group)
      past = DateTime.utc_now(:second) |> DateTime.add(-10, :second)
      Repo.update!(Ecto.Changeset.change(to_expire, %{expires_at: past}))

      assert {:ok, actives} = Invites.list_active_invites(owner, group)
      ids = Enum.map(actives, & &1.id)
      assert ok_invite.id in ids
      refute to_revoke.id in ids
      refute to_expire.id in ids
    end
  end

  # Helper that pulls the owner user out of a fixture-created group.
  # We reuse the existing `user_with_group_fixture` where needed; this
  # one adapts when only the group is supplied from elsewhere.
  defp user_fixture_owner(group) do
    Repo.get!(PlanfinBackend.Accounts.User, group.owner_id)
  end
end
