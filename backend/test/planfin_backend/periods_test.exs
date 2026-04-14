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
        daily_limit: Decimal.new("100.00")
      },
      overrides
    )
  end

  describe "create_period/2" do
    test "creates period with valid attrs and also creates budget_day for start_date" do
      user = user_fixture()

      assert {:ok, %Period{} = period} = Periods.create_period(user.id, valid_period_attrs())

      assert period.user_id == user.id
      assert period.status == "active"
      assert period.start_date == ~D[2026-04-01]
      assert period.end_date == ~D[2026-04-30]
      assert Decimal.equal?(period.daily_limit, Decimal.new("100.00"))

      # Should also create a budget_day for the first day
      budget_days = Repo.all(BudgetDay)
      assert length(budget_days) == 1
      [day] = budget_days
      assert day.period_id == period.id
      assert day.date == period.start_date
      assert Decimal.equal?(day.carryover, Decimal.new("0.00"))
      assert Decimal.equal?(day.daily_limit, period.daily_limit)
    end

    test "returns error when user already has an active period" do
      user = user_fixture()

      {:ok, _period} = Periods.create_period(user.id, valid_period_attrs())

      assert {:error, :already_has_active_period} =
               Periods.create_period(
                 user.id,
                 valid_period_attrs(%{start_date: ~D[2026-05-01], end_date: ~D[2026-05-31]})
               )
    end

    test "returns changeset error when end_date <= start_date" do
      user = user_fixture()

      assert {:error, changeset} =
               Periods.create_period(user.id, valid_period_attrs(%{end_date: ~D[2026-04-01]}))

      assert %{end_date: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when end_date is before start_date" do
      user = user_fixture()

      assert {:error, changeset} =
               Periods.create_period(user.id, valid_period_attrs(%{end_date: ~D[2026-03-01]}))

      assert %{end_date: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when daily_limit is zero" do
      user = user_fixture()

      assert {:error, changeset} =
               Periods.create_period(
                 user.id,
                 valid_period_attrs(%{daily_limit: Decimal.new("0")})
               )

      assert %{daily_limit: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when daily_limit is negative" do
      user = user_fixture()

      assert {:error, changeset} =
               Periods.create_period(
                 user.id,
                 valid_period_attrs(%{daily_limit: Decimal.new("-10")})
               )

      assert %{daily_limit: [_ | _]} = errors_on(changeset)
    end

    test "allows second user to create period even when first user has active period" do
      user1 = user_fixture()
      user2 = user_fixture()

      {:ok, _period} = Periods.create_period(user1.id, valid_period_attrs())

      assert {:ok, %Period{}} = Periods.create_period(user2.id, valid_period_attrs())
    end
  end

  describe "get_active_period/1" do
    test "returns the active period for the user" do
      user = user_fixture()
      {:ok, period} = Periods.create_period(user.id, valid_period_attrs())

      assert {:ok, found} = Periods.get_active_period(user.id)
      assert found.id == period.id
      assert found.status == "active"
    end

    test "preloads budget_days in the result" do
      user = user_fixture()
      {:ok, _period} = Periods.create_period(user.id, valid_period_attrs())

      {:ok, found} = Periods.get_active_period(user.id)
      assert is_list(found.budget_days)
      assert length(found.budget_days) == 1
    end

    test "returns {:ok, nil} when user has no active period" do
      user = user_fixture()

      assert {:ok, nil} = Periods.get_active_period(user.id)
    end

    test "does not return active period belonging to another user" do
      user1 = user_fixture()
      user2 = user_fixture()

      {:ok, _period} = Periods.create_period(user1.id, valid_period_attrs())

      assert {:ok, nil} = Periods.get_active_period(user2.id)
    end
  end

  describe "get_period/2" do
    test "returns the period when it belongs to the user" do
      user = user_fixture()
      {:ok, period} = Periods.create_period(user.id, valid_period_attrs())

      assert {:ok, found} = Periods.get_period(user.id, period.id)
      assert found.id == period.id
    end

    test "returns {:error, :not_found} when period belongs to another user" do
      user1 = user_fixture()
      user2 = user_fixture()

      {:ok, period} = Periods.create_period(user1.id, valid_period_attrs())

      assert {:error, :not_found} = Periods.get_period(user2.id, period.id)
    end

    test "returns {:error, :not_found} for non-existent period" do
      user = user_fixture()
      fake_id = Ecto.UUID.generate()

      assert {:error, :not_found} = Periods.get_period(user.id, fake_id)
    end
  end

  describe "close_period/1" do
    test "changes period status to closed" do
      user = user_fixture()
      {:ok, period} = Periods.create_period(user.id, valid_period_attrs())

      assert {:ok, closed} = Periods.close_period(period)
      assert closed.status == "closed"
    end
  end

  describe "abandon_period/1" do
    test "changes period status to abandoned" do
      user = user_fixture()
      {:ok, period} = Periods.create_period(user.id, valid_period_attrs())

      assert {:ok, abandoned} = Periods.abandon_period(period)
      assert abandoned.status == "abandoned"
    end
  end

  describe "get_period_summary/1" do
    test "calculates total_budgeted, total_spent, difference and days_count correctly" do
      user = user_fixture()

      # 5-day period at 50/day = 250 total budgeted
      attrs = %{
        start_date: ~D[2026-04-01],
        end_date: ~D[2026-04-05],
        daily_limit: Decimal.new("50.00")
      }

      {:ok, period} = Periods.create_period(user.id, attrs)

      # No expenses, so total_spent = 0
      summary = Periods.get_period_summary(period)

      assert summary.days_count == 5
      assert Decimal.equal?(summary.total_budgeted, Decimal.new("250.00"))
      assert Decimal.equal?(summary.total_spent, Decimal.new("0"))
      assert Decimal.equal?(summary.difference, Decimal.new("250.00"))
    end
  end

  describe "list_periods/1" do
    test "returns all periods for the user ordered by start_date descending" do
      user = user_fixture()

      {:ok, period1} =
        Periods.create_period(user.id, %{
          start_date: ~D[2026-01-01],
          end_date: ~D[2026-01-31],
          daily_limit: Decimal.new("100.00")
        })

      # Close the first so we can create a second
      {:ok, _} = Periods.close_period(period1)

      {:ok, period2} =
        Periods.create_period(user.id, %{
          start_date: ~D[2026-02-01],
          end_date: ~D[2026-02-28],
          daily_limit: Decimal.new("80.00")
        })

      periods = Periods.list_periods(user.id)

      assert length(periods) == 2
      [first, second] = periods
      assert first.id == period2.id
      assert second.id == period1.id
    end

    test "does not return periods from other users" do
      user1 = user_fixture()
      user2 = user_fixture()

      {:ok, _period} = Periods.create_period(user1.id, valid_period_attrs())

      assert [] == Periods.list_periods(user2.id)
    end
  end
end
