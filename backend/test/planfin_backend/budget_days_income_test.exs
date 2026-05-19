defmodule PlanfinBackend.BudgetDaysIncomeTest do
  @moduledoc """
  Tests for compute_today_balance/2 and compute_remaining_total/1 with income entries.

  Income entries (type = "income") increase the available daily balance (when
  is_extra = false) and always increase the remaining total budget.
  """

  use PlanfinBackend.DataCase

  alias PlanfinBackend.BudgetDays
  alias PlanfinBackend.Periods
  alias PlanfinBackend.Expenses.Expense

  import PlanfinBackend.AccountsFixtures

  # Period spanning the whole of June 2026 (30 days).
  # daily_limit = 100, total_budget = 3_000
  @period_attrs %{
    start_date: ~D[2026-06-01],
    end_date: ~D[2026-06-30],
    daily_limit: Decimal.new("100.00"),
    total_budget: Decimal.new("3000.00")
  }

  # Use June 1st as the "today" anchor for all compute_today_balance tests.
  @today ~D[2026-06-01]

  defp setup_period do
    {user, group} = user_with_group_fixture()
    {:ok, period} = Periods.create_period(group.id, @period_attrs)
    {user, group, period}
  end

  defp insert_expense(group, user, period, attrs) do
    defaults = %{
      date: @today,
      group_id: group.id,
      created_by_id: user.id,
      period_id: period.id
    }

    %Expense{}
    |> Expense.changeset(Map.merge(defaults, attrs))
    |> Repo.insert!()
  end

  # ---------------------------------------------------------------------------
  # compute_today_balance/2
  # ---------------------------------------------------------------------------

  describe "compute_today_balance/2 — only expenses" do
    test "balance = daily_limit - sum(expenses) when all are regular expense entries" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("30.00"),
        type: "expense",
        is_extra: false
      })

      insert_expense(group, user, period, %{
        amount: Decimal.new("20.00"),
        type: "expense",
        is_extra: false
      })

      # 1 day elapsed → budget = 100; spent = 50 → balance = 50
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("50.00"))
    end

    test "extra expenses do not reduce the daily balance" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("40.00"),
        type: "expense",
        is_extra: true
      })

      # is_extra = true → excluded from daily calculation; balance = 100
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("100.00"))
    end
  end

  describe "compute_today_balance/2 — only income" do
    test "regular income (is_extra=false) increases the daily balance" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("200.00"),
        type: "income",
        is_extra: false
      })

      # 1 day elapsed → budget = 100; income = 200 → balance = 300
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("300.00"))
    end

    test "extra income (is_extra=true) does NOT increase the daily balance" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("500.00"),
        type: "income",
        is_extra: true
      })

      # is_extra = true → excluded from daily calculation; balance = 100
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("100.00"))
    end

    test "multiple regular income entries all add to the daily balance" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("150.00"),
        type: "income",
        is_extra: false
      })

      insert_expense(group, user, period, %{
        amount: Decimal.new("50.00"),
        type: "income",
        is_extra: false
      })

      # 1 day elapsed → budget = 100; income = 200 → balance = 300
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("300.00"))
    end
  end

  describe "compute_today_balance/2 — mixed expenses and income" do
    test "balance = daily_budget - expenses + regular_income" do
      {user, group, period} = setup_period()

      # expense reduces balance
      insert_expense(group, user, period, %{
        amount: Decimal.new("60.00"),
        type: "expense",
        is_extra: false
      })

      # regular income raises it back up
      insert_expense(group, user, period, %{
        amount: Decimal.new("40.00"),
        type: "income",
        is_extra: false
      })

      # 1 day → budget = 100; -60 + 40 = balance = 80
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("80.00"))
    end

    test "extra expense is excluded; regular income still counts" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("200.00"),
        type: "expense",
        is_extra: true
      })

      insert_expense(group, user, period, %{
        amount: Decimal.new("50.00"),
        type: "income",
        is_extra: false
      })

      # is_extra expense excluded → budget = 100 + 50 income = 150
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("150.00"))
    end
  end

  describe "compute_today_balance/2 — edge cases" do
    test "positive balance when income exceeds expenses" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("30.00"),
        type: "expense",
        is_extra: false
      })

      insert_expense(group, user, period, %{
        amount: Decimal.new("500.00"),
        type: "income",
        is_extra: false
      })

      # 1 day → budget = 100 - 30 + 500 = 570
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("570.00"))
    end

    test "balance is zero when expenses exactly cancel budget" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("100.00"),
        type: "expense",
        is_extra: false
      })

      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("0"))
    end

    test "balance is negative when expenses exceed budget" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("150.00"),
        type: "expense",
        is_extra: false
      })

      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("-50.00"))
    end

    test "no entries: balance equals daily_limit × days_elapsed" do
      {_user, _group, period} = setup_period()

      # 1 day elapsed → 100 × 1 = 100
      balance = BudgetDays.compute_today_balance(period, @today)
      assert Decimal.equal?(balance, Decimal.new("100.00"))
    end
  end

  # ---------------------------------------------------------------------------
  # compute_remaining_total/1
  # ---------------------------------------------------------------------------

  describe "compute_remaining_total/1 — only expenses" do
    test "remaining = total_budget - expenses (regular)" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("500.00"),
        type: "expense",
        is_extra: false
      })

      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("2500.00"))
    end

    test "extra expenses also reduce the total budget" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("300.00"),
        type: "expense",
        is_extra: true
      })

      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("2700.00"))
    end
  end

  describe "compute_remaining_total/1 — only income" do
    test "regular income (is_extra=false) increases the remaining total" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("1000.00"),
        type: "income",
        is_extra: false
      })

      # 3000 + 1000 = 4000
      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("4000.00"))
    end

    test "extra income (is_extra=true) also increases the remaining total" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("500.00"),
        type: "income",
        is_extra: true
      })

      # Both regular and extra income affect total budget
      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("3500.00"))
    end
  end

  describe "compute_remaining_total/1 — mixed expenses and income" do
    test "remaining = total_budget - expenses + income" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("700.00"),
        type: "expense",
        is_extra: false
      })

      insert_expense(group, user, period, %{
        amount: Decimal.new("200.00"),
        type: "income",
        is_extra: false
      })

      # 3000 - 700 + 200 = 2500
      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("2500.00"))
    end

    test "extra expenses and regular income both affect the total" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("400.00"),
        type: "expense",
        is_extra: true
      })

      insert_expense(group, user, period, %{
        amount: Decimal.new("100.00"),
        type: "income",
        is_extra: false
      })

      # 3000 - 400 + 100 = 2700
      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("2700.00"))
    end
  end

  describe "compute_remaining_total/1 — edge cases" do
    test "income exceeds total budget → remaining is greater than total_budget" do
      {user, group, period} = setup_period()

      insert_expense(group, user, period, %{
        amount: Decimal.new("5000.00"),
        type: "income",
        is_extra: false
      })

      # 3000 + 5000 = 8000
      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("8000.00"))
    end

    test "income covers expenses → positive remaining when total spent > total_budget" do
      {user, group, period} = setup_period()

      # Overspend the budget
      insert_expense(group, user, period, %{
        amount: Decimal.new("3500.00"),
        type: "expense",
        is_extra: false
      })

      # Income brings it back to positive
      insert_expense(group, user, period, %{
        amount: Decimal.new("1000.00"),
        type: "income",
        is_extra: false
      })

      # 3000 - 3500 + 1000 = 500
      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("500.00"))
    end

    test "no entries: remaining equals total_budget" do
      {_user, _group, period} = setup_period()

      remaining = BudgetDays.compute_remaining_total(period)
      assert Decimal.equal?(remaining, Decimal.new("3000.00"))
    end
  end
end
