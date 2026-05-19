defmodule PlanfinBackend.Accounts.BetaTestersTest do
  use ExUnit.Case, async: false

  alias PlanfinBackend.Accounts.BetaTesters

  setup do
    original = Application.get_env(:planfin_backend, :beta_tester_emails)
    on_exit(fn -> Application.put_env(:planfin_backend, :beta_tester_emails, original) end)
    :ok
  end

  describe "allowed?/1" do
    test "returns true when email is in the configured list" do
      Application.put_env(:planfin_backend, :beta_tester_emails, ["alice@example.com"])
      assert BetaTesters.allowed?("alice@example.com")
    end

    test "returns false when email is not in the list" do
      Application.put_env(:planfin_backend, :beta_tester_emails, ["alice@example.com"])
      refute BetaTesters.allowed?("bob@example.com")
    end

    test "is case-insensitive" do
      Application.put_env(:planfin_backend, :beta_tester_emails, ["alice@example.com"])
      assert BetaTesters.allowed?("Alice@Example.com")
    end

    test "returns false for nil" do
      Application.put_env(:planfin_backend, :beta_tester_emails, ["alice@example.com"])
      refute BetaTesters.allowed?(nil)
    end

    test "returns true for any email when configured as :all" do
      Application.put_env(:planfin_backend, :beta_tester_emails, :all)
      assert BetaTesters.allowed?("anyone@example.com")
    end

    test "returns false when list is empty" do
      Application.put_env(:planfin_backend, :beta_tester_emails, [])
      refute BetaTesters.allowed?("alice@example.com")
    end
  end
end
