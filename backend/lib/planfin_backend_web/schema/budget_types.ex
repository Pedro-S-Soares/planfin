defmodule PlanfinBackendWeb.Schema.BudgetTypes do
  use Absinthe.Schema.Notation

  alias PlanfinBackendWeb.Resolvers.Budget

  object :category do
    field :id, :id
    field :name, :string
    field :subcategories, list_of(:subcategory)
  end

  object :subcategory do
    field :id, :id
    field :name, :string
    field :category_id, :id
  end

  object :budget_day do
    field :id, :id
    field :date, :string
    field :daily_limit, :string
    field :carryover, :string
    field :available_balance, :string
    field :closed_at, :string
  end

  object :period do
    field :id, :id
    field :start_date, :string
    field :end_date, :string
    field :daily_limit, :string
    field :status, :string
    field :today, :budget_day
  end

  object :expense do
    field :id, :id
    field :amount, :string
    field :date, :string
    field :note, :string
    field :subcategory, :subcategory
  end

  object :expense_day do
    field :date, :string
    field :total, :string
    field :expenses, list_of(:expense)
  end

  object :period_summary do
    field :total_budgeted, :string
    field :total_spent, :string
    field :difference, :string
    field :days_count, :integer
  end

  object :budget_queries do
    field :active_period, :period do
      resolve(&Budget.active_period/3)
    end

    field :expense_history, list_of(:expense_day) do
      arg(:period_id, non_null(:id))
      resolve(&Budget.expense_history/3)
    end

    field :period_summary, :period_summary do
      arg(:period_id, non_null(:id))
      resolve(&Budget.period_summary/3)
    end

    field :categories, list_of(:category) do
      resolve(&Budget.list_categories/3)
    end

    field :periods, list_of(:period) do
      resolve(&Budget.list_periods/3)
    end
  end

  object :budget_mutations do
    field :create_period, :period do
      arg(:start_date, non_null(:string))
      arg(:end_date, non_null(:string))
      arg(:daily_limit, non_null(:string))
      resolve(&Budget.create_period/3)
    end

    field :create_expense, :expense do
      arg(:amount, non_null(:string))
      arg(:date, non_null(:string))
      arg(:note, :string)
      arg(:subcategory_id, :id)
      resolve(&Budget.create_expense/3)
    end

    field :delete_expense, :boolean do
      arg(:id, non_null(:id))
      resolve(&Budget.delete_expense/3)
    end

    field :create_category, :category do
      arg(:name, non_null(:string))
      resolve(&Budget.create_category/3)
    end

    field :update_category, :category do
      arg(:id, non_null(:id))
      arg(:name, non_null(:string))
      resolve(&Budget.update_category/3)
    end

    field :delete_category, :boolean do
      arg(:id, non_null(:id))
      resolve(&Budget.delete_category/3)
    end

    field :create_subcategory, :subcategory do
      arg(:category_id, non_null(:id))
      arg(:name, non_null(:string))
      resolve(&Budget.create_subcategory/3)
    end

    field :update_subcategory, :subcategory do
      arg(:id, non_null(:id))
      arg(:name, non_null(:string))
      resolve(&Budget.update_subcategory/3)
    end

    field :delete_subcategory, :boolean do
      arg(:id, non_null(:id))
      resolve(&Budget.delete_subcategory/3)
    end
  end
end
