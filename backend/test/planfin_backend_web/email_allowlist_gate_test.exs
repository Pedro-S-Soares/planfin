defmodule PlanfinBackendWeb.EmailAllowlistGateTest do
  @moduledoc """
  Verifica que os fluxos de envio de email (registration, magic link, email change,
  forgot password) só entregam emails para endereços na allowlist de beta testers.

  Marcado como async: false porque mexe em `Application.env`, que é global.
  """
  use PlanfinBackendWeb.ConnCase, async: false

  alias PlanfinBackend.Accounts
  alias PlanfinBackend.Accounts.AllowedUser
  alias PlanfinBackend.Repo
  import PlanfinBackend.AccountsFixtures

  @allowed "allowed@example.com"
  @blocked "blocked@example.com"

  setup do
    original = Application.get_env(:planfin_backend, :beta_tester_emails)
    # Use DB gate so tests exercise real allowlist logic
    Application.put_env(:planfin_backend, :beta_tester_emails, [])
    on_exit(fn -> Application.put_env(:planfin_backend, :beta_tester_emails, original) end)

    Repo.insert!(%AllowedUser{email: @allowed})
    :ok
  end

  describe "POST /users/register" do
    test "delivers login instructions when email is allowlisted", %{conn: conn} do
      post(conn, ~p"/users/register", %{"user" => valid_user_attributes(email: @allowed)})

      user = Accounts.get_user_by_email(@allowed)
      assert user
      assert Repo.get_by(Accounts.UserToken, user_id: user.id, context: "login")
    end

    test "does not deliver email when address is not allowlisted", %{conn: conn} do
      post(conn, ~p"/users/register", %{"user" => valid_user_attributes(email: @blocked)})

      user = Accounts.get_user_by_email(@blocked)
      assert user, "user should still be created"
      refute Repo.get_by(Accounts.UserToken, user_id: user.id, context: "login")
    end
  end

  describe "POST /users/log-in (magic link request)" do
    test "creates login token when email is allowlisted", %{conn: conn} do
      user = user_fixture(%{email: @allowed})

      post(conn, ~p"/users/log-in", %{"user" => %{"email" => user.email}})

      assert Repo.get_by(Accounts.UserToken, user_id: user.id, context: "login")
    end

    test "does not deliver email for non-allowlisted address", %{conn: conn} do
      user = user_fixture(%{email: @blocked})

      post(conn, ~p"/users/log-in", %{"user" => %{"email" => user.email}})

      refute Repo.get_by(Accounts.UserToken, user_id: user.id, context: "login")
    end
  end

  describe "PUT /users/settings (email change)" do
    setup %{conn: conn} do
      user = user_fixture(%{email: @allowed})
      conn = log_in_user(conn, user)
      %{conn: conn, user: user}
    end

    test "delivers confirmation when new email is allowlisted", %{conn: conn, user: user} do
      Repo.insert!(%AllowedUser{email: "new@example.com"})

      put(conn, ~p"/users/settings", %{
        "action" => "update_email",
        "user" => %{"email" => "new@example.com"}
      })

      assert Repo.get_by(Accounts.UserToken, user_id: user.id, context: "change:#{user.email}")
    end

    test "does not deliver confirmation when new email is not allowlisted", %{
      conn: conn,
      user: user
    } do
      put(conn, ~p"/users/settings", %{
        "action" => "update_email",
        "user" => %{"email" => @blocked}
      })

      refute Repo.get_by(Accounts.UserToken, user_id: user.id, context: "change:#{user.email}")
    end
  end

  describe "GraphQL forgotPassword (rate-limited path)" do
    test "delivers reset email when address is allowlisted", %{conn: conn} do
      user = user_fixture(%{email: @allowed})

      conn
      |> put_req_header("content-type", "application/json")
      |> post(
        "/api/graphql",
        Jason.encode!(%{
          query: "mutation($e:String!){forgotPassword(email:$e)}",
          variables: %{e: user.email}
        })
      )

      assert Repo.get_by(Accounts.UserToken, user_id: user.id, context: "reset_password")
    end

    test "does not deliver for non-allowlisted address even when user exists", %{conn: conn} do
      user = user_fixture(%{email: @blocked})

      conn
      |> put_req_header("content-type", "application/json")
      |> post(
        "/api/graphql",
        Jason.encode!(%{
          query: "mutation($e:String!){forgotPassword(email:$e)}",
          variables: %{e: user.email}
        })
      )

      refute Repo.get_by(Accounts.UserToken, user_id: user.id, context: "reset_password")
    end
  end
end
