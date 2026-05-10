defmodule PlanfinBackend.PeriodsTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.Periods
  alias PlanfinBackend.Periods.{Period, BudgetDay}

  import PlanfinBackend.AccountsFixtures

  def valid_period_attrs(overrides \\ %{}) do
    Map.merge(
      %{
        start_date: ~D[2026-04-01],
        end_date: ~D[2026-04-30],
        daily_limit: Decimal.new("100.00"),
        total_budget: Decimal.new("3000.00")
      },
      overrides
    )
  end

  describe "create_period/2" do
    test "creates period with valid attrs and also creates budget_day for start_date" do
      {_user, group} = user_with_group_fixture()

      # Use a future start_date so exactly one BudgetDay is created (for start_date / today)
      today = Date.utc_today()
      future_start = Date.add(today, 5)
      future_end = Date.add(today, 35)

      attrs =
        valid_period_attrs(%{
          start_date: future_start,
          end_date: future_end,
          total_budget: Decimal.new("3100.00")
        })

      assert {:ok, %Period{} = period} = Periods.create_period(group.id, attrs)

      assert period.group_id == group.id
      assert period.status == "active"
      assert period.start_date == future_start
      assert period.end_date == future_end
      assert Decimal.equal?(period.daily_limit, Decimal.new("100.00"))

      # With a future start_date, only the start_date BudgetDay is created
      budget_days = Repo.all(BudgetDay)
      assert length(budget_days) == 1
      [day] = budget_days
      assert day.period_id == period.id
      assert day.date == period.start_date
      assert Decimal.equal?(day.carryover, Decimal.new("0.00"))
      assert Decimal.equal?(day.daily_limit, period.daily_limit)
    end

    test "retroactively generates BudgetDays when start_date is in the past" do
      {user, group} = user_with_group_fixture()

      # 5-day period entirely in the past: 3 days ago → yesterday
      today = Date.utc_today()
      start_date = Date.add(today, -4)
      end_date = Date.add(today, 30)

      attrs = %{
        start_date: start_date,
        end_date: end_date,
        daily_limit: Decimal.new("100.00"),
        total_budget: Decimal.new("3500.00")
      }

      assert {:ok, %Period{} = period} = Periods.create_period(group.id, attrs)

      # Expect BudgetDays for start_date..today (5 days: -4, -3, -2, -1, 0)
      budget_days =
        BudgetDay
        |> Repo.all()
        |> Enum.sort_by(& &1.date, Date)

      assert length(budget_days) == 5

      # First day: carryover = 0, no expenses
      [day0 | rest] = budget_days
      assert day0.date == start_date
      assert Decimal.equal?(day0.carryover, Decimal.new("0"))

      # All days belong to this period
      Enum.each(budget_days, fn d ->
        assert d.period_id == period.id
        assert Decimal.equal?(d.daily_limit, Decimal.new("100.00"))
      end)

      _ = user
      _ = rest
    end

    test "retroactive carryover propagates correctly using expenses" do
      {user, group} = user_with_group_fixture()

      today = Date.utc_today()
      # Create the period going back 3 days (days: -3, -2, -1, today)
      start_date = Date.add(today, -3)
      end_date = Date.add(today, 10)

      attrs = %{
        start_date: start_date,
        end_date: end_date,
        daily_limit: Decimal.new("100.00"),
        total_budget: Decimal.new("1500.00")
      }

      # Insert an expense for start_date (day 0) BEFORE creating the period
      # so the retroactive generation picks it up.
      # We need a dummy period + budget_day just to attach the expense.
      dummy_period =
        %Period{}
        |> Period.changeset(%{
          start_date: start_date,
          end_date: end_date,
          daily_limit: Decimal.new("100.00"),
          total_budget: Decimal.new("1500.00"),
          group_id: group.id
        })
        |> Repo.insert!()

      dummy_bd =
        %BudgetDay{}
        |> BudgetDay.changeset(%{
          period_id: dummy_period.id,
          date: start_date,
          daily_limit: Decimal.new("100.00"),
          carryover: Decimal.new("0")
        })
        |> Repo.insert!()

      alias PlanfinBackend.Expenses.Expense

      # Spend 60 on start_date → carryover to next day = max(0, 100+0-60) = 40
      %Expense{}
      |> Expense.changeset(%{
        amount: Decimal.new("60.00"),
        date: start_date,
        group_id: group.id,
        created_by_id: user.id,
        period_id: dummy_period.id,
        budget_day_id: dummy_bd.id
      })
      |> Repo.insert!()

      assert {:ok, %Period{} = period} = Periods.create_period(group.id, attrs)

      budget_days =
        BudgetDay
        |> where([bd], bd.period_id == ^period.id)
        |> Repo.all()
        |> Enum.sort_by(& &1.date, Date)

      # day 0 (start_date): carryover = 0
      day0 = Enum.at(budget_days, 0)
      assert day0.date == start_date
      assert Decimal.equal?(day0.carryover, Decimal.new("0"))

      # day 1 (start_date + 1): carryover = max(0, 100+0-60) = 40
      day1 = Enum.at(budget_days, 1)
      assert day1.date == Date.add(start_date, 1)
      assert Decimal.equal?(day1.carryover, Decimal.new("40.00"))

      # day 2 (start_date + 2): no expense on day1, carryover = max(0, 100+40-0) = 140
      day2 = Enum.at(budget_days, 2)
      assert day2.date == Date.add(start_date, 2)
      assert Decimal.equal?(day2.carryover, Decimal.new("140.00"))
    end

    test "does not create duplicate BudgetDays if called again for same period" do
      {_user, group} = user_with_group_fixture()

      today = Date.utc_today()
      future_start = Date.add(today, 1)
      future_end = Date.add(today, 30)

      attrs =
        valid_period_attrs(%{
          start_date: future_start,
          end_date: future_end,
          total_budget: Decimal.new("3000.00")
        })

      assert {:ok, %Period{} = _period} = Periods.create_period(group.id, attrs)

      # Only one BudgetDay should exist
      budget_days = Repo.all(BudgetDay)
      assert length(budget_days) == 1
    end

    test "returns changeset error when end_date <= start_date" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} =
               Periods.create_period(group.id, valid_period_attrs(%{end_date: ~D[2026-04-01]}))

      assert %{end_date: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when end_date is before start_date" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} =
               Periods.create_period(group.id, valid_period_attrs(%{end_date: ~D[2026-03-01]}))

      assert %{end_date: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when daily_limit is zero" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} =
               Periods.create_period(
                 group.id,
                 valid_period_attrs(%{daily_limit: Decimal.new("0")})
               )

      assert %{daily_limit: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when daily_limit is negative" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} =
               Periods.create_period(
                 group.id,
                 valid_period_attrs(%{daily_limit: Decimal.new("-10")})
               )

      assert %{daily_limit: [_ | _]} = errors_on(changeset)
    end

    test "allows another group to create period even when first group has active period" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      {:ok, _period} = Periods.create_period(g1.id, valid_period_attrs())

      assert {:ok, %Period{}} = Periods.create_period(g2.id, valid_period_attrs())
    end
  end

  describe "get_active_period/1" do
    test "returns the active period for the group" do
      {_user, group} = user_with_group_fixture()
      {:ok, period} = Periods.create_period(group.id, valid_period_attrs())

      assert {:ok, found} = Periods.get_active_period(group.id)
      assert found.id == period.id
      assert found.status == "active"
    end

    test "preloads budget_days in the result" do
      {_user, group} = user_with_group_fixture()

      # Use future dates so exactly one BudgetDay is created
      today = Date.utc_today()
      attrs =
        valid_period_attrs(%{
          start_date: Date.add(today, 1),
          end_date: Date.add(today, 30),
          total_budget: Decimal.new("3100.00")
        })

      {:ok, _period} = Periods.create_period(group.id, attrs)

      {:ok, found} = Periods.get_active_period(group.id)
      assert is_list(found.budget_days)
      assert length(found.budget_days) == 1
    end

    test "returns {:ok, nil} when group has no active period" do
      {_user, group} = user_with_group_fixture()

      assert {:ok, nil} = Periods.get_active_period(group.id)
    end

    test "does not return active period belonging to another group" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      {:ok, _period} = Periods.create_period(g1.id, valid_period_attrs())

      assert {:ok, nil} = Periods.get_active_period(g2.id)
    end
  end

  describe "get_period/2" do
    test "returns the period when it belongs to the group" do
      {_user, group} = user_with_group_fixture()
      {:ok, period} = Periods.create_period(group.id, valid_period_attrs())

      assert {:ok, found} = Periods.get_period(group.id, period.id)
      assert found.id == period.id
    end

    test "returns {:error, :not_found} when period belongs to another group" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      {:ok, period} = Periods.create_period(g1.id, valid_period_attrs())

      assert {:error, :not_found} = Periods.get_period(g2.id, period.id)
    end

    test "returns {:error, :not_found} for non-existent period" do
      {_user, group} = user_with_group_fixture()
      fake_id = Ecto.UUID.generate()

      assert {:error, :not_found} = Periods.get_period(group.id, fake_id)
    end
  end

  describe "close_period/1" do
    test "changes period status to closed" do
      {_user, group} = user_with_group_fixture()
      {:ok, period} = Periods.create_period(group.id, valid_period_attrs())

      assert {:ok, closed} = Periods.close_period(period)
      assert closed.status == "closed"
    end
  end

  describe "abandon_period/1" do
    test "changes period status to abandoned" do
      {_user, group} = user_with_group_fixture()
      {:ok, period} = Periods.create_period(group.id, valid_period_attrs())

      assert {:ok, abandoned} = Periods.abandon_period(period)
      assert abandoned.status == "abandoned"
    end
  end

  describe "get_period_summary/1" do
    test "calculates total_budgeted, total_spent, difference and days_count correctly" do
      {_user, group} = user_with_group_fixture()

      # 5-day period at 50/day = 250 total budgeted
      attrs = %{
        start_date: ~D[2026-04-01],
        end_date: ~D[2026-04-05],
        daily_limit: Decimal.new("50.00"),
        total_budget: Decimal.new("250.00")
      }

      {:ok, period} = Periods.create_period(group.id, attrs)

      # No expenses, so total_spent = 0
      summary = Periods.get_period_summary(period)

      assert summary.days_count == 5
      assert Decimal.equal?(summary.total_budgeted, Decimal.new("250.00"))
      assert Decimal.equal?(summary.total_spent, Decimal.new("0"))
      assert Decimal.equal?(summary.difference, Decimal.new("250.00"))
    end
  end

  describe "list_periods/1" do
    test "returns all periods for the group ordered by start_date descending" do
      {_user, group} = user_with_group_fixture()

      {:ok, period1} =
        Periods.create_period(group.id, %{
          start_date: ~D[2026-01-01],
          end_date: ~D[2026-01-31],
          daily_limit: Decimal.new("100.00"),
          total_budget: Decimal.new("3100.00")
        })

      # Close the first so we can create a second
      {:ok, _} = Periods.close_period(period1)

      {:ok, period2} =
        Periods.create_period(group.id, %{
          start_date: ~D[2026-02-01],
          end_date: ~D[2026-02-28],
          daily_limit: Decimal.new("80.00"),
          total_budget: Decimal.new("2240.00")
        })

      periods = Periods.list_periods(group.id)

      assert length(periods) == 2
      [first, second] = periods
      assert first.id == period2.id
      assert second.id == period1.id
    end

    test "does not return periods from other groups" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      {:ok, _period} = Periods.create_period(g1.id, valid_period_attrs())

      assert [] == Periods.list_periods(g2.id)
    end
  end
end
