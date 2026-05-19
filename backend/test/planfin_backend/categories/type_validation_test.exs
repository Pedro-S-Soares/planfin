defmodule PlanfinBackend.Categories.TypeValidationTest do
  use PlanfinBackend.DataCase, async: true

  alias PlanfinBackend.Categories
  alias PlanfinBackend.Categories.{Category, Subcategory}
  alias PlanfinBackend.Expenses.Expense

  import PlanfinBackend.AccountsFixtures

  # ---------------------------------------------------------------------------
  # Category changeset type validation
  # ---------------------------------------------------------------------------

  describe "Category changeset type validation" do
    test "accepts 'expense' type" do
      {_user, group} = user_with_group_fixture()

      assert {:ok, %Category{type: "expense"}} =
               Categories.create_category(group.id, %{name: "Bills", type: "expense"})
    end

    test "accepts 'income' type" do
      {_user, group} = user_with_group_fixture()

      assert {:ok, %Category{type: "income"}} =
               Categories.create_category(group.id, %{name: "Salary", type: "income"})
    end

    test "rejects invalid type" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} =
               Categories.create_category(group.id, %{name: "Something", type: "invalid"})

      assert %{type: [_ | _]} = errors_on(changeset)
    end

    test "defaults to 'expense' when type is not provided" do
      {_user, group} = user_with_group_fixture()

      assert {:ok, %Category{type: "expense"}} =
               Categories.create_category(group.id, %{name: "Default Type"})
    end
  end

  # ---------------------------------------------------------------------------
  # Subcategory type must match parent category
  # ---------------------------------------------------------------------------

  describe "Subcategory type must match parent category" do
    test "accepts subcategory whose type matches the parent category (expense)" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Bills", type: "expense"})

      assert {:ok, %Subcategory{type: "expense"}} =
               Categories.create_subcategory(cat, %{name: "Electricity", type: "expense"})
    end

    test "accepts subcategory whose type matches the parent category (income)" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Salary", type: "income"})

      assert {:ok, %Subcategory{type: "income"}} =
               Categories.create_subcategory(cat, %{name: "Monthly", type: "income"})
    end

    test "rejects subcategory whose type differs from parent category" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Bills", type: "expense"})

      assert {:error, changeset} =
               Categories.create_subcategory(cat, %{name: "Rent", type: "income"})

      assert %{type: [_ | _]} = errors_on(changeset)
    end

    test "rejects subcategory with an invalid (non-allowed) type" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Bills", type: "expense"})

      assert {:error, changeset} =
               Categories.create_subcategory(cat, %{name: "Rent", type: "other"})

      assert %{type: [_ | _]} = errors_on(changeset)
    end

    test "subcategory defaults to 'expense' and is accepted when category is also 'expense'" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Food"})

      # No type key: both default to "expense", so it should pass validation.
      assert {:ok, %Subcategory{type: "expense"}} =
               Categories.create_subcategory(cat, %{name: "Restaurant"})
    end
  end

  # ---------------------------------------------------------------------------
  # Expense type must match subcategory type
  # ---------------------------------------------------------------------------

  describe "Expense changeset type must match subcategory type" do
    setup do
      {user, group} = user_with_group_fixture()

      {:ok, expense_cat} =
        Categories.create_category(group.id, %{name: "Bills", type: "expense"})

      {:ok, expense_sub} =
        Categories.create_subcategory(expense_cat, %{name: "Electricity", type: "expense"})

      {:ok, income_cat} =
        Categories.create_category(group.id, %{name: "Salary", type: "income"})

      {:ok, income_sub} =
        Categories.create_subcategory(income_cat, %{name: "Monthly", type: "income"})

      %{
        user: user,
        group: group,
        expense_sub: expense_sub,
        income_sub: income_sub
      }
    end

    test "accepts expense type when subcategory is also 'expense'", %{
      user: user,
      group: group,
      expense_sub: expense_sub
    } do
      changeset =
        Expense.changeset(%Expense{}, %{
          amount: Decimal.new("50.00"),
          date: ~D[2026-06-01],
          group_id: group.id,
          created_by_id: user.id,
          type: "expense",
          subcategory_id: expense_sub.id
        })

      assert changeset.valid?
    end

    test "accepts income type when subcategory is also 'income'", %{
      user: user,
      group: group,
      income_sub: income_sub
    } do
      changeset =
        Expense.changeset(%Expense{}, %{
          amount: Decimal.new("1500.00"),
          date: ~D[2026-06-01],
          group_id: group.id,
          created_by_id: user.id,
          type: "income",
          subcategory_id: income_sub.id
        })

      assert changeset.valid?
    end

    test "rejects expense type when subcategory is 'income'", %{
      user: user,
      group: group,
      income_sub: income_sub
    } do
      changeset =
        Expense.changeset(%Expense{}, %{
          amount: Decimal.new("50.00"),
          date: ~D[2026-06-01],
          group_id: group.id,
          created_by_id: user.id,
          type: "expense",
          subcategory_id: income_sub.id
        })

      refute changeset.valid?
      assert %{type: [_ | _]} = errors_on(changeset)
    end

    test "rejects income type when subcategory is 'expense'", %{
      user: user,
      group: group,
      expense_sub: expense_sub
    } do
      changeset =
        Expense.changeset(%Expense{}, %{
          amount: Decimal.new("50.00"),
          date: ~D[2026-06-01],
          group_id: group.id,
          created_by_id: user.id,
          type: "income",
          subcategory_id: expense_sub.id
        })

      refute changeset.valid?
      assert %{type: [_ | _]} = errors_on(changeset)
    end

    test "skips type-vs-subcategory check when no subcategory_id is set", %{
      user: user,
      group: group
    } do
      changeset =
        Expense.changeset(%Expense{}, %{
          amount: Decimal.new("50.00"),
          date: ~D[2026-06-01],
          group_id: group.id,
          created_by_id: user.id,
          type: "expense"
        })

      assert changeset.valid?
    end
  end
end
