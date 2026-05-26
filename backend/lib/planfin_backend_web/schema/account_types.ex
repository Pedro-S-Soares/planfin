defmodule PlanfinBackendWeb.Schema.AccountTypes do
  use Absinthe.Schema.Notation

  alias PlanfinBackendWeb.Resolvers.Accounts

  object :user do
    field :id, :id
    field :email, :string
    field :name, :string
    field :is_admin, :boolean
  end

  object :auth_payload do
    field :token, :string
    field :user, :user
  end

  object :user_invite do
    field :id, :id
    field :token, :string
    field :used_by_email, :string
    field :used_at, :string
    field :expires_at, :string
    field :revoked_at, :string
    field :inserted_at, :string
    field :invited_by, :user
  end

  object :account_queries do
    field :me, :user do
      resolve(&Accounts.me/3)
    end

    field :list_invites, list_of(:user_invite) do
      resolve(&Accounts.list_invites/3)
    end
  end

  object :account_mutations do
    field :register_user, :auth_payload do
      arg(:email, non_null(:string))
      arg(:password, non_null(:string))
      arg(:password_confirmation, non_null(:string))
      arg(:invite_token, non_null(:string))
      resolve(&Accounts.register_user/3)
    end

    field :login, :auth_payload do
      arg(:email, non_null(:string))
      arg(:password, non_null(:string))
      resolve(&Accounts.login/3)
    end

    field :logout, :boolean do
      resolve(&Accounts.logout/3)
    end

    field :forgot_password, :boolean do
      arg(:email, non_null(:string))
      resolve(&Accounts.forgot_password/3)
    end

    field :reset_password, :boolean do
      arg(:token, non_null(:string))
      arg(:password, non_null(:string))
      arg(:password_confirmation, non_null(:string))
      resolve(&Accounts.reset_password/3)
    end

    field :update_profile, :user do
      arg(:name, :string)
      resolve(&Accounts.update_profile/3)
    end

    field :create_invite, :user_invite do
      resolve(&Accounts.create_invite/3)
    end

    field :revoke_invite, :boolean do
      arg(:id, non_null(:id))
      resolve(&Accounts.revoke_invite/3)
    end
  end
end
