defmodule PlanfinBackend.Finance.AllowanceTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance}
  alias PlanfinBackend.Finance.{Allowance, Salary}

  # Cycle Sep 12 – Oct 12 (next salary Oct 13). Closing window: Oct 10–12.
  @mid ~D[2026-10-03]
  @closing ~D[2026-10-11]

  defp setup_group(balance \\ "3000.00") do
    {user, group} = user_with_group_fixture()
    wife = user_fixture()
    _ = join_group_fixture(wife, group)

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new(balance)},
        ~D[2026-10-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    {:ok, mine} =
      Finance.create_account(group.id, %{
        name: "Mesada Pedro",
        kind: "allowance",
        owner_user_id: user.id
      })

    {:ok, hers} =
      Finance.create_account(group.id, %{
        name: "Mesada Ela",
        kind: "allowance",
        owner_user_id: wife.id
      })

    {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("5000.00")})

    %{user: user, group: group, checking: checking, card: card, mine: mine, hers: hers}
  end

  test "left over is split in two and only offered at the cycle closing" do
    ctx = setup_group()

    plan = Allowance.build(ctx.group.id, @mid)
    assert Decimal.equal?(plan.amount, Decimal.new("3000.00"))
    refute plan.can_distribute
    assert plan.opens_on == ~D[2026-10-10]
    assert Enum.map(plan.shares, &Decimal.to_string(&1.amount)) == ["1500.00", "1500.00"]

    assert {:error, :not_available} = Allowance.distribute(ctx.group.id, ctx.user.id, @mid)

    {:ok, after_plan} = Allowance.distribute(ctx.group.id, ctx.user.id, @closing)
    assert Decimal.equal?(after_plan.distributed, Decimal.new("3000.00"))
    assert Decimal.equal?(after_plan.amount, Decimal.new("0"))
    refute after_plan.can_distribute

    assert Decimal.equal?(Finance.account_balance(ctx.mine, @closing), Decimal.new("1500.00"))
    assert Decimal.equal?(Finance.account_balance(ctx.checking, @closing), Decimal.new("0.00"))
  end

  test "keeps what the next salary can't cover" do
    ctx = setup_group()

    # 5800 already on the invoice due Nov 16 (paid by the Nov 13 salary of 5000)
    {:ok, _} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("5800.00"),
        date: ~D[2026-10-20],
        account_id: ctx.card.id,
        counts_in_budget: false
      })

    # Oct 13 salary not counted yet: as of Oct 11 the next salary is Oct 13 and
    # its cycle pays the October invoice (empty), so no shortfall.
    assert Decimal.equal?(Allowance.build(ctx.group.id, @closing).shortfall, Decimal.new("0"))

    # On Nov 10 (closing of the next cycle) the Nov 16 invoice is 5800 > 5000.
    plan = Allowance.build(ctx.group.id, ~D[2026-11-10])
    assert Decimal.equal?(plan.shortfall, Decimal.new("800.00"))
    assert Decimal.equal?(plan.amount, Decimal.new("2200.00"))
  end

  test "tight month: nothing to distribute" do
    ctx = setup_group("100.00")

    {:ok, _} =
      PlanfinBackend.Finance.Bills.create_bill(ctx.group.id, %{
        name: "Aluguel",
        amount: Decimal.new("1500.00"),
        due_day: 12,
        account_id: ctx.checking.id
      })

    plan = Allowance.build(ctx.group.id, @closing)
    assert Decimal.equal?(plan.amount, Decimal.new("0"))
    refute plan.can_distribute
  end

  test "rejects more than the left over" do
    ctx = setup_group()

    assert {:error, :invalid_amount} =
             Allowance.distribute(ctx.group.id, ctx.user.id, @closing, Decimal.new("3000.01"))

    assert {:ok, _} =
             Allowance.distribute(ctx.group.id, ctx.user.id, @closing, Decimal.new("1000.01"))

    balances =
      [ctx.mine, ctx.hers]
      |> Enum.map(&Finance.account_balance(&1, @closing))
      |> Enum.map(&Decimal.to_string/1)
      |> Enum.sort()

    assert balances == ["500.00", "500.01"]
  end

  test "reserve status sums reserve accounts against the goal" do
    ctx = setup_group()

    {:ok, _} =
      Finance.create_account(ctx.group.id, %{
        name: "Reserva",
        kind: "reserve",
        balance: Decimal.new("8000")
      })

    {:ok, _} = Salary.update_settings(ctx.group.id, %{reserve_goal: Decimal.new("30000")})
    status = Allowance.reserve_status(ctx.group.id, @mid)
    assert Decimal.equal?(status.total, Decimal.new("8000"))
    assert Decimal.equal?(status.goal, Decimal.new("30000"))
  end
end
