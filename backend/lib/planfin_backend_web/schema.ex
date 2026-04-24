defmodule PlanfinBackendWeb.Schema do
  use Absinthe.Schema

  import_types(PlanfinBackendWeb.Schema.AccountTypes)
  import_types(PlanfinBackendWeb.Schema.BudgetTypes)
  import_types(PlanfinBackendWeb.Schema.GroupTypes)

  query do
    import_fields(:account_queries)
    import_fields(:budget_queries)
    import_fields(:group_queries)
  end

  mutation do
    import_fields(:account_mutations)
    import_fields(:budget_mutations)
    import_fields(:group_mutations)
  end
end
