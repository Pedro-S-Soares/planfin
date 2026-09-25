defmodule PlanfinBackend.BudgetDaysExtraTest do
  @moduledoc """
  Tests for compute_extra/1.

  The extra budget is the part of total_budget beyond daily_limit × period days.
  Extra expenses consume it; extra income gives it back. Regular entries never
  touch it.
  """

  use PlanfinBackend.DataCase

  alias PlanfinBackend.BudgetDays
  alias PlanfinBackend.Periods
  alias PlanfinBackend.Expenses.Expense

  import PlanfinBackend.AccountsFixtures

  # June 2026 (30 days): daily_limit × days = 3_000, total_budget = 3_500 → extra = 500
  @period_attrs %{
    start_date: ~D[2026-06-01],
    end_date: ~D[2026-06-30],
    daily_limit: Decimal.new("100.00"),
    total_budget: Decimal.new("3500.00")
  }

  defp setup_period(attrs \\ %{}) do
    {user, group} = user_with_group_fixture()
    {:ok, period} = Periods.create_period(group.id, Map.merge(@period_attrs, attrs))
    {user, group, period}
  end

  defp insert_entry(group, user, period, attrs) do
    defaults = %{
      date: ~D[2026-06-10],
      group_id: group.id,
      created_by_id: user.id,
      period_id: period.id
    }

    %Expense{}
    |> Expense.changeset(Map.merge(defaults, attrs))
    |> Repo.insert!()
  end

  defp assert_extra(extra, budget, spent, remaining) do
    assert Decimal.equal?(extra.budget, Decimal.new(budget))
    assert Decimal.equal?(extra.spent, Decimal.new(spent))
    assert Decimal.equal?(extra.remaining, Decimal.new(remaining))
  end

  describe "compute_extra/1" do
    test "extra budget = total_budget - daily_limit × days, nothing spent" do
      {_user, _group, period} = setup_period()

      assert_extra(BudgetDays.compute_extra(period), "500", "0", "500")
    end

    test "period without extra has zero extra budget" do
      {_user, _group, period} = setup_period(%{total_budget: Decimal.new("3000.00")})

      assert_extra(BudgetDays.compute_extra(period), "0", "0", "0")
    end

    test "extra expenses consume the extra budget" do
      {user, group, period} = setup_period()

      insert_entry(group, user, period, %{
        amount: Decimal.new("120.00"),
        type: "expense",
        is_extra: true
      })

      insert_entry(group, user, period, %{
        amount: Decimal.new("30.00"),
        type: "expense",
        is_extra: true
      })

      assert_extra(BudgetDays.compute_extra(period), "500", "150", "350")
    end

    test "extra income gives back to the extra budget" do
      {user, group, period} = setup_period()

      insert_entry(group, user, period, %{
        amount: Decimal.new("200.00"),
        type: "expense",
        is_extra: true
      })

      insert_entry(group, user, period, %{
        amount: Decimal.new("50.00"),
        type: "income",
        is_extra: true
      })

      assert_extra(BudgetDays.compute_extra(period), "500", "150", "350")
    end

    test "regular entries do not touch the extra budget" do
      {user, group, period} = setup_period()

      insert_entry(group, user, period, %{
        amount: Decimal.new("80.00"),
        type: "expense",
        is_extra: false
      })

      insert_entry(group, user, period, %{
        amount: Decimal.new("40.00"),
        type: "income",
        is_extra: false
      })

      assert_extra(BudgetDays.compute_extra(period), "500", "0", "500")
    end

    test "extra entries outside the period range are ignored" do
      {user, group, period} = setup_period()

      insert_entry(group, user, period, %{
        amount: Decimal.new("90.00"),
        type: "expense",
        is_extra: true,
        date: ~D[2026-07-01]
      })

      assert_extra(BudgetDays.compute_extra(period), "500", "0", "500")
    end
  end
end
