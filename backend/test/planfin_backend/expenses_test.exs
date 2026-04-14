defmodule PlanfinBackend.ExpensesTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.Expenses
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Periods
  alias PlanfinBackend.Periods.BudgetDay
  alias PlanfinBackend.Categories

  import PlanfinBackend.AccountsFixtures

  # Period covering a broad range so tests can use various dates
  @period_attrs %{
    start_date: ~D[2026-04-01],
    end_date: ~D[2026-04-30],
    daily_limit: Decimal.new("100.00")
  }

  defp setup_user_with_period do
    user = user_fixture()
    {:ok, period} = Periods.create_period(user.id, @period_attrs)
    {user, period}
  end

  defp setup_user_with_period_and_subcategory do
    {user, period} = setup_user_with_period()

    {:ok, category} = Categories.create_category(user.id, %{name: "Food"})
    {:ok, subcategory} = Categories.create_subcategory(category, %{name: "Restaurant"})

    {user, period, subcategory}
  end

  defp valid_expense_attrs(overrides \\ %{}) do
    Map.merge(
      %{amount: Decimal.new("25.00"), date: ~D[2026-04-05]},
      overrides
    )
  end

  describe "create_expense/2" do
    test "creates expense with active period and valid date" do
      {user, _period} = setup_user_with_period()

      assert {:ok, %Expense{} = expense} =
               Expenses.create_expense(user.id, valid_expense_attrs())

      assert expense.user_id == user.id
      assert Decimal.equal?(expense.amount, Decimal.new("25.00"))
      assert expense.date == ~D[2026-04-05]
    end

    test "returns {:error, :no_active_period} when user has no active period" do
      user = user_fixture()

      assert {:error, :no_active_period} =
               Expenses.create_expense(user.id, valid_expense_attrs())
    end

    test "returns {:error, :date_out_of_range} when date is before period start" do
      {user, _period} = setup_user_with_period()

      assert {:error, :date_out_of_range} =
               Expenses.create_expense(user.id, valid_expense_attrs(%{date: ~D[2026-03-31]}))
    end

    test "returns {:error, :date_out_of_range} when date is after period end" do
      {user, _period} = setup_user_with_period()

      assert {:error, :date_out_of_range} =
               Expenses.create_expense(user.id, valid_expense_attrs(%{date: ~D[2026-05-01]}))
    end

    test "returns changeset error when amount is zero" do
      {user, _period} = setup_user_with_period()

      assert {:error, changeset} =
               Expenses.create_expense(user.id, valid_expense_attrs(%{amount: Decimal.new("0")}))

      assert %{amount: [_ | _]} = errors_on(changeset)
    end

    test "returns changeset error when amount is negative" do
      {user, _period} = setup_user_with_period()

      assert {:error, changeset} =
               Expenses.create_expense(
                 user.id,
                 valid_expense_attrs(%{amount: Decimal.new("-5.00")})
               )

      assert %{amount: [_ | _]} = errors_on(changeset)
    end

    test "creates budget_day if it does not exist for the given date (past day in period)" do
      {user, period} = setup_user_with_period()

      # Date different from start_date (which already has a budget_day)
      past_date = ~D[2026-04-10]

      refute Repo.get_by(BudgetDay, period_id: period.id, date: past_date)

      assert {:ok, %Expense{}} =
               Expenses.create_expense(user.id, valid_expense_attrs(%{date: past_date}))

      assert %BudgetDay{} = Repo.get_by(BudgetDay, period_id: period.id, date: past_date)
    end

    test "uses existing budget_day when it already exists for the date" do
      {user, period} = setup_user_with_period()

      # start_date already has a budget_day from create_period
      existing_bd = Repo.get_by!(BudgetDay, period_id: period.id, date: period.start_date)

      assert {:ok, %Expense{} = expense} =
               Expenses.create_expense(
                 user.id,
                 valid_expense_attrs(%{date: period.start_date})
               )

      assert expense.budget_day_id == existing_bd.id
    end

    test "associates subcategory when subcategory_id is provided" do
      {user, _period, subcategory} = setup_user_with_period_and_subcategory()

      assert {:ok, %Expense{} = expense} =
               Expenses.create_expense(
                 user.id,
                 valid_expense_attrs(%{subcategory_id: subcategory.id})
               )

      assert expense.subcategory_id == subcategory.id
      assert expense.subcategory != nil
      assert expense.subcategory.id == subcategory.id
    end

    test "creates expense without subcategory when subcategory_id is omitted" do
      {user, _period} = setup_user_with_period()

      assert {:ok, %Expense{} = expense} =
               Expenses.create_expense(user.id, valid_expense_attrs())

      assert expense.subcategory_id == nil
    end

    test "creates expense with note when note is provided" do
      {user, _period} = setup_user_with_period()

      assert {:ok, %Expense{} = expense} =
               Expenses.create_expense(
                 user.id,
                 valid_expense_attrs(%{note: "lunch at the office"})
               )

      assert expense.note == "lunch at the office"
    end
  end

  describe "delete_expense/2" do
    test "deletes the expense and returns {:ok, expense}" do
      {user, _period} = setup_user_with_period()
      {:ok, expense} = Expenses.create_expense(user.id, valid_expense_attrs())

      assert {:ok, %Expense{}} = Expenses.delete_expense(user.id, expense.id)
      refute Repo.get(Expense, expense.id)
    end

    test "returns {:error, :not_found} when expense belongs to another user" do
      {user1, _period1} = setup_user_with_period()

      user2 = user_fixture()

      {:ok, expense} = Expenses.create_expense(user1.id, valid_expense_attrs())

      assert {:error, :not_found} = Expenses.delete_expense(user2.id, expense.id)
      assert Repo.get(Expense, expense.id)
    end

    test "returns {:error, :not_found} for non-existent expense" do
      user = user_fixture()
      fake_id = Ecto.UUID.generate()

      assert {:error, :not_found} = Expenses.delete_expense(user.id, fake_id)
    end
  end

  describe "list_expenses_by_day/2" do
    test "returns expenses for the given budget_day ordered by inserted_at desc" do
      {user, period} = setup_user_with_period()

      {:ok, e1} = Expenses.create_expense(user.id, valid_expense_attrs(%{date: ~D[2026-04-05]}))
      {:ok, e2} = Expenses.create_expense(user.id, valid_expense_attrs(%{date: ~D[2026-04-05]}))

      budget_day = Repo.get_by!(BudgetDay, period_id: period.id, date: ~D[2026-04-05])

      expenses = Expenses.list_expenses_by_day(user.id, budget_day.id)

      ids = Enum.map(expenses, & &1.id)
      assert e1.id in ids
      assert e2.id in ids
    end

    test "does not return expenses from a different budget_day" do
      {user, _period} = setup_user_with_period()

      # Create expense on day 5
      {:ok, e1} = Expenses.create_expense(user.id, valid_expense_attrs(%{date: ~D[2026-04-05]}))
      # Create expense on day 10
      {:ok, _e2} = Expenses.create_expense(user.id, valid_expense_attrs(%{date: ~D[2026-04-10]}))

      budget_day = Repo.get_by!(BudgetDay, date: ~D[2026-04-05])
      expenses = Expenses.list_expenses_by_day(user.id, budget_day.id)

      assert length(expenses) == 1
      assert hd(expenses).id == e1.id
    end

    test "preloads subcategory with category" do
      {user, _period, subcategory} = setup_user_with_period_and_subcategory()

      {:ok, _e} =
        Expenses.create_expense(
          user.id,
          valid_expense_attrs(%{subcategory_id: subcategory.id})
        )

      budget_day = Repo.get_by!(BudgetDay, date: ~D[2026-04-05])
      [expense] = Expenses.list_expenses_by_day(user.id, budget_day.id)

      assert expense.subcategory != nil
      assert expense.subcategory.category != nil
    end
  end

  describe "list_expenses_by_period/2" do
    test "returns expenses grouped by date with total, ordered by date desc" do
      {user, period} = setup_user_with_period()

      {:ok, _} =
        Expenses.create_expense(
          user.id,
          valid_expense_attrs(%{date: ~D[2026-04-05], amount: Decimal.new("10.00")})
        )

      {:ok, _} =
        Expenses.create_expense(
          user.id,
          valid_expense_attrs(%{date: ~D[2026-04-05], amount: Decimal.new("15.00")})
        )

      {:ok, _} =
        Expenses.create_expense(
          user.id,
          valid_expense_attrs(%{date: ~D[2026-04-10], amount: Decimal.new("20.00")})
        )

      grouped = Expenses.list_expenses_by_period(user.id, period.id)

      assert length(grouped) == 2

      [first, second] = grouped
      # ordered by date desc: Apr 10 first
      assert first.date == ~D[2026-04-10]
      assert Decimal.equal?(first.total, Decimal.new("20.00"))
      assert length(first.expenses) == 1

      assert second.date == ~D[2026-04-05]
      assert Decimal.equal?(second.total, Decimal.new("25.00"))
      assert length(second.expenses) == 2
    end

    test "does not return expenses from another user's period" do
      {user1, period1} = setup_user_with_period()

      user2 = user_fixture()
      {:ok, _period2} = Periods.create_period(user2.id, @period_attrs)

      {:ok, _} = Expenses.create_expense(user1.id, valid_expense_attrs())

      grouped = Expenses.list_expenses_by_period(user2.id, period1.id)
      assert grouped == []
    end

    test "returns empty list when there are no expenses" do
      {user, period} = setup_user_with_period()

      grouped = Expenses.list_expenses_by_period(user.id, period.id)
      assert grouped == []
    end
  end

  describe "get_expense!/2" do
    test "returns the expense when it belongs to the user" do
      {user, _period} = setup_user_with_period()
      {:ok, expense} = Expenses.create_expense(user.id, valid_expense_attrs())

      found = Expenses.get_expense!(user.id, expense.id)
      assert found.id == expense.id
    end

    test "raises when expense belongs to another user" do
      {user1, _period1} = setup_user_with_period()

      user2 = user_fixture()
      {:ok, expense} = Expenses.create_expense(user1.id, valid_expense_attrs())

      assert_raise Ecto.NoResultsError, fn ->
        Expenses.get_expense!(user2.id, expense.id)
      end
    end
  end
end
