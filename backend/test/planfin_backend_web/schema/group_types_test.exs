defmodule PlanfinBackendWeb.Schema.GroupTypesTest do
  use PlanfinBackendWeb.ConnCase, async: true

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.Accounts

  defp authed_conn(conn, user) do
    token = Accounts.generate_user_api_token(user)
    put_req_header(conn, "authorization", "Bearer #{token}")
  end

  defp post_graphql(conn, query, variables \\ %{}) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/graphql", Jason.encode!(%{query: query, variables: variables}))
    |> json_response(200)
  end

  describe "createGroup + activeGroup + myGroups" do
    test "user creates a group, becomes its member, it is active, and is listed", %{conn: conn} do
      user = user_fixture()
      conn = authed_conn(conn, user)

      create_mutation = """
        mutation CreateGroup($name: String!) {
          createGroup(name: $name) { id name ownerId }
        }
      """

      resp = post_graphql(conn, create_mutation, %{name: "Casa"})
      assert resp["errors"] == nil
      new_group = resp["data"]["createGroup"]
      assert new_group["name"] == "Casa"
      assert new_group["ownerId"] == user.id

      # Refresh user token to pick up the new active_group_id for the next call
      conn = authed_conn(build_conn(), user)

      active_query = """
        query { activeGroup { id name } }
      """

      resp = post_graphql(conn, active_query)
      assert resp["errors"] == nil
      assert resp["data"]["activeGroup"]["id"] == new_group["id"]
      assert resp["data"]["activeGroup"]["name"] == "Casa"

      my_query = """
        query { myGroups { id name } }
      """

      resp = post_graphql(conn, my_query)
      names = Enum.map(resp["data"]["myGroups"], & &1["name"])
      assert "Casa" in names
    end
  end

  describe "invite flow" do
    test "owner generates code → second user redeems → both see expenses", %{conn: _conn} do
      u1 = user_fixture()
      u2 = user_fixture()

      # u1 creates group
      c1 = authed_conn(build_conn(), u1)

      resp =
        post_graphql(
          c1,
          """
            mutation { createGroup(name: "Familia") { id } }
          """
        )

      group_id = resp["data"]["createGroup"]["id"]
      c1 = authed_conn(build_conn(), u1)

      # u1 generates invite
      resp =
        post_graphql(c1, "mutation G($id: ID!){generateInviteCode(groupId: $id){code}}", %{
          id: group_id
        })

      code = resp["data"]["generateInviteCode"]["code"]
      assert String.length(code) == 8

      # u2 redeems
      c2 = authed_conn(build_conn(), u2)

      resp =
        post_graphql(c2, "mutation R($c: String!){redeemInviteCode(code: $c){group{id}}}", %{
          c: code
        })

      assert resp["errors"] == nil
      assert resp["data"]["redeemInviteCode"]["group"]["id"] == group_id

      # u2 now sees the group in myGroups
      c2 = authed_conn(build_conn(), u2)
      resp = post_graphql(c2, "query { myGroups { id } }")
      ids = Enum.map(resp["data"]["myGroups"], & &1["id"])
      assert group_id in ids
    end

    test "redeeming an invalid code returns an error", %{conn: conn} do
      user = user_fixture()
      conn = authed_conn(conn, user)

      resp =
        post_graphql(
          conn,
          "mutation R($c: String!){redeemInviteCode(code: $c){group{id}}}",
          %{c: "NONEXIST"}
        )

      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Invalid or revoked code"
    end

    test "user can revoke their own invite code", %{conn: _conn} do
      user = user_fixture()
      conn = authed_conn(build_conn(), user)

      resp = post_graphql(conn, "mutation { createGroup(name: \"g\") { id } }")
      group_id = resp["data"]["createGroup"]["id"]

      conn = authed_conn(build_conn(), user)

      resp =
        post_graphql(conn, "mutation G($id: ID!){generateInviteCode(groupId: $id){id code}}", %{
          id: group_id
        })

      invite_id = resp["data"]["generateInviteCode"]["id"]
      code = resp["data"]["generateInviteCode"]["code"]

      resp =
        post_graphql(conn, "mutation R($id: ID!){revokeInviteCode(inviteId: $id)}", %{
          id: invite_id
        })

      assert resp["data"]["revokeInviteCode"] == true

      # Now redeeming should fail
      u2 = user_fixture()
      c2 = authed_conn(build_conn(), u2)

      resp =
        post_graphql(
          c2,
          "mutation R($c: String!){redeemInviteCode(code: $c){group{id}}}",
          %{c: code}
        )

      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] == "Invalid or revoked code"
    end
  end

  describe "leaveGroup and deleteGroup" do
    test "non-owner can leave; owner with other members cannot", %{conn: _conn} do
      u1 = user_fixture()
      u2 = user_fixture()

      c1 = authed_conn(build_conn(), u1)
      resp = post_graphql(c1, "mutation { createGroup(name: \"g\") { id } }")
      group_id = resp["data"]["createGroup"]["id"]

      c1 = authed_conn(build_conn(), u1)

      resp =
        post_graphql(c1, "mutation G($id: ID!){generateInviteCode(groupId: $id){code}}", %{
          id: group_id
        })

      code = resp["data"]["generateInviteCode"]["code"]

      c2 = authed_conn(build_conn(), u2)

      post_graphql(
        c2,
        "mutation R($c: String!){redeemInviteCode(code: $c){group{id}}}",
        %{c: code}
      )

      # Owner tries to leave → denied
      c1 = authed_conn(build_conn(), u1)

      resp =
        post_graphql(c1, "mutation L($id: ID!){leaveGroup(id: $id)}", %{id: group_id})

      assert resp["errors"] != nil
      assert hd(resp["errors"])["message"] =~ "Owner must"

      # Non-owner leaves → ok
      c2 = authed_conn(build_conn(), u2)
      resp = post_graphql(c2, "mutation L($id: ID!){leaveGroup(id: $id)}", %{id: group_id})
      assert resp["data"]["leaveGroup"] == true
    end
  end

  describe "createdBy on expense" do
    test "expense resolves createdBy with author email", %{conn: conn} do
      {user, _group} = user_with_group_fixture()
      conn = authed_conn(conn, user)
      today = Date.utc_today()

      post_graphql(
        conn,
        """
          mutation CreatePeriod($s: String!, $e: String!, $d: String!) {
            createPeriod(startDate: $s, endDate: $e, dailyLimit: $d) { id }
          }
        """,
        %{
          s: Date.to_iso8601(today),
          e: Date.to_iso8601(Date.add(today, 29)),
          d: "100.00"
        }
      )

      resp =
        post_graphql(
          conn,
          """
            mutation CreateExpense($amount: String!, $date: String!) {
              createExpense(amount: $amount, date: $date) {
                id
                amount
                createdBy { id email }
              }
            }
          """,
          %{amount: "15.00", date: Date.to_iso8601(today)}
        )

      assert resp["errors"] == nil
      author = resp["data"]["createExpense"]["createdBy"]
      assert author["email"] == user.email
      assert author["id"] == to_string(user.id)
    end
  end
end
