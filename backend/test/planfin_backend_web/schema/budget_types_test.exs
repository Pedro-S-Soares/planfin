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
        daily_limit: Decimal.new("100.00")
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

    test "fails if group already has an active period", %{conn: conn} do
      {conn, _user, group} = authed_conn_with_group(conn)
      today = Date.utc_today()

      {:ok, _period} = Periods.create_period(group.id, valid_period_attrs())

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
      assert hd(resp["errors"])["message"] =~ "already has an active period"
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
