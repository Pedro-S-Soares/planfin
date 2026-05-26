defmodule PlanfinBackend.Accounts.BetaTestersTest do
  use PlanfinBackend.DataCase, async: true

  alias PlanfinBackend.Accounts.{BetaTesters, AllowedUser}
  alias PlanfinBackend.Repo

  setup do
    original = Application.get_env(:planfin_backend, :beta_tester_emails)
    on_exit(fn -> Application.put_env(:planfin_backend, :beta_tester_emails, original) end)
    # Use DB gate by default in tests
    Application.put_env(:planfin_backend, :beta_tester_emails, [])
    :ok
  end

  defp insert_allowed(email) do
    Repo.insert!(%AllowedUser{email: String.downcase(email)})
  end

  describe "allowed?/1" do
    test "returns true when email is in allowed_users table" do
      insert_allowed("alice@example.com")
      assert BetaTesters.allowed?("alice@example.com")
    end

    test "returns false when email is not in allowed_users table" do
      refute BetaTesters.allowed?("bob@example.com")
    end

    test "is case-insensitive" do
      insert_allowed("alice@example.com")
      assert BetaTesters.allowed?("Alice@Example.com")
    end

    test "returns false for nil" do
      refute BetaTesters.allowed?(nil)
    end

    test "returns true for any email when configured as :all" do
      Application.put_env(:planfin_backend, :beta_tester_emails, :all)
      assert BetaTesters.allowed?("anyone@example.com")
    end

    test "returns false when allowed_users table is empty" do
      refute BetaTesters.allowed?("alice@example.com")
    end
  end
end
