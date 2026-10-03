defmodule PlanfinBackendWeb.Schema do
  use Absinthe.Schema

  import_types(PlanfinBackendWeb.Schema.AccountTypes)
  import_types(PlanfinBackendWeb.Schema.BudgetTypes)
  import_types(PlanfinBackendWeb.Schema.GroupTypes)
  import_types(PlanfinBackendWeb.Schema.FinanceTypes)

  query do
    import_fields(:account_queries)
    import_fields(:budget_queries)
    import_fields(:group_queries)
    import_fields(:finance_queries)
  end

  mutation do
    import_fields(:account_mutations)
    import_fields(:budget_mutations)
    import_fields(:group_mutations)
    import_fields(:finance_mutations)
  end

  # Top-level fields only: that is where resolvers return errors.
  def middleware(middleware, _field, %{identifier: kind}) when kind in [:query, :mutation] do
    middleware ++ [PlanfinBackendWeb.Middleware.LogErrors]
  end

  def middleware(middleware, _field, _object), do: middleware
end
