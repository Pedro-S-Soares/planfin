defmodule PlanfinBackend.Finance.CardBillChargeTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Finance, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Bills, Invoices}

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("100")},
        ~D[2026-09-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Nubank", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-09-01]
      )

    %{user: user, group: group, checking: checking, card: card}
  end

  defp bill(ctx, attrs, created \\ ~N[2026-09-01 00:00:00]) do
    {:ok, bill} = Bills.create_bill(ctx.group.id, attrs)

    bill
    |> Ecto.Changeset.change(inserted_at: created)
    |> Repo.update!()
    |> Repo.preload([:account, subcategory: :category], force: true)
  end

  defp charges(card),
    do: Repo.all(from(e in Expense, where: e.account_id == ^card.id, order_by: e.date))

  test "charges the card on the due date, once, on the invoice of that date" do
    ctx = setup_group()

    bill(ctx, %{
      name: "Netflix",
      amount: Decimal.new("55.90"),
      due_day: 20,
      account_id: ctx.card.id
    })

    # Before the day: nothing for October yet (September 20 was charged)
    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-19])
    assert Enum.map(charges(ctx.card), & &1.date) == [~D[2026-09-20]]

    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-20])
    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-21])
    [_sep, oct] = charges(ctx.card)
    assert oct.date == ~D[2026-10-20]
    refute oct.counts_in_budget
    assert oct.source == "bill"
    assert oct.created_by_id == ctx.user.id

    # Oct 20 is after the Oct 5 closing: lands on the November invoice
    nov = Invoices.build(ctx.card, {2026, 11}, ~D[2026-10-21])
    assert Decimal.equal?(nov.total, Decimal.new("55.90"))

    occ =
      Enum.find(
        Bills.occurrences(ctx.group.id, {2026, 10}, ~D[2026-10-21]),
        &(&1.bill.name == "Netflix")
      )

    assert occ.status == "paid"
  end

  test "removing a charge skips the month for good; paying again restores it" do
    ctx = setup_group()

    b =
      bill(
        ctx,
        %{name: "Spotify", amount: Decimal.new("21.90"), due_day: 1, account_id: ctx.card.id},
        ~N[2026-10-01 00:00:00]
      )

    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-02])
    assert length(charges(ctx.card)) == 1

    :ok = Bills.unpay(ctx.group.id, b, {2026, 10})
    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-03])
    assert charges(ctx.card) == []
    assert hd(Bills.occurrences(ctx.group.id, {2026, 10}, ~D[2026-10-03])).status == "skipped"

    {:ok, occ} =
      Bills.pay(ctx.group.id, ctx.user.id, b, {2026, 10}, Decimal.new("21.90"), ~D[2026-10-03])

    assert occ.status == "paid"

    assert {:error, :already_paid} =
             Bills.pay(ctx.group.id, ctx.user.id, b, {2026, 10}, Decimal.new("1"), ~D[2026-10-03])
  end

  test "deleting the charge from the history also skips the month" do
    ctx = setup_group()

    bill(
      ctx,
      %{name: "Spotify", amount: Decimal.new("21.90"), due_day: 1, account_id: ctx.card.id},
      ~N[2026-10-01 00:00:00]
    )

    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-02])
    [charge] = charges(ctx.card)
    {:ok, _} = PlanfinBackend.Expenses.delete_expense(ctx.group.id, charge.id)
    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-03])
    assert charges(ctx.card) == []
  end

  test "bills paid from the account stay manual; undo returns them to pending" do
    ctx = setup_group()

    rent =
      bill(
        ctx,
        %{name: "Aluguel", amount: Decimal.new("1500"), due_day: 2, account_id: ctx.checking.id},
        ~N[2026-10-01 00:00:00]
      )

    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-05])
    assert hd(Bills.occurrences(ctx.group.id, {2026, 10}, ~D[2026-10-05])).status == "overdue"

    {:ok, _} =
      Bills.pay(ctx.group.id, ctx.user.id, rent, {2026, 10}, Decimal.new("1500"), ~D[2026-10-05])

    :ok = Bills.unpay(ctx.group.id, rent, {2026, 10})
    assert hd(Bills.occurrences(ctx.group.id, {2026, 10}, ~D[2026-10-05])).status == "overdue"
  end

  test "a bill created after its day this month still shows this month, unpaid, without auto charge" do
    ctx = setup_group()

    b =
      bill(
        ctx,
        %{name: "Academia", amount: Decimal.new("99.90"), due_day: 1, account_id: ctx.card.id},
        ~N[2026-10-03 12:00:00]
      )

    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-03])
    assert charges(ctx.card) == []

    assert [
             %{
               status: "overdue",
               due_date: ~D[2026-10-01],
               next_due_date: ~D[2026-11-01],
               paid_on: nil
             }
           ] =
             Bills.occurrences(ctx.group.id, {2026, 10}, ~D[2026-10-03])

    {:ok, paid} =
      Bills.pay(ctx.group.id, ctx.user.id, b, {2026, 10}, Decimal.new("99.90"), ~D[2026-10-03])

    assert paid.status == "paid"
    assert paid.paid_on == ~D[2026-10-03]
    assert paid.next_due_date == ~D[2026-11-01]

    # Next month it is charged automatically on the 1st
    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-11-01])
    assert length(charges(ctx.card)) == 2
  end
end
