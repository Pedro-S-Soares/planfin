defmodule PlanfinBackend.Finance.QuotaTest do
  @moduledoc """
  Spending quotas by invoice: purchases choose their quota, a card quota's month
  is its invoice, the excess reaches the daily budget.
  """
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{BudgetDays, Categories, Expenses, Finance, Periods, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Bills, MonthPlan, Panel, Quotas, Salary}

  # Card closes on the 5th: purchases from 05/10 to 04/11 are the Nov invoice.
  @today ~D[2026-10-15]

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("5000")},
        ~D[2026-10-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("10000")})

    {:ok, category} =
      Categories.create_category(group.id, %{name: "Carro", type: "expense", icon: "car"})

    {:ok, wash} = Categories.create_subcategory(category, %{name: "Lavagem"})
    {:ok, fuel} = Categories.create_subcategory(category, %{name: "Combustível"})

    {:ok, period} =
      Periods.create_period(
        group.id,
        %{
          name: "Outubro",
          start_date: ~D[2026-10-13],
          end_date: ~D[2026-11-12],
          daily_limit: Decimal.new("100"),
          total_budget: Decimal.new("3100")
        },
        ~D[2026-10-13]
      )

    %{
      user: user,
      group: group,
      checking: checking,
      card: card,
      wash: wash,
      fuel: fuel,
      period: period
    }
  end

  defp quota(ctx, account_id, attrs \\ %{}) do
    {:ok, bill} =
      Bills.create_bill(
        ctx.group.id,
        Map.merge(
          %{
            name: "Lavagem do carro",
            amount: Decimal.new("150"),
            due_day: 1,
            account_id: account_id,
            kind: "quota"
          },
          attrs
        )
      )

    bill
    |> Ecto.Changeset.change(inserted_at: ~N[2026-09-01 00:00:00])
    |> Repo.update!()
    |> Repo.preload([:account, subcategory: :category], force: true)
  end

  defp spend(ctx, amount, date, attrs \\ %{}) do
    {:ok, e} =
      Expenses.create_expense(
        ctx.group.id,
        ctx.user.id,
        Map.merge(
          %{
            amount: Decimal.new(amount),
            date: date,
            account_id: ctx.card.id,
            subcategory_id: ctx.wash.id
          },
          attrs
        )
      )

    e
  end

  defp occurrence(ctx, bill, month, today \\ @today) do
    ctx.group.id |> Bills.occurrences(month, today) |> Enum.find(&(&1.bill.id == bill.id))
  end

  test "a quota is an expense and needs no category" do
    ctx = setup_group()

    assert {:ok, _} =
             Bills.create_bill(ctx.group.id, %{
               name: "Cota",
               amount: Decimal.new("100"),
               due_day: 1,
               account_id: ctx.card.id,
               kind: "quota"
             })

    assert {:error, cs} =
             Bills.create_bill(ctx.group.id, %{
               name: "Cota",
               amount: Decimal.new("100"),
               due_day: 1,
               account_id: ctx.checking.id,
               kind: "quota",
               direction: "income"
             })

    assert Keyword.has_key?(cs.errors, :direction)
  end

  test "only the purchases linked to the quota use it, whatever their category" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    linked = spend(ctx, "30", ~D[2026-10-14], %{quota_id: bill.id})

    other_category =
      spend(ctx, "30", ~D[2026-10-15], %{quota_id: bill.id, subcategory_id: ctx.fuel.id})

    same_category_not_linked = spend(ctx, "40", ~D[2026-10-15])

    refute linked.counts_in_budget
    refute other_category.counts_in_budget
    assert same_category_not_linked.counts_in_budget

    # Purchases of 14/10 and 15/10 are on the November invoice.
    occ = occurrence(ctx, bill, {2026, 11})
    assert occ.status == "pending"
    assert Decimal.equal?(occ.quota_spent, Decimal.new("60"))
    assert Decimal.equal?(occ.amount, Decimal.new("90"))
    assert Decimal.equal?(occurrence(ctx, bill, {2026, 10}).quota_spent, Decimal.new("0"))
  end

  test "a card quota belongs to its invoice: the closing day starts the next one" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    spend(ctx, "30", ~D[2026-11-04], %{quota_id: bill.id})
    spend(ctx, "50", ~D[2026-11-05], %{quota_id: bill.id})

    assert Decimal.equal?(Quotas.spent(bill, {2026, 11}), Decimal.new("30"))
    assert Decimal.equal?(Quotas.spent(bill, {2026, 12}), Decimal.new("50"))
    assert Quotas.window(bill, {2026, 12}) == {~D[2026-11-05], ~D[2026-12-04]}
  end

  test "a one-off quota is open only for its invoice" do
    ctx = setup_group()
    recurring = quota(ctx, ctx.card.id)
    one_off = quota(ctx, ctx.card.id, %{name: "Presentes de Natal", once_month: ~D[2026-12-01]})

    # 15/10 is the November invoice; 20/11 the December one.
    assert ctx.group.id |> Quotas.open_for(~D[2026-10-15]) |> Enum.map(& &1.id) == [recurring.id]

    assert ctx.group.id |> Quotas.open_for(~D[2026-11-20]) |> Enum.map(& &1.id) |> Enum.sort() ==
             Enum.sort([recurring.id, one_off.id])
  end

  test "what goes beyond the quota comes out of the daily budget on the day it was spent" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    spend(ctx, "100", ~D[2026-10-14], %{quota_id: bill.id})
    spend(ctx, "30", ~D[2026-10-14], %{quota_id: bill.id})
    # Crosses the limit: 20 fit, 25 are excess.
    spend(ctx, "45", ~D[2026-10-15], %{quota_id: bill.id})
    # Whole purchase beyond the quota.
    spend(ctx, "30", ~D[2026-10-16], %{quota_id: bill.id})

    assert Decimal.equal?(
             BudgetDays.get_total_spent_for_day(ctx.group.id, ~D[2026-10-14]),
             Decimal.new("0")
           )

    assert Decimal.equal?(
             BudgetDays.get_total_spent_for_day(ctx.group.id, ~D[2026-10-15]),
             Decimal.new("25")
           )

    assert Decimal.equal?(
             BudgetDays.get_total_spent_for_day(ctx.group.id, ~D[2026-10-16]),
             Decimal.new("30")
           )

    # 4 days of 100 (13 to 16/10) minus the 55 of excess.
    assert Decimal.equal?(
             BudgetDays.compute_today_balance(ctx.period, ~D[2026-10-16]),
             Decimal.new("345")
           )

    occ = occurrence(ctx, bill, {2026, 11}, ~D[2026-10-16])
    assert occ.status == "paid"
    assert Decimal.equal?(occ.quota_spent, Decimal.new("205"))
  end

  test "a quota is never charged nor paid, and its invoice closing ends it" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    :ok = Bills.charge_due_card_bills(ctx.group.id, @today)
    assert Repo.aggregate(from(e in Expense, where: e.account_id == ^ctx.card.id), :count) == 0

    assert {:error, :quota_not_payable} =
             Bills.pay(ctx.group.id, ctx.user.id, bill, {2026, 11}, Decimal.new("150"), @today)

    spend(ctx, "60", ~D[2026-10-14], %{quota_id: bill.id})
    assert occurrence(ctx, bill, {2026, 11}, ~D[2026-11-04]).status == "pending"
    occ = occurrence(ctx, bill, {2026, 11}, ~D[2026-11-05])
    assert occ.status == "paid"
    assert Decimal.equal?(occ.amount, Decimal.new("60"))
  end

  test "a quota on the account commits only what is left; the next month plans it whole" do
    ctx = setup_group()
    bill = quota(ctx, ctx.checking.id, %{amount: Decimal.new("350")})

    {:ok, _} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("150"),
        date: ~D[2026-11-03],
        account_id: ctx.checking.id,
        quota_id: bill.id
      })

    panel = Panel.build(ctx.group.id, ~D[2026-11-03], ~D[2026-11-12])
    nov = Enum.find(panel.commitments, &(&1.bill_id == bill.id and &1.month == {2026, 11}))
    assert Decimal.equal?(nov.amount, Decimal.new("200"))

    {:ok, plan} = MonthPlan.build(ctx.group.id, @today)
    assert [%{label: "Lavagem do carro", amount: amount}] = plan.next.fixed_bills
    assert Decimal.equal?(amount, Decimal.new("350"))
  end

  test "linking a purchase takes it out of the daily budget; unlinking brings it back" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    wash = spend(ctx, "80", ~D[2026-10-15])
    assert wash.counts_in_budget

    {:ok, linked} = Expenses.update_expense(ctx.group.id, wash.id, %{quota_id: bill.id})
    refute linked.counts_in_budget
    assert linked.budget_day_id == nil
    assert linked.quota_id == bill.id

    {:ok, unlinked} = Expenses.update_expense(ctx.group.id, wash.id, %{quota_id: nil})
    assert unlinked.counts_in_budget
    assert unlinked.budget_day_id != nil
    assert unlinked.quota_id == nil
  end

  test "a quota of another group or an income can't be linked" do
    ctx = setup_group()
    other = setup_group()
    foreign = quota(other, other.card.id)

    assert {:error, :quota_not_found} =
             Expenses.create_expense(ctx.group.id, ctx.user.id, %{
               amount: Decimal.new("10"),
               date: ~D[2026-10-15],
               account_id: ctx.card.id,
               quota_id: foreign.id
             })

    bill = quota(ctx, ctx.card.id)

    {:ok, refund} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("10"),
        date: ~D[2026-10-15],
        account_id: ctx.card.id,
        type: "income",
        quota_id: bill.id
      })

    assert refund.quota_id == nil
  end

  test "a card quota created after a closing starts in the next invoice" do
    ctx = setup_group()

    {:ok, bill} =
      Bills.create_bill(ctx.group.id, %{
        name: "Lavagem",
        amount: Decimal.new("150"),
        due_day: 1,
        account_id: ctx.card.id,
        kind: "quota"
      })

    # Created on Nov 7, after the Nov 5 closing: the December invoice is the first one.
    bill =
      bill
      |> Ecto.Changeset.change(inserted_at: ~N[2026-11-07 10:00:00])
      |> Repo.update!()
      |> Repo.preload(:account, force: true)

    refute Bills.exists_in?(bill, {2026, 11})
    assert Bills.exists_in?(bill, {2026, 12})
  end
end
