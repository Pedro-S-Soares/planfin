defmodule PlanfinBackendWeb.Schema.BudgetTypesTest do
  use PlanfinBackendWeb.ConnCase, async: true

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Accounts, Categories, Periods, Expenses}

  # Helper to build an authenticated conn with a Bearer token
  defp authed_conn(conn, user) do
    token = Accounts.generate_user_api_token(user)
    put_req_header(conn, "authorization", "Bearer #{token}")
  end

  # Returns {conn, user, group} with a group already active for the user.
  defp authed_conn_with_group(conn) do
    {user, group} = user_with_group_fixture()
    # Reload user so active_group_id reflects the setup
    user = PlanfinBackend.Repo.get!(PlanfinBackend.Accounts.User, user.id)
    {authed_conn(conn, user), user, group}
  end

  defp post_graphql(conn, query, variables \\ %{}) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/graphql", Jason.encode!(%{query: query, variables: variables}))
    |> json_response(200)
  end

  defp valid_period_attrs(overrides \\ %{}) do
    today = Date.utc_today()

    Map.merge(
      %{
        start_date: today,
        end_date: Date.add(today, 29),
        daily_limit: Decimal.new("100.00"),
        total_budget: Decimal.new("3000.00")
      },
      overrides
    )
  end

  # ---- activePeriod ----

  describe "activePeriod" do
    test "returns nil when group has no active period", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      query = """
        query {
          activePeriod {
            id
            status
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["data"]["activePeriod"] == nil
      assert resp["errors"] == nil
    end

    test "returns period with today.availableBalance when period is active", %{conn: conn} do
      {conn, _user, group} = authed_conn_with_group(conn)

      {:ok, _period} = Periods.create_period(group.id, valid_period_attrs())

      query = """
        query {
          activePeriod {
            id
            status
            dailyLimit
            today {
              id
              availableBalance
              dailyLimit
              carryover
            }
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] == nil
      period_data = resp["data"]["activePeriod"]
      assert period_data["status"] == "active"
      assert period_data["today"] != nil
      assert period_data["today"]["availableBalance"] != nil
    end

    test "today.spent ignores expenses logged retroactively on already closed days", %{
      conn: conn
    } do
      {conn, _user, group} = authed_conn_with_group(conn)

      {:ok, _period} =
        Periods.create_period(group.id, %{
          start_date: ~D[2026-06-01],
          end_date: ~D[2026-06-30],
          daily_limit: Decimal.new("100.00"),
          total_budget: Decimal.new("3000.00")
        })

      active_query = """
        query($today: String!) {
          activePeriod(today: $today) {
            today { spent availableBalance }
          }
        }
      """

      create_mutation = """
        mutation($amount: String!, $date: String!, $isExtra: Boolean) {
          createExpense(amount: $amount, date: $date, isExtra: $isExtra) { id }
        }
      """

      # Opening the app on 06-03 closes 06-01 and 06-02
      post_graphql(conn, active_query, %{today: "2026-06-03"})

      # A forgotten expense from yesterday, then today's regular and extra expenses
      post_graphql(conn, create_mutation, %{amount: "80.00", date: "2026-06-02"})
      post_graphql(conn, create_mutation, %{amount: "10.00", date: "2026-06-03"})
      post_graphql(conn, create_mutation, %{amount: "50.00", date: "2026-06-03", isExtra: true})

      resp = post_graphql(conn, active_query, %{today: "2026-06-03"})
      assert resp["errors"] == nil
      today = resp["data"]["activePeriod"]["today"]

      assert Decimal.equal?(Decimal.new(today["spent"]), Decimal.new("10"))
      assert Decimal.equal?(Decimal.new(today["availableBalance"]), Decimal.new("210"))
    end

    test "exposes extra budget fields", %{conn: conn} do
      {conn, user, group} = authed_conn_with_group(conn)

      {:ok, _period} =
        Periods.create_period(
          group.id,
          valid_period_attrs(%{total_budget: Decimal.new("3500.00")})
        )

      {:ok, _} =
        Expenses.create_expense(group.id, user.id, %{
          amount: Decimal.new("120.00"),
          date: Date.utc_today(),
          is_extra: true,
          type: "expense"
        })

      query = """
        query {
          activePeriod {
            extraBudget
            extraSpent
            extraRemaining
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] == nil
      period_data = resp["data"]["activePeriod"]
      assert Decimal.equal?(Decimal.new(period_data["extraBudget"]), Decimal.new("500"))
      assert Decimal.equal?(Decimal.new(period_data["extraSpent"]), Decimal.new("120"))
      assert Decimal.equal?(Decimal.new(period_data["extraRemaining"]), Decimal.new("380"))
    end

    test "returns 'Not authenticated' error when not authenticated", %{conn: conn} do
      query = """
        query {
          activePeriod {
            id
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end

    test "returns 'No active group' error when authenticated but no active group", %{conn: conn} do
      user = user_fixture()
      conn = authed_conn(conn, user)

      query = """
        query {
          activePeriod {
            id
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "No active group"
    end
  end

  # ---- createPeriod ----

  describe "createPeriod" do
    test "creates a period and returns it", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)
      today = Date.utc_today()

      query = """
        mutation CreatePeriod($startDate: String!, $endDate: String!, $dailyLimit: String!) {
          createPeriod(startDate: $startDate, endDate: $endDate, dailyLimit: $dailyLimit) {
            id
            status
            dailyLimit
            startDate
            endDate
          }
        }
      """

      resp =
        post_graphql(conn, query, %{
          startDate: Date.to_iso8601(today),
          endDate: Date.to_iso8601(Date.add(today, 29)),
          dailyLimit: "100.00"
        })

      assert resp["errors"] == nil
      period = resp["data"]["createPeriod"]
      assert period["status"] == "active"
      assert period["dailyLimit"] == "100.00"
    end

    test "returns error when not authenticated", %{conn: conn} do
      today = Date.utc_today()

      query = """
        mutation CreatePeriod($startDate: String!, $endDate: String!, $dailyLimit: String!) {
          createPeriod(startDate: $startDate, endDate: $endDate, dailyLimit: $dailyLimit) {
            id
          }
        }
      """

      resp =
        post_graphql(conn, query, %{
          startDate: Date.to_iso8601(today),
          endDate: Date.to_iso8601(Date.add(today, 29)),
          dailyLimit: "100.00"
        })

      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  # ---- createExpense / deleteExpense ----

  describe "createExpense" do
    test "creates expense and reduces available balance", %{conn: conn} do
      {conn, _user, group} = authed_conn_with_group(conn)
      today = Date.utc_today()

      {:ok, _period} = Periods.create_period(group.id, valid_period_attrs())

      create_query = """
        mutation CreateExpense($amount: String!, $date: String!) {
          createExpense(amount: $amount, date: $date) {
            id
            amount
            date
          }
        }
      """

      resp =
        post_graphql(conn, create_query, %{
          amount: "25.00",
          date: Date.to_iso8601(today)
        })

      assert resp["errors"] == nil
      expense = resp["data"]["createExpense"]
      assert expense["amount"] == "25.00"

      active_query = """
        query {
          activePeriod {
            today {
              availableBalance
            }
          }
        }
      """

      active_resp = post_graphql(conn, active_query)
      assert active_resp["errors"] == nil
      balance = active_resp["data"]["activePeriod"]["today"]["availableBalance"]
      assert Decimal.equal?(Decimal.new(balance), Decimal.new("75.00"))
    end

    test "returns error when not authenticated", %{conn: conn} do
      today = Date.utc_today()

      query = """
        mutation CreateExpense($amount: String!, $date: String!) {
          createExpense(amount: $amount, date: $date) {
            id
          }
        }
      """

      resp = post_graphql(conn, query, %{amount: "10.00", date: Date.to_iso8601(today)})
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  describe "deleteExpense" do
    test "removes an expense", %{conn: conn} do
      {conn, user, group} = authed_conn_with_group(conn)
      today = Date.utc_today()

      {:ok, _period} = Periods.create_period(group.id, valid_period_attrs())

      {:ok, expense} =
        Expenses.create_expense(group.id, user.id, %{
          amount: Decimal.new("30.00"),
          date: today
        })

      delete_query = """
        mutation DeleteExpense($id: ID!) {
          deleteExpense(id: $id)
        }
      """

      resp = post_graphql(conn, delete_query, %{id: expense.id})
      assert resp["errors"] == nil
      assert resp["data"]["deleteExpense"] == true
    end

    test "returns error when not authenticated", %{conn: conn} do
      query = """
        mutation DeleteExpense($id: ID!) {
          deleteExpense(id: $id)
        }
      """

      resp = post_graphql(conn, query, %{id: "some-id"})
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  # ---- expenseHistory ----

  describe "expenseHistory" do
    test "returns expenses grouped by day", %{conn: conn} do
      {conn, user, group} = authed_conn_with_group(conn)
      today = Date.utc_today()

      {:ok, period} = Periods.create_period(group.id, valid_period_attrs())

      {:ok, _e1} =
        Expenses.create_expense(group.id, user.id, %{
          amount: Decimal.new("10.00"),
          date: today
        })

      {:ok, _e2} =
        Expenses.create_expense(group.id, user.id, %{
          amount: Decimal.new("20.00"),
          date: today
        })

      query = """
        query ExpenseHistory($periodId: ID!) {
          expenseHistory(periodId: $periodId) {
            date
            total
            expenses {
              id
              amount
            }
          }
        }
      """

      resp = post_graphql(conn, query, %{periodId: period.id})
      assert resp["errors"] == nil
      history = resp["data"]["expenseHistory"]
      assert length(history) == 1
      day = hd(history)
      assert day["date"] == Date.to_iso8601(today)
      assert Decimal.equal?(Decimal.new(day["total"]), Decimal.new("30.00"))
      assert length(day["expenses"]) == 2
    end

    test "returns subcategory.category with icon for each expense", %{conn: conn} do
      {conn, user, group} = authed_conn_with_group(conn)
      today = Date.utc_today()

      {:ok, period} = Periods.create_period(group.id, valid_period_attrs())

      {:ok, category} =
        Categories.create_category(group.id, %{name: "Pets", icon: "paw"})

      {:ok, sub} = Categories.create_subcategory(category, %{name: "Ração"})

      {:ok, _expense} =
        Expenses.create_expense(group.id, user.id, %{
          amount: Decimal.new("15.00"),
          date: today,
          subcategory_id: sub.id
        })

      query = """
        query ExpenseHistory($periodId: ID!) {
          expenseHistory(periodId: $periodId) {
            expenses {
              subcategory {
                id
                category {
                  id
                  name
                  icon
                }
              }
            }
          }
        }
      """

      resp = post_graphql(conn, query, %{periodId: period.id})
      assert resp["errors"] == nil

      [%{"expenses" => [%{"subcategory" => subcategory}]}] =
        resp["data"]["expenseHistory"]

      assert subcategory["id"] == sub.id

      assert subcategory["category"] == %{
               "id" => category.id,
               "name" => "Pets",
               "icon" => "paw"
             }
    end

    test "returns error when not authenticated", %{conn: conn} do
      query = """
        query ExpenseHistory($periodId: ID!) {
          expenseHistory(periodId: $periodId) {
            date
          }
        }
      """

      resp = post_graphql(conn, query, %{periodId: "some-id"})
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  # ---- expensesInRange ----

  describe "expensesInRange" do
    @range_query """
      query ExpensesInRange($from: String!, $to: String!) {
        expensesInRange(from: $from, to: $to) {
          id
          amount
          date
          type
          isExtra
          createdBy { id name }
          subcategory { id name categoryId }
        }
      }
    """

    test "returns the group's expenses in the range with author", %{conn: conn} do
      {conn, user, group} = authed_conn_with_group(conn)
      user |> Ecto.Changeset.change(name: "Pedro") |> PlanfinBackend.Repo.update!()
      today = Date.utc_today()
      {:ok, _period} = Periods.create_period(group.id, valid_period_attrs())

      {:ok, _} =
        Expenses.create_expense(group.id, user.id, %{amount: Decimal.new("12.50"), date: today})

      resp =
        post_graphql(conn, @range_query, %{
          from: Date.to_iso8601(Date.add(today, -10)),
          to: Date.to_iso8601(today)
        })

      assert resp["errors"] == nil
      assert [expense] = resp["data"]["expensesInRange"]
      assert expense["type"] == "expense"
      assert expense["createdBy"]["id"] == to_string(user.id)
      assert expense["createdBy"]["name"] == "Pedro"
      assert Decimal.equal?(Decimal.new(expense["amount"]), Decimal.new("12.50"))
    end

    test "returns an error for an invalid range", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      resp = post_graphql(conn, @range_query, %{from: "2026-05-01", to: "2026-04-01"})
      assert hd(resp["errors"])["message"] == "Invalid date range"

      resp = post_graphql(conn, @range_query, %{from: "nope", to: "2026-04-01"})
      assert hd(resp["errors"])["message"] == "Invalid date"
    end

    test "returns error when not authenticated", %{conn: conn} do
      resp = post_graphql(conn, @range_query, %{from: "2026-04-01", to: "2026-04-30"})
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  # ---- categories ----

  describe "categories" do
    test "returns categories for the group (seeded defaults)", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      query = """
        query {
          categories {
            id
            name
            subcategories {
              id
              name
            }
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] == nil
      categories = resp["data"]["categories"]
      assert length(categories) > 0
      cat = hd(categories)
      assert cat["name"] != nil
    end

    test "returns the icon of each category", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      query = """
        query {
          categories {
            name
            icon
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] == nil

      icons = Map.new(resp["data"]["categories"], &{&1["name"], &1["icon"]})
      assert icons["Alimentação"] == "food"
      assert icons["Outros"] == "dots-horizontal"
    end

    test "returns error when not authenticated", %{conn: conn} do
      query = """
        query {
          categories {
            id
          }
        }
      """

      resp = post_graphql(conn, query)
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  # ---- createCategory / deleteCategory ----

  describe "createCategory" do
    test "creates a category", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      query = """
        mutation CreateCategory($name: String!) {
          createCategory(name: $name) {
            id
            name
            subcategories {
              id
            }
          }
        }
      """

      resp = post_graphql(conn, query, %{name: "Moradia"})
      assert resp["errors"] == nil
      category = resp["data"]["createCategory"]
      assert category["name"] == "Moradia"
      assert category["subcategories"] == []
    end

    test "creates a category with an icon", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      query = """
        mutation CreateCategory($name: String!, $icon: String) {
          createCategory(name: $name, icon: $icon) {
            name
            icon
          }
        }
      """

      resp = post_graphql(conn, query, %{name: "Pets", icon: "paw"})
      assert resp["errors"] == nil
      assert resp["data"]["createCategory"] == %{"name" => "Pets", "icon" => "paw"}
    end

    test "rejects an icon with invalid format", %{conn: conn} do
      {conn, _user, _group} = authed_conn_with_group(conn)

      query = """
        mutation CreateCategory($name: String!, $icon: String) {
          createCategory(name: $name, icon: $icon) {
            id
          }
        }
      """

      resp = post_graphql(conn, query, %{name: "Pets", icon: "Not Valid"})
      assert [%{"message" => message}] = resp["errors"]
      assert message =~ "icon"
    end

    test "returns error when not authenticated", %{conn: conn} do
      query = """
        mutation CreateCategory($name: String!) {
          createCategory(name: $name) {
            id
          }
        }
      """

      resp = post_graphql(conn, query, %{name: "Test"})
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end

  describe "updateCategory" do
    @update_query """
      mutation UpdateCategory($id: ID!, $name: String!, $icon: String) {
        updateCategory(id: $id, name: $name, icon: $icon) {
          name
          icon
        }
      }
    """

    test "sets, keeps and clears the icon", %{conn: conn} do
      {conn, _user, group} = authed_conn_with_group(conn)
      {:ok, category} = Categories.create_category(group.id, %{name: "Pets"})

      resp = post_graphql(conn, @update_query, %{id: category.id, name: "Pets", icon: "paw"})
      assert resp["errors"] == nil
      assert resp["data"]["updateCategory"]["icon"] == "paw"

      # Omitting the icon arg keeps the current icon.
      resp = post_graphql(conn, @update_query, %{id: category.id, name: "Bichos"})
      assert resp["errors"] == nil
      assert resp["data"]["updateCategory"] == %{"name" => "Bichos", "icon" => "paw"}

      # Explicit null clears it.
      resp = post_graphql(conn, @update_query, %{id: category.id, name: "Bichos", icon: nil})
      assert resp["errors"] == nil
      assert resp["data"]["updateCategory"]["icon"] == nil
    end
  end

  describe "deleteCategory" do
    test "removes a category", %{conn: conn} do
      {conn, _user, group} = authed_conn_with_group(conn)

      {:ok, category} = Categories.create_category(group.id, %{name: "ToDelete"})

      query = """
        mutation DeleteCategory($id: ID!) {
          deleteCategory(id: $id)
        }
      """

      resp = post_graphql(conn, query, %{id: category.id})
      assert resp["errors"] == nil
      assert resp["data"]["deleteCategory"] == true
    end

    test "returns error when not authenticated", %{conn: conn} do
      query = """
        mutation DeleteCategory($id: ID!) {
          deleteCategory(id: $id)
        }
      """

      resp = post_graphql(conn, query, %{id: "some-id"})
      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Not authenticated"
    end
  end
end
