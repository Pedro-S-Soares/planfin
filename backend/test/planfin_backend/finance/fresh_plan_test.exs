defmodule PlanfinBackend.Finance.FreshPlanTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods, Repo}
  alias PlanfinBackend.Finance.{Bills, FreshPlan, Invoices, Salary}
  alias PlanfinBackend.Periods.Period

  @today ~D[2026-10-04]

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "BB", kind: "checking", balance: Decimal.new("800.00")},
        @today
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Nubank", kind: "credit_card", closing_day: 5, due_day: 15},
        @today
      )

    {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("6000.00")})
    %{user: user, group: group, checking: checking, card: card}
  end

  describe "set_total" do
    test "the difference becomes one adjustment, replaced on the next adjustment" do
      ctx = setup_group()

      {:ok, _} =
        Expenses.create_expense(ctx.group.id, ctx.user.id, %{
          amount: Decimal.new("300.00"),
          date: ~D[2026-09-20],
          account_id: ctx.card.id,
          counts_in_budget: false
        })

      {:ok, inv} =
        Invoices.set_total(
          ctx.group.id,
          ctx.user.id,
          ctx.card,
          {2026, 10},
          Decimal.new("4200.00"),
          @today
        )

      assert Decimal.equal?(inv.total, Decimal.new("4200.00"))
      assert Enum.count(inv.entries, &(&1.source == "invoice_adjustment")) == 1

      {:ok, inv} =
        Invoices.set_total(
          ctx.group.id,
          ctx.user.id,
          ctx.card,
          {2026, 10},
          Decimal.new("250.00"),
          @today
        )

      assert Decimal.equal?(inv.total, Decimal.new("250.00"))
      [adj] = Enum.filter(inv.entries, &(&1.source == "invoice_adjustment"))
      assert adj.type == "income"
      assert Decimal.equal?(adj.amount, Decimal.new("50.00"))
      refute adj.counts_in_budget
      assert adj.date == @today
    end
  end

  describe "plan" do
    test "balance + next salary − card − bills = variable money until the end of the next cycle" do
      ctx = setup_group()

      # October invoice (due Oct 15) set to the bank's value
      {:ok, _} =
        Invoices.set_total(
          ctx.group.id,
          ctx.user.id,
          ctx.card,
          {2026, 10},
          Decimal.new("4200.00"),
          @today
        )

      {:ok, _} =
        Bills.create_bill(ctx.group.id, %{
          name: "Condomínio",
          amount: Decimal.new("700"),
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

      plan = FreshPlan.build(ctx.group.id, @today)
      # Salary of Sep 12 not registered → plan includes the Oct 13 salary up to Nov 12
      assert plan.salary.date == ~D[2026-10-13]
      assert plan.end_date == ~D[2026-11-12]
      assert plan.days == 40
      assert Decimal.equal?(plan.balance, Decimal.new("800.00"))
      assert [%{amount: card}] = plan.cards
      assert Decimal.equal?(card, Decimal.new("4200.00"))
      # Condomínio Oct 10 and Nov 10
      assert Decimal.equal?(
               Enum.reduce(plan.account_bills, Decimal.new(0), &Decimal.add(&2, &1.amount)),
               Decimal.new("1400")
             )

      # Netflix Oct 20 (Nov 20 is after the end)
      assert [%{amount: netflix}] = plan.card_bills
      assert Decimal.equal?(netflix, Decimal.new("55.90"))
      assert Decimal.equal?(plan.variable, Decimal.new("1144.10"))
    end

    test "start closes the active period yesterday and creates one from today" do
      ctx = setup_group()

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

      {:ok, period} = FreshPlan.start(ctx.group.id, Decimal.new("200.00"), @today)
      assert period.start_date == @today
      assert period.end_date == ~D[2026-11-12]
      # (800 + 6000 − 200) / 40 = 165.00
      assert Decimal.equal?(period.daily_limit, Decimal.new("165.00"))
      assert Decimal.equal?(period.total_budget, Decimal.new("6800.00"))

      old = Repo.get!(Period, old.id)
      assert old.status == "closed"
      assert old.end_date == ~D[2026-10-03]
      assert {:ok, %{id: id}} = Periods.get_active_period(ctx.group.id)
      assert id == period.id
    end

    test "refuses a plan with nothing left after the gordura" do
      ctx = setup_group()
      assert {:error, :insufficient} = FreshPlan.start(ctx.group.id, Decimal.new("7000"), @today)
    end
  end
end
