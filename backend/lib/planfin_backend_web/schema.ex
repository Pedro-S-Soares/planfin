defmodule PlanfinBackendWeb.Schema do
  use Absinthe.Schema

  import_types(PlanfinBackendWeb.Schema.AccountTypes)
  import_types(PlanfinBackendWeb.Schema.BudgetTypes)

  query do
    import_fields(:account_queries)
    import_fields(:budget_queries)
  end

  mutation do
    import_fields(:account_mutations)
    import_fields(:budget_mutations)
  end
end
