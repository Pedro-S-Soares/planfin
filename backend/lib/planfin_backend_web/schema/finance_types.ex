defmodule PlanfinBackendWeb.Schema.FinanceTypes do
  use Absinthe.Schema.Notation

  alias PlanfinBackendWeb.Resolvers.Finance

  @desc "Checking account, credit card, allowance account or reserve of the group"
  object :financial_account do
    field :id, :id
    field :name, :string
    @desc "checking | credit_card | allowance | reserve"
    field :kind, :string
    field :is_primary, :boolean
    @desc "Live balance (nil for cards)"
    field :balance, :string
    field :balance_date, :string
    field :closing_day, :integer
    field :due_day, :integer
    field :owner, :user
  end

  @desc "Credit card invoice of a month, computed from the card's entries"
  object :invoice do
    field :card_id, :id
    @desc "YYYY-MM"
    field :month, :string
    field :start_date, :string
    field :closing_date, :string
    field :due_date, :string
    field :total, :string
    field :paid, :string
    field :remaining, :string
    @desc "open | closed | partial | paid | overdue"
    field :status, :string
    field :entries, list_of(:expense)
  end

  object :account_movement do
    field :id, :id
    @desc "entry | transfer"
    field :kind, :string
    field :date, :string
    field :description, :string
    @desc "Signed from the account's point of view"
    field :amount, :string
  end

  object :transfer do
    field :id, :id
    field :from_account_id, :id
    field :to_account_id, :id
    field :amount, :string
    field :date, :string
    field :kind, :string
    field :invoice_month, :string
    field :note, :string
  end

  object :finance_queries do
    field :financial_accounts, list_of(:financial_account) do
      arg(:today, :string)
      resolve(&Finance.list_accounts/3)
    end

    @desc "Invoices of a card: closed ones before the current, the current and future ones with installments"
    field :invoices, list_of(:invoice) do
      arg(:card_id, non_null(:id))
      arg(:today, :string)
      arg(:past, :integer)
      resolve(&Finance.list_invoices/3)
    end

    field :invoice, :invoice do
      arg(:card_id, non_null(:id))
      arg(:month, non_null(:string))
      arg(:today, :string)
      resolve(&Finance.get_invoice/3)
    end

    field :account_movements, list_of(:account_movement) do
      arg(:account_id, non_null(:id))
      arg(:limit, :integer)
      resolve(&Finance.list_movements/3)
    end
  end

  object :finance_mutations do
    field :create_financial_account, :financial_account do
      arg(:name, non_null(:string))
      arg(:kind, non_null(:string))
      arg(:balance, :string)
      arg(:closing_day, :integer)
      arg(:due_day, :integer)
      arg(:owner_user_id, :id)
      arg(:today, :string)
      resolve(&Finance.create_account/3)
    end

    field :update_financial_account, :financial_account do
      arg(:id, non_null(:id))
      arg(:name, :string)
      arg(:closing_day, :integer)
      arg(:due_day, :integer)
      arg(:owner_user_id, :id)
      resolve(&Finance.update_account/3)
    end

    field :make_primary_account, :financial_account do
      arg(:id, non_null(:id))
      resolve(&Finance.make_primary/3)
    end

    field :archive_financial_account, :boolean do
      arg(:id, non_null(:id))
      resolve(&Finance.archive_account/3)
    end

    @desc "Reconcile the account with the bank: its balance today becomes `balance`"
    field :set_account_balance, :financial_account do
      arg(:id, non_null(:id))
      arg(:balance, non_null(:string))
      arg(:today, :string)
      resolve(&Finance.set_balance/3)
    end

    field :create_transfer, :transfer do
      arg(:from_account_id, non_null(:id))
      arg(:to_account_id, non_null(:id))
      arg(:amount, non_null(:string))
      arg(:date, non_null(:string))
      arg(:kind, :string)
      arg(:note, :string)
      resolve(&Finance.create_transfer/3)
    end

    field :delete_transfer, :boolean do
      arg(:id, non_null(:id))
      resolve(&Finance.delete_transfer/3)
    end

    @desc "Pay (part of) a card invoice from another account"
    field :pay_invoice, :invoice do
      arg(:card_id, non_null(:id))
      arg(:month, non_null(:string))
      arg(:from_account_id, non_null(:id))
      arg(:amount, non_null(:string))
      arg(:date, non_null(:string))
      resolve(&Finance.pay_invoice/3)
    end

    @desc "Move the entries without account dated on/after fromDate to the account. Returns how many moved."
    field :assign_entries_to_account, :integer do
      arg(:account_id, non_null(:id))
      arg(:from_date, non_null(:string))
      resolve(&Finance.assign_entries/3)
    end
  end
end
