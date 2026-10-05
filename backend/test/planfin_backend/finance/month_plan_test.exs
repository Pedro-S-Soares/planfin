defmodule PlanfinBackend.Finance.MonthPlanTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Finance, Periods, Repo}
  alias PlanfinBackend.Finance.{Bills, Invoices, MonthPlan, Salary}
  alias PlanfinBackend.Periods.Period

  @today ~D[2026-10-04]

  defp sum(items), do: Enum.reduce(items, Decimal.new(0), &Decimal.add(&2, &1.amount))

  # Pedro's paper, October 4th.
  defp paper_setup do
    {user, group} = user_with_group_fixture()

    {:ok, bb} =
      Finance.create_account(
        group.id,
        %{name: "BB", kind: "checking", balance: Decimal.new("4433.67")},
        @today
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Crédito BB", kind: "credit_card", closing_day: 5, due_day: 15},
        @today
      )

    {:ok, _caju} =
      Finance.create_account(
        group.id,
        %{
          name: "Caju",
          kind: "benefit",
          balance: Decimal.new("818.57"),
          monthly_credit: Decimal.new("1150"),
          credit_day: 1
        },
        @today
      )

    {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("10607.00")})

    {:ok, _} =
      Invoices.set_total(group.id, user.id, card, {2026, 10}, Decimal.new("13108.27"), @today)

    bill = fn attrs ->
      {:ok, _} = Bills.create_bill(group.id, Map.merge(%{account_id: bb.id}, attrs))
    end

    # Boletos fixos até o salário de novembro
    bill.(%{name: "Fixas no boleto", amount: Decimal.new("3129.12"), due_day: 20})
    # Fixas no cartão (entram na conta do mês seguinte)
    bill.(%{
      name: "Fixas no cartão",
      amount: Decimal.new("4697.06"),
      due_day: 25,
      account_id: card.id
    })

    # Gastos avulsos no boleto deste mês
    for {name, amount} <- [
          {"Inscrição SUS-PA", "760"},
          {"Creche Tobias", "320"},
          {"Manutenção ar", "230"},
          {"Massagem Dri", "200"}
        ] do
      bill.(%{name: name, amount: Decimal.new(amount), due_day: 25, once_month: ~D[2026-10-01]})
    end

    # Entrada prevista: salário da Dri
    bill.(%{
      name: "Salário Dri",
      amount: Decimal.new("2700"),
      due_day: 30,
      direction: "income",
      once_month: ~D[2026-10-01]
    })

    %{user: user, group: group, bb: bb, card: card}
  end

  test "this month and next month match the paper" do
    ctx = paper_setup()
    {:ok, plan} = MonthPlan.build(ctx.group.id, @today)
    c = plan.current

    assert c.end_date == ~D[2026-11-12]
    assert Decimal.equal?(c.balance, Decimal.new("4433.67"))
    assert [%{date: ~D[2026-10-13]}] = c.salaries
    assert Decimal.equal?(sum(c.invoices), Decimal.new("13108.27"))
    assert Decimal.equal?(c.after_invoices, Decimal.new("4632.40"))
    assert Decimal.equal?(sum(c.fixed_bills), Decimal.new("3129.12"))
    assert Decimal.equal?(sum(c.one_off_bills), Decimal.new("1510"))
    assert Decimal.equal?(sum(c.incomes), Decimal.new("2700"))
    # 4433.67 + 10607 + 2700 − 13108.27 − 3129.12 − 1510 = −6.72 (≈ zero: no allowance)
    assert Decimal.equal?(c.leftover, Decimal.new("-6.72"))

    n = plan.next
    assert n.start_date == ~D[2026-11-13]
    assert n.end_date == ~D[2026-12-10]
    assert Decimal.equal?(sum(n.benefits), Decimal.new("818.57"))
    assert Decimal.equal?(sum(n.fixed_bills), Decimal.new("7826.18"))
    # 10607 + 818.57 − 7826.18
    assert Decimal.equal?(n.remaining, Decimal.new("3599.39"))
  end

  test "a one-off bill exists only in its month" do
    ctx = paper_setup()
    november = Bills.occurrences(ctx.group.id, {2026, 11}, @today)
    refute Enum.any?(november, &(&1.bill.name == "Creche Tobias"))

    assert Enum.any?(
             Bills.occurrences(ctx.group.id, {2026, 10}, @today),
             &(&1.bill.name == "Creche Tobias")
           )
  end

  test "receiving the expected income credits the account" do
    ctx = paper_setup()
    [dri] = Enum.filter(Bills.list_bills(ctx.group.id), &(&1.name == "Salário Dri"))

    {:ok, occ} =
      Bills.pay(ctx.group.id, ctx.user.id, dri, {2026, 10}, Decimal.new("2650"), ~D[2026-10-04])

    assert occ.status == "paid"
    assert Decimal.equal?(Finance.account_balance(ctx.bb, @today), Decimal.new("7083.67"))
    {:ok, plan} = MonthPlan.build(ctx.group.id, @today)
    assert plan.current.incomes == []
  end

  test "expected income can't go to a card" do
    ctx = paper_setup()

    assert {:error, :income_on_card} =
             Bills.create_bill(ctx.group.id, %{
               name: "X",
               amount: Decimal.new(1),
               due_day: 1,
               account_id: ctx.card.id,
               direction: "income"
             })
  end

  test "a registered salary is not counted twice" do
    ctx = paper_setup()
    {:ok, _} = Salary.register(ctx.group.id, ctx.user.id, Decimal.new("10607"), ~D[2026-10-13])
    {:ok, plan} = MonthPlan.build(ctx.group.id, ~D[2026-10-14])
    assert plan.current.salaries == []
    assert Decimal.equal?(plan.current.balance, Decimal.new("15040.67"))
  end

  test "applying a daily goal starts a period from today to the eve of next month's salary" do
    ctx = paper_setup()

    {:ok, old} =
      Periods.create_period(
        ctx.group.id,
        %{
          start_date: ~D[2026-09-12],
          end_date: ~D[2026-10-12],
          daily_limit: Decimal.new("50"),
          total_budget: Decimal.new("2000")
        },
        @today
      )

    {:ok, period} = MonthPlan.apply_goal(ctx.group.id, Decimal.new("100"), @today)
    assert period.start_date == @today
    assert period.end_date == ~D[2026-11-12]
    assert Decimal.equal?(period.daily_limit, Decimal.new("100"))
    assert Decimal.equal?(period.total_budget, Decimal.new("4000"))
    assert %Period{status: "closed", end_date: ~D[2026-10-03]} = Repo.get!(Period, old.id)
  end

  test "no plan without salary" do
    {_user, group} = user_with_group_fixture()
    assert {:error, :salary_not_configured} = MonthPlan.build(group.id, @today)
  end
end
