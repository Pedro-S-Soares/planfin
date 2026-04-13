defmodule PlanfinBackendWeb.Schema do
  use Absinthe.Schema

  import_types PlanfinBackendWeb.Schema.AccountTypes

  query do
    import_fields :account_queries
  end

  mutation do
    import_fields :account_mutations
  end
end
