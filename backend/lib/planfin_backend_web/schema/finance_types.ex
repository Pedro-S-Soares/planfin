defmodule PlanfinBackendWeb.Schema.FinanceTypes do
  use Absinthe.Schema.Notation

  alias PlanfinBackendWeb.Resolvers.Finance

  @desc "Checking account, credit card, allowance account or reserve of the group"
  object :financial_account do
    field :id, :id
    field :name, :string
    @desc "checking | credit_card | allowance | reserve | benefit"
    field :kind, :string
    field :is_primary, :boolean
    @desc "Live balance (nil for cards)"
    field :balance, :string
    field :balance_date, :string
    field :closing_day, :integer
    field :due_day, :integer
    @desc "Target for the card invoice"
    field :invoice_goal, :string
    @desc "Benefit accounts: amount credited every month"
    field :monthly_credit, :string
    @desc "Benefit accounts: day of the month the credit arrives"
    field :credit_day, :integer
    field :next_credit_date, :string
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

  object :recurring_bill do
    field :id, :id
    @desc "expense | income"
    field :direction, :string
    @desc "YYYY-MM when it happens only in that month"
    field :once_month, :string
    field :name, :string
    @desc "Estimated monthly amount"
    field :amount, :string
    field :due_day, :integer
    field :account, :expense_account
    field :subcategory, :subcategory
  end

  @desc "A recurring bill in a given month"
  object :bill_occurrence do
    field :bill, :recurring_bill
    @desc "YYYY-MM"
    field :month, :string
    field :due_date, :string
    @desc "Due date of the following month"
    field :next_due_date, :string
    @desc "pending | overdue | paid | skipped"
    field :status, :string
    @desc "Date of the payment/charge when paid"
    field :paid_on, :string
    @desc "Real amount when paid, estimate otherwise"
    field :amount, :string
    field :expense_id, :id
  end

  @desc "Something that must leave the primary account before the next money arrives"
  object :commitment do
    @desc "invoice | bill"
    field :kind, :string
    field :label, :string
    field :due_date, :string
    field :amount, :string
    field :status, :string
    field :card_id, :id
    field :bill_id, :id
    field :month, :string
  end

  object :finance_panel do
    field :has_accounts, :boolean
    field :primary_account_id, :id
    @desc "Tenho: live balance of the primary account"
    field :available, :string
    @desc "Comprometido: invoices and bills due until horizonDate"
    field :committed, :string
    @desc "Posso gastar: available − committed"
    field :free, :string
    field :horizon_date, :string
    field :commitments, list_of(:commitment)
    field :salary, :salary_info
  end

  object :salary_info do
    field :configured, :boolean
    field :amount, :string
    @desc "First day of the current cycle (this cycle's salary date)"
    field :cycle_start_date, :string
    field :next_salary_date, :string
    @desc "The salary of the current cycle has not been registered yet"
    field :pending, :boolean
  end

  object :financial_settings do
    field :salary_amount, :string
    field :salary_business_day, :integer
    field :salary_account_id, :id
    field :reserve_goal, :string
    @desc "Next salary dates (with manual overrides applied)"
    field :upcoming_salary_dates, list_of(:salary_date)
  end

  object :salary_date do
    @desc "YYYY-MM"
    field :month, :string
    field :date, :string
    field :is_manual, :boolean
  end

  @desc "Budget proposal for a salary cycle"
  object :cycle_proposal do
    field :start_date, :string
    field :end_date, :string
    field :days, :integer
    field :salary, :string
    @desc "Fixed bills paid from accounts"
    field :account_bills, :string
    @desc "Fixed bills charged on cards"
    field :card_bills, :string
    @desc "Installments 2..N landing on the invoice this cycle pays into"
    field :installments, :string
    @desc "salary − bills − installments, before the gordura"
    field :available, :string
  end

  object :allowance_share do
    field :account_id, :id
    field :account_name, :string
    field :owner_name, :string
    field :amount, :string
  end

  @desc "End-of-cycle left over, split between the allowance accounts"
  object :allowance_plan do
    field :cycle_end_date, :string
    @desc "First day the distribution is offered (cycle closing)"
    field :opens_on, :string
    field :free, :string
    @desc "Part of the free money kept because the next salary can't cover what is on it"
    field :shortfall, :string
    field :amount, :string
    field :can_distribute, :boolean
    @desc "Allowance already transferred in this cycle"
    field :distributed, :string
    field :shares, list_of(:allowance_share)
  end

  object :reserve_status do
    field :goal, :string
    field :total, :string
  end

  object :plan_item do
    field :label, :string
    field :date, :string
    field :amount, :string
  end

  @desc "This month: today until the eve of next month's salary"
  object :month_plan_current do
    field :end_date, :string
    field :has_primary, :boolean
    @desc "Primary account balance today"
    field :balance, :string
    @desc "Salaries still to come in the window"
    field :salaries, list_of(:plan_item)
    @desc "Expected incomes still to come"
    field :incomes, list_of(:plan_item)
    @desc "Card invoices due in the window"
    field :invoices, list_of(:plan_item)

    @desc "Latest due date of the invoices in the window; inflows up to it count before the 'resto'"
    field :invoice_due_date, :string
    @desc "Money in the account on the invoice due date, after paying it"
    field :after_invoices, :string
    @desc "Recurring bills paid from accounts"
    field :fixed_bills, list_of(:plan_item)
    @desc "One-off bills paid from accounts"
    field :one_off_bills, list_of(:plan_item)
    @desc "What is left at the month closing (allowance when positive)"
    field :leftover, :string
  end

  @desc "Next month: the cycle opened by next month's salary"
  object :month_plan_next do
    field :start_date, :string
    field :end_date, :string
    field :days, :integer
    field :salary, :plan_item
    @desc "Meal voucher balances"
    field :benefits, list_of(:plan_item)
    @desc "Every recurring bill (accounts and cards)"
    field :fixed_bills, list_of(:plan_item)
    field :installments, list_of(:plan_item)
    @desc "Left for variable spending"
    field :remaining, :string
  end

  object :month_plan do
    field :current, :month_plan_current
    field :next, :month_plan_next
  end

  object :finance_queries do
    @desc "The monthly plan; null when the salary is not configured"
    field :month_plan, :month_plan do
      arg(:today, :string)
      resolve(&Finance.month_plan/3)
    end

    field :allowance_plan, :allowance_plan do
      arg(:today, :string)
      resolve(&Finance.allowance_plan/3)
    end

    field :reserve_status, :reserve_status do
      arg(:today, :string)
      resolve(&Finance.reserve_status/3)
    end

    field :finance_panel, :finance_panel do
      arg(:today, :string)
      resolve(&Finance.panel/3)
    end

    field :financial_settings, :financial_settings do
      arg(:today, :string)
      resolve(&Finance.get_settings/3)
    end

    field :cycle_proposal, :cycle_proposal do
      arg(:today, :string)
      resolve(&Finance.cycle_proposal/3)
    end

    field :recurring_bills, list_of(:recurring_bill) do
      resolve(&Finance.list_bills/3)
    end

    field :bill_occurrences, list_of(:bill_occurrence) do
      @desc "YYYY-MM"
      arg(:month, non_null(:string))
      arg(:today, :string)
      resolve(&Finance.bill_occurrences/3)
    end

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
    @desc "Set the invoice total to the bank's number; the difference becomes one adjustment entry"
    field :set_invoice_total, :invoice do
      arg(:card_id, non_null(:id))
      arg(:month, non_null(:string))
      arg(:total, non_null(:string))
      arg(:today, :string)
      resolve(&Finance.set_invoice_total/3)
    end

    @desc "Use a daily goal from today until the eve of next month's salary"
    field :apply_daily_goal, :period do
      arg(:daily, non_null(:string))
      @desc "Last day of the new period; defaults to the eve of next month's salary"
      arg(:end_date, :string)
      arg(:today, :string)
      resolve(&Finance.apply_daily_goal/3)
    end

    @desc "Transfer the end-of-cycle left over to the allowance accounts in equal parts"
    field :distribute_allowance, :allowance_plan do
      arg(:amount, :string)
      arg(:today, :string)
      resolve(&Finance.distribute_allowance/3)
    end

    field :update_financial_settings, :financial_settings do
      arg(:salary_amount, :string)
      arg(:salary_business_day, :integer)
      arg(:salary_account_id, :id)
      arg(:reserve_goal, :string)
      arg(:today, :string)
      resolve(&Finance.update_settings/3)
    end

    @desc "Manual salary date for a month (null date restores the automatic one)"
    field :set_salary_date, :boolean do
      arg(:month, non_null(:string))
      arg(:date, :string)
      resolve(&Finance.set_salary_date/3)
    end

    @desc "Record the salary as income on the salary account"
    field :register_salary, :expense do
      arg(:amount, :string)
      arg(:date, non_null(:string))
      resolve(&Finance.register_salary/3)
    end

    field :create_recurring_bill, :recurring_bill do
      arg(:direction, :string)
      @desc "YYYY-MM to make it a one-month item; empty string clears"
      arg(:once_month, :string)
      arg(:name, non_null(:string))
      arg(:amount, non_null(:string))
      arg(:due_day, non_null(:integer))
      arg(:account_id, non_null(:id))
      arg(:subcategory_id, :id)
      resolve(&Finance.create_bill/3)
    end

    field :update_recurring_bill, :recurring_bill do
      arg(:direction, :string)
      @desc "YYYY-MM to make it a one-month item; empty string clears"
      arg(:once_month, :string)
      arg(:id, non_null(:id))
      arg(:name, :string)
      arg(:amount, :string)
      arg(:due_day, :integer)
      arg(:account_id, :id)
      arg(:subcategory_id, :id)
      resolve(&Finance.update_bill/3)
    end

    field :delete_recurring_bill, :boolean do
      arg(:id, non_null(:id))
      resolve(&Finance.delete_bill/3)
    end

    @desc "Mark the bill of a month as paid, recording the real amount"
    field :pay_bill, :bill_occurrence do
      arg(:bill_id, non_null(:id))
      arg(:month, non_null(:string))
      arg(:amount, non_null(:string))
      arg(:date, non_null(:string))
      resolve(&Finance.pay_bill/3)
    end

    field :unpay_bill, :boolean do
      arg(:bill_id, non_null(:id))
      arg(:month, non_null(:string))
      resolve(&Finance.unpay_bill/3)
    end

    field :create_financial_account, :financial_account do
      arg(:name, non_null(:string))
      arg(:kind, non_null(:string))
      arg(:balance, :string)
      arg(:closing_day, :integer)
      arg(:due_day, :integer)
      arg(:monthly_credit, :string)
      arg(:credit_day, :integer)
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
      arg(:invoice_goal, :string)
      arg(:monthly_credit, :string)
      arg(:credit_day, :integer)
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
