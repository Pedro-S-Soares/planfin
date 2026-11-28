defmodule PlanfinBackend.Finance.AllowanceTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance}
  alias PlanfinBackend.Finance.{Allowance, Bills, CyclePlan, Panel, Salary}

  # Cycle Sep 12 – Oct 12 (next salary Oct 13). Closing window: Oct 10–12.
  # Month window: today until Nov 12 (eve of the November salary).
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
      Finance.create_account(
        group.id,
        %{
          name: "Mesada Pedro",
          kind: "allowance",
          owner_user_id: user.id
        },
        ~D[2026-10-01]
      )

    {:ok, hers} =
      Finance.create_account(
        group.id,
        %{
          name: "Mesada Ela",
          kind: "allowance",
          owner_user_id: wife.id
        },
        ~D[2026-10-01]
      )

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

  test "never distributes money that has not arrived yet" do
    ctx = setup_group()
    plan = Allowance.build(ctx.group.id, @mid)
    # Month left over includes the Oct 13 salary (8000), but only 3000 is in the account
    assert Decimal.equal?(plan.free, Decimal.new("8000.00"))
    assert Decimal.equal?(plan.amount, Decimal.new("3000.00"))
    # The Home shows the cap line: limited to the cash free until the salary.
    assert plan.capped
    assert Decimal.equal?(plan.cash, Decimal.new("3000.00"))
    assert plan.cash_until == ~D[2026-10-12]
  end

  test "an invoice bigger than the money leaves a shortfall and no allowance" do
    ctx = setup_group()

    {:ok, _} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("9000.00"),
        date: ~D[2026-09-20],
        account_id: ctx.card.id,
        counts_in_budget: false
      })

    plan = Allowance.build(ctx.group.id, @closing)
    assert Decimal.equal?(plan.amount, Decimal.new("0"))
    assert Decimal.equal?(plan.shortfall, Decimal.new("1000.00"))
    refute plan.can_distribute
  end

  test "tight month: nothing to distribute" do
    ctx = setup_group("100.00")

    {:ok, _} =
      PlanfinBackend.Finance.Bills.create_bill(ctx.group.id, %{
        name: "Aluguel",
        amount: Decimal.new("4000.00"),
        due_day: 12,
        account_id: ctx.checking.id
      })

    backdate_bills(ctx.group.id, Date.add(@closing, -20))
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

  describe "card invoice due after the salary" do
    # Card closes on the 5th and is due on the 15th; the salary lands on Dec 11
    # (10th labor business day). On Dec 9 (month closing) the invoice closed on
    # Dec 5 is still unpaid and due Dec 15, after the salary.
    @dec_closing ~D[2026-12-09]

    defp setup_after_salary do
      ctx = setup_group("3000.00")
      {:ok, _} = Finance.set_balance(ctx.checking, Decimal.new("3000.00"), ~D[2026-12-01])
      {:ok, _} = Salary.update_settings(ctx.group.id, %{salary_amount: Decimal.new("9000.00")})

      {:ok, _} =
        Expenses.create_expense(ctx.group.id, ctx.user.id, %{
          amount: Decimal.new("7000.00"),
          date: ~D[2026-11-20],
          account_id: ctx.card.id,
          counts_in_budget: false
        })

      {:ok, _} =
        Bills.create_bill(ctx.group.id, %{
          name: "Escola",
          amount: Decimal.new("4000.00"),
          due_day: 15,
          account_id: ctx.checking.id
        })

      backdate_bills(ctx.group.id, ~D[2026-12-01])
      ctx
    end

    test "keeps what the invoice and the bills after the salary need" do
      ctx = setup_after_salary()

      # Until the eve of the salary nothing leaves the account: the cash alone
      # would offer the whole balance.
      panel = Panel.build(ctx.group.id, @dec_closing, Salary.horizon(ctx.group.id, @dec_closing))
      assert Decimal.equal?(panel.free, Decimal.new("3000.00"))

      # 3000 + salary 9000 − invoice 7000 − bill 4000 (Dec 15) = 1000
      plan = Allowance.build(ctx.group.id, @dec_closing)
      assert Decimal.equal?(plan.free, Decimal.new("1000.00"))
      assert Decimal.equal?(plan.amount, Decimal.new("1000.00"))
      assert plan.can_distribute
      # Closed invoice: the math is the plan's result alone, no goal line.
      assert plan.invoice_status == "closed"
      assert Decimal.equal?(plan.plan_result, Decimal.new("1000.00"))
      assert plan.goal_days == nil and plan.goal_amount == nil
      {:ok, cycle} = CyclePlan.build(ctx.group.id, @dec_closing)
      assert plan.plan_until == cycle.current.window_end
      refute plan.capped
      assert Enum.map(plan.shares, &Decimal.to_string(&1.amount)) == ["500.00", "500.00"]
    end

    test "after distributing, the next cycle starts with nothing carried" do
      ctx = setup_after_salary()

      {:ok, after_plan} = Allowance.distribute(ctx.group.id, ctx.user.id, @dec_closing)
      assert Decimal.equal?(after_plan.distributed, Decimal.new("1000.00"))
      assert Decimal.equal?(after_plan.amount, Decimal.new("0"))

      assert {:error, :not_available} =
               Allowance.distribute(ctx.group.id, ctx.user.id, @dec_closing, Decimal.new("1"))

      {:ok, cycle} = CyclePlan.build(ctx.group.id, @dec_closing)
      assert cycle.current.status == "closed"
      assert Decimal.equal?(cycle.current.result, Decimal.new("0"))
      assert Decimal.equal?(cycle.next.carry.amount, Decimal.new("0"))
    end

    test "a bill due before the salary limits the transfer to the cash left" do
      ctx = setup_after_salary()
      {:ok, _} = Salary.update_settings(ctx.group.id, %{salary_amount: Decimal.new("15000.00")})

      {:ok, _} =
        Bills.create_bill(ctx.group.id, %{
          name: "IPVA",
          amount: Decimal.new("2500.00"),
          due_day: 10,
          once_month: ~D[2026-12-01],
          account_id: ctx.checking.id
        })

      backdate_bills(ctx.group.id, ~D[2026-12-01])
      plan = Allowance.build(ctx.group.id, @dec_closing)
      # Plan: 3000 + 15000 − 7000 − 4000 − 2500 = 4500; cash until Dec 10: 3000 − 2500
      assert Decimal.equal?(plan.free, Decimal.new("4500.00"))
      assert Decimal.equal?(plan.amount, Decimal.new("500.00"))
      assert plan.capped
      assert Decimal.equal?(plan.cash, Decimal.new("500.00"))
    end

    test "while the invoice is open, the daily goal until the closing is kept" do
      ctx = setup_group("3000.00")

      {:ok, _} =
        PlanfinBackend.Periods.create_period(
          ctx.group.id,
          %{
            name: "Meta",
            start_date: ~D[2026-10-01],
            end_date: ~D[2026-11-04],
            daily_limit: Decimal.new("100.00"),
            total_budget: Decimal.new("3500.00"),
            status: "active"
          },
          ~D[2026-10-01]
        )

      # Open invoice (closes Nov 5): the goal reserves 100 × 25 days (Oct 11 – Nov 4).
      plan = Allowance.build(ctx.group.id, @closing)
      {:ok, cycle} = CyclePlan.build(ctx.group.id, @closing)
      assert cycle.current.status == "open"
      assert Decimal.equal?(plan.free, Decimal.sub(cycle.current.result, Decimal.new("2500.00")))

      # The parts shown on the Home add up to the same number.
      assert plan.invoice_status == "open"
      assert Decimal.equal?(plan.plan_result, cycle.current.result)
      assert plan.plan_until == cycle.current.last_purchase_date
      assert plan.goal_days == 25
      assert Decimal.equal?(plan.goal_daily, Decimal.new("100.00"))
      assert Decimal.equal?(plan.goal_amount, Decimal.new("2500.00"))
      assert Decimal.equal?(Decimal.sub(plan.plan_result, plan.goal_amount), plan.free)
    end
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
