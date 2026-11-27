defmodule PlanfinBackendWeb.Schema.PlannedTypesTest do
  use PlanfinBackendWeb.ConnCase, async: true

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Accounts, Finance, Periods}
  alias PlanfinBackend.Finance.Bills

  setup %{conn: conn} do
    {user, group} = user_with_group_fixture()
    user = PlanfinBackend.Repo.get!(PlanfinBackend.Accounts.User, user.id)
    token = Accounts.generate_user_api_token(user)

    {:ok, _} =
      Periods.create_period(
        group.id,
        %{
          start_date: ~D[2026-10-13],
          end_date: ~D[2026-11-12],
          daily_limit: Decimal.new("100"),
          total_budget: Decimal.new("3100")
        },
        ~D[2026-10-13]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    {:ok, quota} =
      Bills.create_bill(group.id, %{
        name: "Lavagem do carro",
        amount: Decimal.new("150"),
        due_day: 1,
        account_id: card.id,
        kind: "quota"
      })

    quota
    |> Ecto.Changeset.change(inserted_at: ~N[2026-09-01 00:00:00])
    |> PlanfinBackend.Repo.update!()

    conn = put_req_header(conn, "authorization", "Bearer #{token}")
    %{conn: conn, card: card, quota: quota}
  end

  defp gql(conn, query, variables) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/graphql", Jason.encode!(%{query: query, variables: variables}))
    |> json_response(200)
  end

  test "a purchase links to a quota, the invoice and quotasFor show it, and it can be unlinked",
       %{conn: conn, card: card, quota: quota} do
    create = """
    mutation($accountId: ID, $quotaId: ID) {
      createExpense(amount: "30.00", date: "2026-10-15", accountId: $accountId, quotaId: $quotaId) {
        id quotaId countsInBudget
      }
    }
    """

    %{"data" => %{"createExpense" => expense}} =
      gql(conn, create, %{accountId: card.id, quotaId: quota.id})

    assert expense["quotaId"] == quota.id
    refute expense["countsInBudget"]

    quotas_for = """
    query { quotasFor(date: "2026-10-15") { quotaId name month planned spent remaining } }
    """

    assert %{"data" => %{"quotasFor" => [q]}} = gql(conn, quotas_for, %{})
    assert q["quotaId"] == quota.id
    assert q["month"] == "2026-11"
    assert q["spent"] == "30.00"
    assert q["remaining"] == "120.00"

    invoice = """
    query($cardId: ID!) { invoice(cardId: $cardId, month: "2026-11", today: "2026-10-15") { quotas { name spent remaining } entries { id quotaId } } }
    """

    %{"data" => %{"invoice" => inv}} = gql(conn, invoice, %{cardId: card.id})
    assert [%{"name" => "Lavagem do carro", "spent" => "30.00"}] = inv["quotas"]
    assert [%{"quotaId" => linked}] = inv["entries"]
    assert linked == quota.id

    unlink = """
    mutation($id: ID!) { updateExpense(id: $id, quotaId: null) { quotaId countsInBudget } }
    """

    assert %{"data" => %{"updateExpense" => %{"quotaId" => nil, "countsInBudget" => true}}} =
             gql(conn, unlink, %{id: expense["id"]})
  end

  test "a planned expense without a day is created and edited through the API, prefilled",
       %{conn: conn, card: card} do
    create = """
    mutation($accountId: ID!) {
      createRecurringBill(name: "Pneus", amount: "800.00", dueDay: 1, accountId: $accountId,
                          onceMonth: "2026-12", noDueDay: true) { id noDueDay onceMonth }
    }
    """

    %{"data" => %{"createRecurringBill" => bill}} = gql(conn, create, %{accountId: card.id})
    assert bill["noDueDay"]
    assert bill["onceMonth"] == "2026-12"

    list = "query { recurringBills { id noDueDay } }"
    assert %{"data" => %{"recurringBills" => bills}} = gql(conn, list, %{})
    assert Enum.any?(bills, &(&1["id"] == bill["id"] and &1["noDueDay"]))

    update = """
    mutation($id: ID!) { updateRecurringBill(id: $id, noDueDay: false, dueDay: 20) { noDueDay dueDay } }
    """

    assert %{"data" => %{"updateRecurringBill" => %{"noDueDay" => false, "dueDay" => 20}}} =
             gql(conn, update, %{id: bill["id"]})
  end
end
