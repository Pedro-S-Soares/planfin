defmodule PlanfinBackendWeb.Schema.FinanceTypesTest do
  use PlanfinBackendWeb.ConnCase, async: true

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Accounts, Periods}

  @today "2026-10-03"

  defp setup_conn(conn) do
    {user, group} = user_with_group_fixture()
    user = PlanfinBackend.Repo.get!(PlanfinBackend.Accounts.User, user.id)
    token = Accounts.generate_user_api_token(user)

    {:ok, _} =
      Periods.create_period(
        group.id,
        %{
          start_date: ~D[2026-09-12],
          end_date: ~D[2026-10-12],
          daily_limit: Decimal.new("50.00"),
          total_budget: Decimal.new("2000.00")
        },
        ~D[2026-10-03]
      )

    {put_req_header(conn, "authorization", "Bearer #{token}"), user, group}
  end

  defp gql(conn, query, variables \\ %{}) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/graphql", Jason.encode!(%{query: query, variables: variables}))
    |> json_response(200)
  end

  @create """
  mutation($name: String!, $kind: String!, $balance: String, $closingDay: Int, $dueDay: Int, $today: String) {
    createFinancialAccount(name: $name, kind: $kind, balance: $balance, closingDay: $closingDay, dueDay: $dueDay, today: $today) {
      id name kind isPrimary balance closingDay dueDay
    }
  }
  """

  defp create_accounts(conn) do
    %{"data" => %{"createFinancialAccount" => checking}} =
      gql(conn, @create, %{name: "Conta", kind: "checking", balance: "1500.00", today: @today})

    %{"data" => %{"createFinancialAccount" => card}} =
      gql(conn, @create, %{
        name: "Cartão",
        kind: "credit_card",
        closingDay: 5,
        dueDay: 15,
        today: @today
      })

    {checking, card}
  end

  test "creates accounts and lists them with live balance", %{conn: conn} do
    {conn, _user, _group} = setup_conn(conn)
    {checking, card} = create_accounts(conn)

    assert checking["isPrimary"]
    assert checking["balance"] == "1500.00"
    assert card["balance"] == nil
    assert card["closingDay"] == 5

    resp = gql(conn, "query { financialAccounts(today: \"#{@today}\") { name kind balance } }")
    assert length(resp["data"]["financialAccounts"]) == 2
  end

  test "card purchase in installments shows up in invoices and pay_invoice settles it", %{
    conn: conn
  } do
    {conn, _user, _group} = setup_conn(conn)
    {checking, card} = create_accounts(conn)

    resp =
      gql(
        conn,
        """
        mutation($accountId: ID) {
          createExpense(amount: "300.00", date: "2026-10-02", accountId: $accountId, installments: 3) {
            id amount installmentNumber installmentCount countsInBudget account { id kind }
          }
        }
        """,
        %{accountId: card["id"]}
      )

    expense = resp["data"]["createExpense"]
    assert expense["amount"] == "100.00"
    assert expense["installmentCount"] == 3
    assert expense["account"]["kind"] == "credit_card"

    resp =
      gql(conn, """
      query { invoices(cardId: "#{card["id"]}", today: "#{@today}", past: 0) { month total status dueDate } }
      """)

    assert [
             %{
               "month" => "2026-10",
               "total" => "100.00",
               "status" => "open",
               "dueDate" => "2026-10-15"
             },
             %{"month" => "2026-11", "total" => "100.00"},
             %{"month" => "2026-12", "total" => "100.00"}
           ] = resp["data"]["invoices"]

    resp =
      gql(
        conn,
        """
        mutation($card: ID!, $from: ID!) {
          payInvoice(cardId: $card, month: "2026-10", fromAccountId: $from, amount: "100.00", date: "2026-10-14") {
            status paid remaining entries { id }
          }
        }
        """,
        %{card: card["id"], from: checking["id"]}
      )

    assert %{"status" => "paid", "remaining" => "0", "entries" => [_]} =
             resp["data"]["payInvoice"]

    resp = gql(conn, "query { financialAccounts(today: \"2026-10-14\") { kind balance } }")
    checking_now = Enum.find(resp["data"]["financialAccounts"], &(&1["kind"] == "checking"))
    assert checking_now["balance"] == "1400.00"
  end

  test "setAccountBalance reconciles and accountMovements lists history", %{conn: conn} do
    {conn, _user, _group} = setup_conn(conn)
    {checking, _card} = create_accounts(conn)

    resp =
      gql(conn, """
      mutation { setAccountBalance(id: "#{checking["id"]}", balance: "999.90", today: "#{@today}") { balance } }
      """)

    assert resp["data"]["setAccountBalance"]["balance"] == "999.90"

    resp =
      gql(conn, """
      query { accountMovements(accountId: "#{checking["id"]}") { kind amount } }
      """)

    assert resp["data"]["accountMovements"] == []
  end

  test "rejects accounts of another group", %{conn: conn} do
    {conn, _user, _group} = setup_conn(conn)
    {_other_user, other_group} = user_with_group_fixture()

    {:ok, foreign} =
      PlanfinBackend.Finance.create_account(other_group.id, %{name: "X", kind: "checking"})

    resp = gql(conn, "query { accountMovements(accountId: \"#{foreign.id}\") { id } }")
    assert [%{"message" => "Account not found"}] = resp["errors"]
  end
end
