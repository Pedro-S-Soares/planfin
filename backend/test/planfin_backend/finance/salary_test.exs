defmodule PlanfinBackend.Finance.SalaryTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods, Repo}
  alias PlanfinBackend.Finance.{Bills, Salary}

  defp setup_group(opts \\ []) do
    {user, group} = user_with_group_fixture()

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("500.00")},
        ~D[2026-10-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    if Keyword.get(opts, :salary, true) do
      {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("6000.00")})
    end

    %{user: user, group: group, checking: checking, card: card}
  end

  test "cycle runs from the 10th labor business day to the eve of the next" do
    ctx = setup_group()

    assert %{
             start_date: ~D[2026-09-12],
             end_date: ~D[2026-10-12],
             next_salary_date: ~D[2026-10-13]
           } =
             Salary.cycle(ctx.group.id, ~D[2026-10-03])

    assert %{start_date: ~D[2026-10-13], end_date: ~D[2026-11-12]} =
             Salary.cycle(ctx.group.id, ~D[2026-10-13])

    assert Salary.horizon(ctx.group.id, ~D[2026-10-03]) == ~D[2026-10-12]
  end

  test "manual salary date overrides the computed one" do
    ctx = setup_group()
    {:ok, _} = Salary.set_salary_date(ctx.group.id, {2026, 10}, ~D[2026-10-09])
    assert Salary.cycle(ctx.group.id, ~D[2026-10-09]).start_date == ~D[2026-10-09]
    :ok = Salary.clear_salary_date(ctx.group.id, {2026, 10})
    assert Salary.cycle(ctx.group.id, ~D[2026-10-09]).start_date == ~D[2026-09-12]
  end

  test "registering the salary credits the account outside the budget" do
    ctx = setup_group()
    assert Salary.panel_info(ctx.group.id, ~D[2026-10-14]).pending

    {:ok, entry} =
      Salary.register(ctx.group.id, ctx.user.id, Decimal.new("6000.00"), ~D[2026-10-12])

    refute entry.counts_in_budget
    assert entry.account_id == ctx.checking.id

    # Deposited the day before still counts for the new cycle
    refute Salary.panel_info(ctx.group.id, ~D[2026-10-14]).pending

    assert Decimal.equal?(
             Finance.account_balance(ctx.checking, ~D[2026-10-14]),
             Decimal.new("6500.00")
           )
  end

  test "no salary configured: no proposal and the period end is the horizon" do
    ctx = setup_group(salary: false)
    assert Salary.proposal(ctx.group.id, ~D[2026-10-03]) == nil
    refute Salary.panel_info(ctx.group.id, ~D[2026-10-03]).configured
    assert Salary.horizon(ctx.group.id, ~D[2026-10-03]) == ~D[2026-11-02]
  end

  test "proposal subtracts bills and the installments of the invoice it pays into" do
    ctx = setup_group()

    {:ok, _} =
      Bills.create_bill(ctx.group.id, %{
        name: "Aluguel",
        amount: Decimal.new("1500.00"),
        due_day: 10,
        account_id: ctx.checking.id
      })

    {:ok, _} =
      Bills.create_bill(ctx.group.id, %{
        name: "Netflix",
        amount: Decimal.new("55.90"),
        due_day: 20,
        account_id: ctx.card.id
      })

    {:ok, _period} =
      Periods.create_period(
        ctx.group.id,
        %{
          start_date: ~D[2026-09-12],
          end_date: ~D[2026-10-12],
          daily_limit: Decimal.new("50"),
          total_budget: Decimal.new("2000")
        },
        ~D[2026-10-03]
      )

    # 3x of 300 bought on 2026-10-01 (invoice Oct): parcels land on Nov and Dec invoices
    {:ok, _} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("900.00"),
        date: ~D[2026-10-01],
        account_id: ctx.card.id,
        installments: 3
      })

    # Active period covers the current cycle → proposal is for the next one
    p = Salary.proposal(ctx.group.id, ~D[2026-10-03])
    assert p.start_date == ~D[2026-10-13]
    assert p.end_date == ~D[2026-11-12]
    assert p.days == 31
    assert Decimal.equal?(p.account_bills, Decimal.new("1500.00"))
    assert Decimal.equal?(p.card_bills, Decimal.new("55.90"))
    # Cycle Oct 13 – Nov 12 spends into the invoice due in the next cycle (Dec 15)
    assert Decimal.equal?(p.installments, Decimal.new("300.00"))
    assert Decimal.equal?(p.available, Decimal.new("4144.10"))
    assert Repo.aggregate(PlanfinBackend.Expenses.Expense, :count) == 3
  end
end
