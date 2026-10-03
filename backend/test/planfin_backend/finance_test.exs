defmodule PlanfinBackend.FinanceTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods}
  alias PlanfinBackend.Finance.Invoices

  @today ~D[2026-10-03]

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, period} =
      Periods.create_period(
        group.id,
        %{
          start_date: ~D[2026-09-12],
          end_date: ~D[2026-10-12],
          daily_limit: Decimal.new("50.00"),
          total_budget: Decimal.new("2000.00")
        },
        @today
      )

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("1000.00")},
        ~D[2026-10-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    %{user: user, group: group, period: period, checking: checking, card: card}
  end

  defp entry(ctx, attrs) do
    {:ok, e} =
      Expenses.create_expense(
        ctx.group.id,
        ctx.user.id,
        Map.merge(%{amount: Decimal.new("10.00"), date: ~D[2026-10-02]}, attrs)
      )

    e
  end

  describe "accounts" do
    test "first checking account becomes primary" do
      ctx = setup_group()
      assert ctx.checking.is_primary
      refute ctx.card.is_primary
      assert Finance.get_primary_account(ctx.group.id).id == ctx.checking.id
    end

    test "card requires closing and due day" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} =
               Finance.create_account(group.id, %{name: "C", kind: "credit_card"})

      assert %{closing_day: _, due_day: _} = errors_on(changeset)
    end
  end

  describe "account_balance/2" do
    test "adds income, subtracts spending and transfers after reconciliation" do
      ctx = setup_group()
      entry(ctx, %{amount: Decimal.new("100.00"), account_id: ctx.checking.id})

      entry(ctx, %{
        amount: Decimal.new("40.00"),
        type: "income",
        account_id: ctx.checking.id,
        counts_in_budget: false
      })

      {:ok, _} =
        Finance.create_transfer(ctx.group.id, ctx.user.id, %{
          from_account_id: ctx.checking.id,
          to_account_id: ctx.card.id,
          amount: Decimal.new("300.00"),
          date: ~D[2026-10-02],
          kind: "card_payment",
          invoice_month: ~D[2026-10-01]
        })

      assert Decimal.equal?(Finance.account_balance(ctx.checking, @today), Decimal.new("640.00"))
    end

    test "ignores movements before the reconciliation and in the future" do
      ctx = setup_group()
      # Dated before balance_date: already inside the reconciled balance
      entry(ctx, %{
        amount: Decimal.new("70.00"),
        date: ~D[2026-09-20],
        account_id: ctx.checking.id
      })

      # Future-dated: not happened yet
      entry(ctx, %{
        amount: Decimal.new("30.00"),
        date: ~D[2026-11-20],
        account_id: ctx.checking.id,
        counts_in_budget: false
      })

      assert Decimal.equal?(Finance.account_balance(ctx.checking, @today), Decimal.new("1000.00"))
    end

    test "set_balance reconciles without touching history" do
      ctx = setup_group()
      entry(ctx, %{amount: Decimal.new("100.00"), account_id: ctx.checking.id})
      {:ok, checking} = Finance.set_balance(ctx.checking, Decimal.new("850.00"), @today)
      assert Decimal.equal?(Finance.account_balance(checking, @today), Decimal.new("850.00"))
    end
  end

  describe "invoices" do
    test "purchase on the closing day goes to the next invoice" do
      ctx = setup_group()
      assert Invoices.month_for(ctx.card, ~D[2026-10-04]) == {2026, 10}
      assert Invoices.month_for(ctx.card, ~D[2026-10-05]) == {2026, 11}
    end

    test "due date moves to the next bank business day" do
      ctx = setup_group()
      assert Invoices.due_date(ctx.card, {2026, 10}) == ~D[2026-10-15]
      # 2026-11-15 is a Sunday and a holiday
      assert Invoices.due_date(ctx.card, {2026, 11}) == ~D[2026-11-16]
    end

    test "totals purchases minus refunds and tracks payments" do
      ctx = setup_group()
      entry(ctx, %{amount: Decimal.new("200.00"), account_id: ctx.card.id})
      entry(ctx, %{amount: Decimal.new("50.00"), account_id: ctx.card.id, date: ~D[2026-09-20]})

      entry(ctx, %{
        amount: Decimal.new("20.00"),
        type: "income",
        account_id: ctx.card.id,
        counts_in_budget: false
      })

      open = Invoices.build(ctx.card, {2026, 10}, @today)
      assert Decimal.equal?(open.total, Decimal.new("230.00"))
      assert open.status == "open"

      later = ~D[2026-10-10]
      assert Invoices.build(ctx.card, {2026, 10}, later).status == "closed"

      {:ok, _} =
        Finance.create_transfer(ctx.group.id, ctx.user.id, %{
          from_account_id: ctx.checking.id,
          to_account_id: ctx.card.id,
          amount: Decimal.new("100.00"),
          date: later,
          kind: "card_payment",
          invoice_month: ~D[2026-10-01]
        })

      partial = Invoices.build(ctx.card, {2026, 10}, later)
      assert partial.status == "partial"
      assert Decimal.equal?(partial.remaining, Decimal.new("130.00"))
      assert Invoices.build(ctx.card, {2026, 10}, ~D[2026-10-16]).status == "overdue"
    end
  end

  describe "installments" do
    test "only the first parcel counts in the budget; the rest land on later invoices" do
      ctx = setup_group()

      first =
        entry(ctx, %{amount: Decimal.new("100.00"), account_id: ctx.card.id, installments: 3})

      assert first.installment_number == 1
      assert first.installment_count == 3
      assert first.counts_in_budget
      assert Decimal.equal?(first.amount, Decimal.new("33.34"))

      parcels =
        PlanfinBackend.Repo.all(
          from e in PlanfinBackend.Expenses.Expense,
            where: e.installment_group_id == ^first.installment_group_id,
            order_by: e.installment_number
        )

      assert Enum.map(parcels, & &1.date) == [~D[2026-10-02], ~D[2026-11-02], ~D[2026-12-02]]
      assert Enum.map(parcels, & &1.counts_in_budget) == [true, false, false]
      assert Enum.all?(tl(parcels), &is_nil(&1.period_id))

      invoices = Invoices.list(ctx.card, @today, 0, 6)
      assert Enum.map(invoices, & &1.month) == [{2026, 10}, {2026, 11}, {2026, 12}]

      # Daily spending sees only the first parcel
      assert Decimal.equal?(
               PlanfinBackend.BudgetDays.get_total_spent_for_day(ctx.group.id, ~D[2026-10-02]),
               Decimal.new("33.34")
             )
    end

    test "installments require a card" do
      ctx = setup_group()

      assert {:error, :installments_require_card} =
               Expenses.create_expense(ctx.group.id, ctx.user.id, %{
                 amount: Decimal.new("90.00"),
                 date: ~D[2026-10-02],
                 account_id: ctx.checking.id,
                 installments: 3
               })
    end

    test "deleting one parcel deletes the whole purchase" do
      ctx = setup_group()

      first =
        entry(ctx, %{amount: Decimal.new("90.00"), account_id: ctx.card.id, installments: 3})

      {:ok, _} = Expenses.delete_expense(ctx.group.id, first.id)

      assert PlanfinBackend.Repo.aggregate(
               from(e in PlanfinBackend.Expenses.Expense,
                 where: e.installment_group_id == ^first.installment_group_id
               ),
               :count
             ) == 0
    end
  end

  describe "entries outside the budget" do
    test "do not need an active period and never touch budget numbers" do
      ctx = setup_group()

      entry(ctx, %{
        amount: Decimal.new("5000.00"),
        type: "income",
        date: ~D[2026-10-02],
        account_id: ctx.checking.id,
        counts_in_budget: false
      })

      {:ok, period} = Periods.get_period(ctx.group.id, ctx.period.id)

      assert Decimal.equal?(
               PlanfinBackend.BudgetDays.compute_remaining_total(period),
               period.total_budget
             )

      # Outside any period
      assert {:ok, _} =
               Expenses.create_expense(ctx.group.id, ctx.user.id, %{
                 amount: Decimal.new("10.00"),
                 date: ~D[2027-03-01],
                 counts_in_budget: false
               })
    end

    test "allowance and reserve accounts are always outside the budget" do
      ctx = setup_group()
      {:ok, reserve} = Finance.create_account(ctx.group.id, %{name: "Reserva", kind: "reserve"})
      e = entry(ctx, %{amount: Decimal.new("800.00"), type: "income", account_id: reserve.id})
      refute e.counts_in_budget
    end
  end

  test "assign_unassigned_to_account moves logged purchases to the card" do
    ctx = setup_group()
    old = entry(ctx, %{date: ~D[2026-09-15]})
    recent = entry(ctx, %{date: ~D[2026-10-01]})

    assert {:ok, 1} =
             Expenses.assign_unassigned_to_account(ctx.group.id, ctx.card.id, ~D[2026-09-20])

    assert PlanfinBackend.Repo.reload(recent).account_id == ctx.card.id
    assert is_nil(PlanfinBackend.Repo.reload(old).account_id)
  end
end
