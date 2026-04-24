defmodule PlanfinBackend.GroupsTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.{Groups, Categories, Repo}
  alias PlanfinBackend.Groups.{Group, GroupMembership}

  import PlanfinBackend.AccountsFixtures

  describe "create_group/2" do
    test "creates group with owner membership, sets active_group_id and seeds categories" do
      user = user_fixture()

      assert {:ok, %{group: group, user: updated_user}} =
               Groups.create_group(user, %{name: "Casa"})

      assert %Group{} = group
      assert group.name == "Casa"
      assert group.owner_id == user.id

      # Membership created for owner
      assert Repo.get_by(GroupMembership, user_id: user.id, group_id: group.id)

      # Active group set on user
      assert updated_user.active_group_id == group.id

      # Default categories seeded (6)
      categories = Categories.list_categories(group.id)
      assert length(categories) == 6
      names = Enum.map(categories, & &1.name)
      assert "Contas da Casa" in names
    end

    test "returns error when name is empty" do
      user = user_fixture()

      assert {:error, %Ecto.Changeset{}} =
               Groups.create_group(user, %{name: ""})
    end
  end

  describe "list_user_groups/1 and get_user_group/2" do
    test "returns only the groups the user is a member of" do
      {u1, g1} = user_with_group_fixture()
      {_u2, _g2} = user_with_group_fixture()

      groups = Groups.list_user_groups(u1)
      ids = Enum.map(groups, & &1.id)

      assert g1.id in ids
      assert length(groups) == 1
    end

    test "get_user_group returns error for a group the user does not belong to" do
      {u1, _g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      assert {:error, :not_found} = Groups.get_user_group(u1, g2.id)
    end
  end

  describe "switch_active_group/2" do
    test "switches when user is a member of the target group" do
      {u1, g1} = user_with_group_fixture()
      {:ok, %{group: g2}} = Groups.create_group(u1, %{name: "Segundo"})

      # After create_group the active_group is g2; switch back to g1
      assert {:ok, %{group: active, user: user}} = Groups.switch_active_group(u1, g1.id)
      assert active.id == g1.id
      assert user.active_group_id == g1.id
      _ = g2
    end

    test "fails when user is not a member" do
      {u1, _g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      assert {:error, :not_found} = Groups.switch_active_group(u1, g2.id)
    end
  end

  describe "leave_group/2" do
    test "non-owner member can leave and has their active_group cleared" do
      {owner, group} = user_with_group_fixture()
      other = user_fixture()
      {:ok, _} = Groups.add_member(other, group)
      {:ok, %{user: other}} = Groups.switch_active_group(other, group.id)

      assert {:ok, :left} = Groups.leave_group(other, group)

      refute Repo.get_by(GroupMembership, user_id: other.id, group_id: group.id)
      # active_group_id cleared for the user who left
      assert Repo.get!(PlanfinBackend.Accounts.User, other.id).active_group_id == nil

      # owner still in the group
      assert Repo.get_by(GroupMembership, user_id: owner.id, group_id: group.id)
    end

    test "owner cannot leave while other members exist" do
      {owner, group} = user_with_group_fixture()
      other = user_fixture()
      {:ok, _} = Groups.add_member(other, group)

      assert {:error, :owner_cannot_leave} = Groups.leave_group(owner, group)
    end

    test "owner alone: leave deletes the group entirely" do
      {owner, group} = user_with_group_fixture()

      assert {:ok, :group_deleted} = Groups.leave_group(owner, group)
      refute Repo.get(Group, group.id)
    end
  end

  describe "delete_group/2" do
    test "only the owner can delete" do
      {owner, group} = user_with_group_fixture()
      other = user_fixture()
      {:ok, _} = Groups.add_member(other, group)

      assert {:error, :forbidden} = Groups.delete_group(other, group)
      assert :ok = Groups.delete_group(owner, group)
      refute Repo.get(Group, group.id)
    end
  end

  describe "remove_member/3" do
    test "owner removes a member and clears that user's active_group if needed" do
      {owner, group} = user_with_group_fixture()
      other = user_fixture()
      {:ok, _} = Groups.add_member(other, group)
      {:ok, _} = Groups.switch_active_group(other, group.id)

      assert :ok = Groups.remove_member(owner, group, other.id)
      refute Repo.get_by(GroupMembership, user_id: other.id, group_id: group.id)
      assert Repo.get!(PlanfinBackend.Accounts.User, other.id).active_group_id == nil
    end

    test "non-owner cannot remove members" do
      {_owner, group} = user_with_group_fixture()
      m1 = user_fixture()
      m2 = user_fixture()
      {:ok, _} = Groups.add_member(m1, group)
      {:ok, _} = Groups.add_member(m2, group)

      assert {:error, :forbidden} = Groups.remove_member(m1, group, m2.id)
    end

    test "cannot remove the owner" do
      {owner, group} = user_with_group_fixture()

      assert {:error, :cannot_remove_owner} = Groups.remove_member(owner, group, owner.id)
    end
  end
end
