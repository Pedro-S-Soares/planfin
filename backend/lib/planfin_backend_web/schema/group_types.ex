defmodule PlanfinBackendWeb.Schema.GroupTypes do
  use Absinthe.Schema.Notation

  alias PlanfinBackendWeb.Resolvers.Groups

  object :group do
    field :id, :id
    field :name, :string
    field :owner_id, :integer
    field :inserted_at, :string
  end

  object :group_member do
    field :id, :integer
    field :email, :string
    field :joined_at, :string
    field :is_owner, :boolean
  end

  object :group_invite do
    field :id, :id
    field :code, :string
    field :expires_at, :string
    field :max_uses, :integer
    field :uses_count, :integer
    field :revoked_at, :string
    field :inserted_at, :string
  end

  object :redeem_invite_payload do
    field :group, :group
    field :invite, :group_invite
  end

  object :group_queries do
    field :my_groups, list_of(:group) do
      resolve(&Groups.my_groups/3)
    end

    field :active_group, :group do
      resolve(&Groups.active_group/3)
    end

    field :group_members, list_of(:group_member) do
      arg(:group_id, non_null(:id))
      resolve(&Groups.group_members/3)
    end

    field :group_invites, list_of(:group_invite) do
      arg(:group_id, non_null(:id))
      resolve(&Groups.group_invites/3)
    end
  end

  object :group_mutations do
    field :create_group, :group do
      arg(:name, non_null(:string))
      resolve(&Groups.create_group/3)
    end

    field :rename_group, :group do
      arg(:id, non_null(:id))
      arg(:name, non_null(:string))
      resolve(&Groups.rename_group/3)
    end

    field :delete_group, :boolean do
      arg(:id, non_null(:id))
      resolve(&Groups.delete_group/3)
    end

    field :switch_active_group, :group do
      arg(:id, non_null(:id))
      resolve(&Groups.switch_active_group/3)
    end

    field :leave_group, :boolean do
      arg(:id, non_null(:id))
      resolve(&Groups.leave_group/3)
    end

    field :remove_member, :boolean do
      arg(:group_id, non_null(:id))
      arg(:user_id, non_null(:integer))
      resolve(&Groups.remove_member/3)
    end

    field :generate_invite_code, :group_invite do
      arg(:group_id, non_null(:id))
      arg(:expires_in_days, :integer)
      arg(:max_uses, :integer)
      resolve(&Groups.generate_invite_code/3)
    end

    field :revoke_invite_code, :boolean do
      arg(:invite_id, non_null(:id))
      resolve(&Groups.revoke_invite_code/3)
    end

    field :redeem_invite_code, :redeem_invite_payload do
      arg(:code, non_null(:string))
      resolve(&Groups.redeem_invite_code/3)
    end
  end
end
