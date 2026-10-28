defmodule PlanfinBackend.Finance.CyclePlanTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods, Repo}
  alias PlanfinBackend.Finance.{Bills, CyclePlan, Invoices, MonthPlan, Salary}
  alias PlanfinBackend.Periods.Period

  @today ~D[2026-10-27]

  defp sum(items), do: Enum.reduce(items, Decimal.new(0), &Decimal.add(&2, &1.amount))

  # Pedro on October 27th: R$ 1.400 in the account, the BB invoice closing on
  # Nov 5 at R$ 7.000, installments on BB and Nubank (closes 28, due 5).
  defp setup_pedro do
    {user, group} = user_with_group_fixture()

    {:ok, bb} =
      Finance.create_account(
        group.id,
        %{name: "BB", kind: "checking", balance: Decimal.new("1400")},
        @today
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Crédito BB", kind: "credit_card", closing_day: 5, due_day: 15},
        @today
      )

    {:ok, nubank} =
      Finance.create_account(
        group.id,
        %{name: "Nubank", kind: "credit_card", closing_day: 28, due_day: 5},
        @today
      )

    {:ok, _caju} =
      Finance.create_account(
        group.id,
        %{
          name: "Caju",
          kind: "benefit",
          balance: Decimal.new("800"),
          monthly_credit: Decimal.new("1150"),
          credit_day: 1
        },
        @today
      )

    {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("10607")})

    purchase = fn account, amount, date, installments ->
      {:ok, _} =
        Expenses.create_expense(group.id, user.id, %{
          amount: Decimal.new(amount),
          date: date,
          account_id: account.id,
          counts_in_budget: false,
          installments: installments,
          today: @today
        })
    end

    # 3 × 200 on BB: invoices of Nov, Dec and Jan
    purchase.(card, "600", ~D[2026-10-20], 3)
    # 4 × 100 on Nubank: invoices due Nov 5, Dec 7, Jan 5 and Feb 5
    purchase.(nubank, "400", ~D[2026-10-10], 4)

    {:ok, _} =
      Invoices.set_total(group.id, user.id, card, {2026, 11}, Decimal.new("7000"), @today)

    bill = fn attrs ->
      {:ok, b} = Bills.create_bill(group.id, attrs)
      b
    end

    rent = bill.(%{name: "Aluguel", amount: Decimal.new("1500"), due_day: 5, account_id: bb.id})
    {:ok, _} = Bills.pay(group.id, user.id, rent, {2026, 10}, rent.amount, ~D[2026-10-05])
    bill.(%{name: "Netflix", amount: Decimal.new("55.90"), due_day: 10, account_id: card.id})
    bill.(%{name: "Spotify", amount: Decimal.new("20"), due_day: 1, account_id: card.id})

    {:ok, _} = CyclePlan.set_partner_income(group.id, {2026, 11}, Decimal.new("2700"))
    {:ok, _} = CyclePlan.set_partner_income(group.id, {2026, 12}, Decimal.new("3000"))

    %{user: user, group: group, bb: bb, card: card, nubank: nubank}
  end

  test "current invoice: what can still go on the card until the closing" do
    ctx = setup_pedro()
    {:ok, plan} = CyclePlan.build(ctx.group.id, @today)
    c = plan.current

    assert plan.card.id == ctx.card.id
    assert c.status == "open"
    assert c.invoice_month == {2026, 11}
    assert c.last_purchase_date == ~D[2026-11-04]
    assert c.due_date == ~D[2026-11-16]
    assert c.window_end == Date.add(Salary.salary_date(ctx.group.id, {2026, 12}), -1)

    assert Decimal.equal?(c.balance, Decimal.new("1400"))
    assert [%{amount: salary}] = c.salaries
    assert Decimal.equal?(salary, Decimal.new("10607"))
    assert %{amount: partner, received: false} = c.partner
    assert Decimal.equal?(partner, Decimal.new("2700"))
    assert c.incomes == []

    assert Decimal.equal?(c.invoice.amount, Decimal.new("7000"))
    # Spotify (Nov 1) still goes on this invoice; Netflix (Nov 10) on the next one
    assert [%{label: "Spotify"}] = c.card_bills
    # Nubank invoices due Nov 5 and Dec 7 are paid before December's salary
    assert [%{date: ~D[2026-11-05]}, %{date: ~D[2026-12-07]}] = c.other_cards
    assert Decimal.equal?(sum(c.other_cards), Decimal.new("200"))
    # Rent of Nov 5 and Dec 5
    assert Decimal.equal?(sum(c.fixed_bills), Decimal.new("3000"))

    # 1400 + 10607 + 2700 − 7000 − 20 − 200 − 3000
    assert Decimal.equal?(c.result, Decimal.new("4487"))
    assert c.goal_start == @today
    assert c.days == 9
  end

  test "next invoice: free money of the Nov 5 – Dec 4 cycle" do
    ctx = setup_pedro()
    {:ok, plan} = CyclePlan.build(ctx.group.id, @today)
    n = plan.next

    assert n.status == "next"
    assert n.invoice_month == {2026, 12}
    assert n.purchase_start == ~D[2026-11-05]
    assert n.last_purchase_date == ~D[2026-12-04]
    assert n.due_date == ~D[2026-12-15]
    assert Decimal.equal?(n.partner.amount, Decimal.new("3000"))
    assert Decimal.equal?(sum(n.benefits), Decimal.new("800"))
    assert Decimal.equal?(sum(n.card_bills), Decimal.new("75.90"))
    assert Decimal.equal?(sum(n.installments), Decimal.new("200"))
    # Nubank invoice due Jan 5
    assert [%{date: ~D[2027-01-05]}] = n.other_cards
    assert Decimal.equal?(sum(n.other_cards), Decimal.new("100"))
    # Rent of Jan 5 (Dec 5 is paid by November's salary)
    assert [%{date: ~D[2027-01-05]}] = n.fixed_bills

    # 10607 + 3000 + 800 − 75.90 − 200 − 100 − 1500
    assert Decimal.equal?(n.result, Decimal.new("12531.10"))
    assert n.goal_start == ~D[2026-11-05]
    assert n.days == 30
  end

  test "between the closing and the payment the current invoice is the closed one" do
    ctx = setup_pedro()
    {:ok, plan} = CyclePlan.build(ctx.group.id, ~D[2026-11-08])

    assert plan.current.status == "closed"
    assert plan.current.invoice_month == {2026, 11}
    assert plan.current.days == nil
    assert plan.next.invoice_month == {2026, 12}
    # Purchases of the open invoice count in the daily goal from today
    assert plan.next.goal_start == ~D[2026-11-08]
    assert plan.next.days == 27
  end

  test "a received partner salary no longer counts as expected" do
    ctx = setup_pedro()
    bill = Repo.get_by!(Finance.RecurringBill, partner_income: true, once_month: ~D[2026-11-01])
    {:ok, _} = Bills.pay(ctx.group.id, ctx.user.id, bill, {2026, 11}, bill.amount, @today)

    {:ok, plan} = CyclePlan.build(ctx.group.id, @today)
    assert plan.current.partner.received
    # The income entry is in the balance now (+2700) and the expectation is gone (−2700)
    assert Decimal.equal?(plan.current.result, Decimal.new("4487"))
  end

  describe "set_partner_income" do
    test "repeats the name and day, takes over a typed 'Salário…' income and removes" do
      {_user, group} = user_with_group_fixture()

      {:ok, bb} =
        Finance.create_account(group.id, %{name: "BB", kind: "checking"}, @today)

      {:ok, dri} =
        Bills.create_bill(group.id, %{
          name: "Salário Dri",
          amount: Decimal.new("2500"),
          due_day: 20,
          direction: "income",
          account_id: bb.id,
          once_month: ~D[2026-11-01]
        })

      {:ok, adopted} = CyclePlan.set_partner_income(group.id, {2026, 11}, Decimal.new("2700"))
      assert adopted.id == dri.id
      assert adopted.partner_income

      {:ok, december} = CyclePlan.set_partner_income(group.id, {2026, 12}, Decimal.new("3100"))
      assert december.name == "Salário Dri"
      assert december.due_day == 20
      assert december.once_month == ~D[2026-12-01]

      assert {:ok, nil} = CyclePlan.set_partner_income(group.id, {2026, 12}, nil)
      assert CyclePlan.partner_income(group.id, {2026, 12}, @today) == nil
    end
  end

  describe "scheduled goal" do
    test "a goal starting at the next closing waits and replaces the active period then" do
      ctx = setup_pedro()

      {:ok, current} =
        MonthPlan.apply_goal(ctx.group.id, Decimal.new("300"), @today, ~D[2026-11-04])

      {:ok, scheduled} =
        MonthPlan.apply_goal(
          ctx.group.id,
          Decimal.new("400"),
          @today,
          ~D[2026-12-04],
          ~D[2026-11-05]
        )

      assert scheduled.status == "scheduled"
      assert {:ok, %{id: id}} = Periods.get_active_period(ctx.group.id, ~D[2026-11-04])
      assert id == current.id

      assert {:ok, %{id: id, status: "active"}} =
               Periods.get_active_period(ctx.group.id, ~D[2026-11-05])

      assert id == scheduled.id
      closed = Repo.get!(Period, current.id)
      assert closed.status == "closed"
      assert closed.end_date == ~D[2026-11-04]
    end

    test "scheduling again replaces the previous schedule" do
      ctx = setup_pedro()
      args = [ctx.group.id, Decimal.new("400"), @today, ~D[2026-12-04], ~D[2026-11-05]]
      {:ok, first} = apply(MonthPlan, :apply_goal, args)
      {:ok, _second} = apply(MonthPlan, :apply_goal, args)

      assert Repo.get!(Period, first.id).status == "abandoned"
    end
  end
end
