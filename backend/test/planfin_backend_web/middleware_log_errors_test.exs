defmodule PlanfinBackendWeb.Middleware.LogErrorsTest do
  use PlanfinBackendWeb.ConnCase, async: false

  import ExUnit.CaptureLog
  import PlanfinBackend.AccountsFixtures

  test "a failing mutation is logged with field, message and group", %{conn: conn} do
    {user, group} = user_with_group_fixture()
    user = PlanfinBackend.Repo.get!(PlanfinBackend.Accounts.User, user.id)
    token = PlanfinBackend.Accounts.generate_user_api_token(user)

    log =
      capture_log(fn ->
        conn
        |> put_req_header("authorization", "Bearer #{token}")
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/graphql",
          Jason.encode!(%{
            query:
              ~s|mutation { createRecurringBill(name: "X", amount: "10", dueDay: 5, accountId: "#{Ecto.UUID.generate()}") { id } }|
          })
        )
        |> json_response(200)
      end)

    assert log =~ "[graphql] mutation createRecurringBill failed: Account not found"
    assert log =~ "group=\"#{group.id}\""
  end
end
