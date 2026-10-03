defmodule PlanfinBackend.Finance.BillsPanelTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods, Repo}
  alias PlanfinBackend.Finance.{Bills, Panel, RecurringBill}

  @today ~D[2026-10-03]

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, _period} =
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
        %{name: "Conta", kind: "checking", balance: Decimal.new("3000.00")},
        ~D[2026-10-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    %{user: user, group: group, checking: checking, card: card}
  end

  # Bills created "in the past" so earlier months have occurrences.
  defp bill(ctx, attrs, created \\ ~N[2026-08-01 00:00:00]) do
    {:ok, bill} =
      Bills.create_bill(
        ctx.group.id,
        Map.merge(
          %{
            name: "Aluguel",
            amount: Decimal.new("1200.00"),
            due_day: 10,
            account_id: ctx.checking.id
          },
          attrs
        )
      )

    bill
    |> Ecto.Changeset.change(inserted_at: created)
    |> Repo.update!()
    |> Repo.preload([:account, subcategory: :category], force: true)
  end

  test "occurrences are pending, overdue or paid" do
    ctx = setup_group()
    rent = bill(ctx, %{})
    power = bill(ctx, %{name: "Luz", amount: Decimal.new("180.00"), due_day: 2})

    occ = Bills.occurrences(ctx.group.id, {2026, 10}, @today)

    assert Enum.map(occ, &{&1.bill.name, &1.status}) == [
             {"Luz", "overdue"},
             {"Aluguel", "pending"}
           ]

    {:ok, paid} =
      Bills.pay(ctx.group.id, ctx.user.id, power, {2026, 10}, Decimal.new("201.37"), @today)

    assert paid.status == "paid"
    assert Decimal.equal?(paid.amount, Decimal.new("201.37"))

    entry = Repo.get!(PlanfinBackend.Expenses.Expense, paid.expense_id)
    refute entry.counts_in_budget
    assert entry.account_id == ctx.checking.id

    assert {:error, _} =
             Bills.pay(ctx.group.id, ctx.user.id, power, {2026, 10}, Decimal.new("1"), @today)

    :ok = Bills.unpay(ctx.group.id, power, {2026, 10})
    assert Repo.get(PlanfinBackend.Expenses.Expense, paid.expense_id) == nil

    assert Enum.find(
             Bills.occurrences(ctx.group.id, {2026, 10}, @today),
             &(&1.bill.id == power.id)
           ).status == "overdue"

    assert rent.due_day == 10
  end

  test "due day is clamped to the end of the month" do
    ctx = setup_group()
    b = bill(ctx, %{due_day: 31})
    assert Bills.due_date(b, {2026, 11}) == ~D[2026-11-30]
  end

  test "bills only exist from the month they were created" do
    ctx = setup_group()

    {:ok, fresh} =
      Bills.create_bill(ctx.group.id, %{
        name: "Novo",
        amount: Decimal.new("10"),
        due_day: 1,
        account_id: ctx.checking.id
      })

    fresh = Repo.preload(fresh, :account)
    month = {fresh.inserted_at.year, fresh.inserted_at.month}
    previous = PlanfinBackend.Finance.Calendar.add_months(month, -1)
    refute Enum.any?(Bills.occurrences(ctx.group.id, previous, @today), &(&1.bill.id == fresh.id))
    assert %RecurringBill{} = fresh
  end

  test "an unpaid bill from last month stays committed" do
    ctx = setup_group()
    bill(ctx, %{})
    panel = Panel.build(ctx.group.id, @today, ~D[2026-10-12])

    assert Enum.map(panel.commitments, &{&1.label, &1.status}) == [
             {"Aluguel", "overdue"},
             {"Aluguel", "pending"}
           ]
  end

  describe "panel" do
    test "available minus invoices and bills due until the horizon" do
      ctx = setup_group()
      bill(ctx, %{}, ~N[2026-10-01 00:00:00])
      # card bill: never a commitment of the account (it lands on the invoice)
      bill(
        ctx,
        %{name: "Streaming", amount: Decimal.new("40.00"), account_id: ctx.card.id},
        ~N[2026-10-01 00:00:00]
      )

      # September invoice purchase (closes 2026-10-05, due 2026-10-15)
      {:ok, _} =
        Expenses.create_expense(ctx.group.id, ctx.user.id, %{
          amount: Decimal.new("900.00"),
          date: ~D[2026-09-20],
          account_id: ctx.card.id,
          counts_in_budget: false
        })

      # Horizon before the due date: only the rent (due 10th) is committed
      panel = Panel.build(ctx.group.id, @today, ~D[2026-10-12])
      assert Decimal.equal?(panel.available, Decimal.new("3000.00"))
      assert Enum.map(panel.commitments, & &1.label) == ["Aluguel"]
      assert Decimal.equal?(panel.free, Decimal.new("1800.00"))

      # Horizon after the due date: invoice joins
      panel = Panel.build(ctx.group.id, @today, ~D[2026-11-12])
      labels = Enum.map(panel.commitments, & &1.label)
      assert "Fatura Cartão" in labels
      assert Decimal.equal?(panel.committed, Decimal.new("3300.00"))
      assert Decimal.equal?(panel.free, Decimal.new("-300.00"))
    end

    test "no accounts" do
      {_user, group} = user_with_group_fixture()
      panel = Panel.build(group.id, @today, ~D[2026-10-12])
      refute panel.has_accounts
      assert panel.available == nil
    end

    test "default horizon is the end of the active period" do
      ctx = setup_group()
      assert Panel.default_horizon(ctx.group.id, @today) == ~D[2026-10-12]
    end
  end
end
