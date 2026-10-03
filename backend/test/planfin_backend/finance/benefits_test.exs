defmodule PlanfinBackend.Finance.BenefitsTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods}
  alias PlanfinBackend.Finance.Benefits

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, va} =
      Finance.create_account(
        group.id,
        %{
          name: "VA",
          kind: "benefit",
          balance: Decimal.new("320.00"),
          monthly_credit: Decimal.new("1150.00"),
          credit_day: 1
        },
        ~D[2026-10-03]
      )

    %{user: user, group: group, va: va}
  end

  test "credits on the day, once, skipping credits already in the balance" do
    ctx = setup_group()

    # Oct 1 is before the reconciliation (Oct 3): already inside the 320
    :ok = Benefits.credit_due(ctx.group.id, ~D[2026-10-20])
    assert Decimal.equal?(Finance.account_balance(ctx.va, ~D[2026-10-20]), Decimal.new("320.00"))

    :ok = Benefits.credit_due(ctx.group.id, ~D[2026-11-01])
    :ok = Benefits.credit_due(ctx.group.id, ~D[2026-11-02])
    assert Decimal.equal?(Finance.account_balance(ctx.va, ~D[2026-11-02]), Decimal.new("1470.00"))

    assert Benefits.next_credit_date(ctx.va, ~D[2026-11-02]) == ~D[2026-12-01]
    assert Benefits.next_credit_date(ctx.va, ~D[2026-11-01]) == ~D[2026-12-01]
    assert Benefits.next_credit_date(ctx.va, ~D[2026-10-31]) == ~D[2026-11-01]
  end

  test "spending on the voucher never counts in the daily budget" do
    ctx = setup_group()

    {:ok, _} =
      Periods.create_period(
        ctx.group.id,
        %{
          start_date: ~D[2026-10-01],
          end_date: ~D[2026-10-31],
          daily_limit: Decimal.new("50"),
          total_budget: Decimal.new("1550")
        },
        ~D[2026-10-03]
      )

    {:ok, entry} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("230.00"),
        date: ~D[2026-10-03],
        account_id: ctx.va.id
      })

    refute entry.counts_in_budget
    assert Decimal.equal?(Finance.account_balance(ctx.va, ~D[2026-10-03]), Decimal.new("90.00"))
  end

  test "credit day clamps to the end of the month and requires both fields" do
    {_user, group} = user_with_group_fixture()

    {:ok, va} =
      Finance.create_account(group.id, %{
        name: "VR",
        kind: "benefit",
        monthly_credit: Decimal.new("500"),
        credit_day: 31
      })

    assert Benefits.credit_date(va, {2026, 11}) == ~D[2026-11-30]

    assert {:error, cs} =
             Finance.create_account(group.id, %{
               name: "X",
               kind: "benefit",
               monthly_credit: Decimal.new("500")
             })

    assert %{credit_day: _} = errors_on(cs)
  end
end
