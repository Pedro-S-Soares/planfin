defmodule PlanfinBackend.BudgetDaysTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.BudgetDays
  alias PlanfinBackend.Periods.{Period, BudgetDay}
  alias PlanfinBackend.Expenses.Expense

  import PlanfinBackend.AccountsFixtures

  # Helper to create a period bypassing the check_no_active_period guard
  defp insert_period(group_id, attrs \\ %{}) do
    defaults = %{
      start_date: ~D[2026-01-01],
      end_date: ~D[2026-12-31],
      daily_limit: Decimal.new("100.00"),
      status: "active",
      group_id: group_id
    }

    %Period{}
    |> Period.changeset(Map.merge(defaults, attrs))
    |> Repo.insert!()
  end

  defp insert_budget_day(period, attrs) do
    defaults = %{
      period_id: period.id,
      date: ~D[2026-01-01],
      daily_limit: period.daily_limit,
      carryover: Decimal.new("0.00"),
      closed_at: nil
    }

    %BudgetDay{}
    |> BudgetDay.changeset(Map.merge(defaults, attrs))
    |> Repo.insert!()
  end

  defp insert_expense(group, user, period, budget_day, amount) do
    %Expense{}
    |> Expense.changeset(%{
      amount: Decimal.new(amount),
      date: budget_day.date,
      group_id: group.id,
      created_by_id: user.id,
      period_id: period.id,
      budget_day_id: budget_day.id
    })
    |> Repo.insert!()
  end

  describe "close_past_days/1" do
    test "returns {:ok, period} when no open days in the past" do
      {_user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      today = Date.utc_today()
      insert_budget_day(period, %{date: today})

      assert {:ok, ^period} = BudgetDays.close_past_days(period)
    end

    test "closes a past open day and calculates positive carryover (spent < limit)" do
      {user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      past_date = Date.add(Date.utc_today(), -2)

      bd =
        insert_budget_day(period, %{
          date: past_date,
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("0.00")
        })

      insert_expense(group, user, period, bd, "60.00")

      assert {:ok, _period} = BudgetDays.close_past_days(period)

      closed_day = Repo.get!(BudgetDay, bd.id)
      assert closed_day.closed_at != nil

      next_date = Date.add(past_date, 1)
      next_day = Repo.get_by!(BudgetDay, period_id: period.id, date: next_date)
      assert Decimal.equal?(next_day.carryover, Decimal.new("40.00"))
    end

    test "closes a past open day and calculates negative carryover (spent > limit)" do
      {user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      past_date = Date.add(Date.utc_today(), -2)

      bd =
        insert_budget_day(period, %{
          date: past_date,
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("0.00")
        })

      insert_expense(group, user, period, bd, "150.00")

      assert {:ok, _period} = BudgetDays.close_past_days(period)

      next_date = Date.add(past_date, 1)
      next_day = Repo.get_by!(BudgetDay, period_id: period.id, date: next_date)
      assert Decimal.equal?(next_day.carryover, Decimal.new("-50.00"))
    end

    test "creates budget_day for the next day with the calculated carryover" do
      {user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      past_date = Date.add(Date.utc_today(), -2)

      bd =
        insert_budget_day(period, %{
          date: past_date,
          daily_limit: Decimal.new("80.00"),
          carryover: Decimal.new("20.00")
        })

      insert_expense(group, user, period, bd, "50.00")

      assert {:ok, _period} = BudgetDays.close_past_days(period)

      next_date = Date.add(past_date, 1)
      next_day = Repo.get_by!(BudgetDay, period_id: period.id, date: next_date)
      assert next_day != nil
      assert Decimal.equal?(next_day.daily_limit, Decimal.new("80.00"))
      assert Decimal.equal?(next_day.carryover, Decimal.new("50.00"))
      assert next_day.closed_at == nil
    end

    test "closes multiple past days in cascade in the correct order" do
      {user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      day1 = Date.add(Date.utc_today(), -4)
      day2 = Date.add(Date.utc_today(), -3)
      day3 = Date.add(Date.utc_today(), -2)

      bd1 =
        insert_budget_day(period, %{
          date: day1,
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("0.00")
        })

      bd2 =
        insert_budget_day(period, %{
          date: day2,
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("0.00")
        })

      bd3 =
        insert_budget_day(period, %{
          date: day3,
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("0.00")
        })

      insert_expense(group, user, period, bd1, "60.00")
      insert_expense(group, user, period, bd2, "80.00")
      insert_expense(group, user, period, bd3, "30.00")

      assert {:ok, _period} = BudgetDays.close_past_days(period)

      assert Repo.get!(BudgetDay, bd1.id).closed_at != nil
      assert Repo.get!(BudgetDay, bd2.id).closed_at != nil
      assert Repo.get!(BudgetDay, bd3.id).closed_at != nil
    end

    test "abandons period when gap > 60 days" do
      {_user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      very_old_date = Date.add(Date.utc_today(), -61)
      insert_budget_day(period, %{date: very_old_date})

      assert {:abandoned, _period} = BudgetDays.close_past_days(period)

      updated_period = Repo.get!(Period, period.id)
      assert updated_period.status == "abandoned"
    end

    test "does NOT abandon period when gap = 60 days (boundary is exclusive, > 60)" do
      {_user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      sixty_days_ago = Date.add(Date.utc_today(), -60)
      insert_budget_day(period, %{date: sixty_days_ago})

      assert {:ok, _period} = BudgetDays.close_past_days(period)

      updated_period = Repo.get!(Period, period.id)
      assert updated_period.status == "active"
    end
  end

  describe "get_or_create_today/1" do
    test "returns existing budget_day for today" do
      {_user, group} = user_with_group_fixture()
      period = insert_period(group.id)
      today = Date.utc_today()
      bd = insert_budget_day(period, %{date: today})

      assert {:ok, found} = BudgetDays.get_or_create_today(period)
      assert found.id == bd.id
      assert found.date == today
    end

    test "creates budget_day when none exists for today" do
      {_user, group} = user_with_group_fixture()
      period = insert_period(group.id, %{daily_limit: Decimal.new("75.00")})

      today = Date.utc_today()
      assert {:ok, created} = BudgetDays.get_or_create_today(period)

      assert created.date == today
      assert Decimal.equal?(created.daily_limit, Decimal.new("75.00"))
      assert Decimal.equal?(created.carryover, Decimal.new("0"))
      assert created.period_id == period.id
    end
  end

  describe "available_balance/1" do
    test "calculates correctly: daily_limit + carryover - sum(expenses)" do
      {user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      bd =
        insert_budget_day(period, %{
          date: ~D[2026-02-01],
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("20.00")
        })

      insert_expense(group, user, period, bd, "30.00")
      insert_expense(group, user, period, bd, "15.00")

      bd_with_expenses = Repo.preload(Repo.get!(BudgetDay, bd.id), :expenses)
      balance = BudgetDays.available_balance(bd_with_expenses)

      assert Decimal.equal?(balance, Decimal.new("75.00"))
    end

    test "returns daily_limit + carryover when there are no expenses" do
      {_user, group} = user_with_group_fixture()
      period = insert_period(group.id)

      bd =
        insert_budget_day(period, %{
          date: ~D[2026-02-01],
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("10.00")
        })

      bd_with_expenses = Repo.preload(Repo.get!(BudgetDay, bd.id), :expenses)
      balance = BudgetDays.available_balance(bd_with_expenses)

      assert Decimal.equal?(balance, Decimal.new("110.00"))
    end
  end
end
