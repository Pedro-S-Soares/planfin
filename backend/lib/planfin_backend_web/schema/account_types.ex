defmodule PlanfinBackendWeb.Schema.AccountTypes do
  use Absinthe.Schema.Notation

  alias PlanfinBackendWeb.Resolvers.Accounts

  object :user do
    field :id, :id
    field :email, :string
    field :name, :string
  end

  object :auth_payload do
    field :token, :string
    field :user, :user
  end

  object :account_queries do
    field :me, :user do
      resolve(&Accounts.me/3)
    end
  end

  object :account_mutations do
    field :register_user, :auth_payload do
      arg(:email, non_null(:string))
      arg(:password, non_null(:string))
      arg(:password_confirmation, non_null(:string))
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
  end
end
