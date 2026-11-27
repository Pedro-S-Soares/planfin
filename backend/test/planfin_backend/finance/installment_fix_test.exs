defmodule PlanfinBackend.Finance.InstallmentFixTest do
  @moduledoc """
  The retroactive date fix (CX-77) on parcels saved with the old rule (purchase
  date + n months): only dates of parcels 2..n change, settled invoices are left
  alone, every change is audited and can be reverted, a second run does nothing.
  """
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Finance, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Installments, Invoices}

  @today ~D[2026-11-27]

  setup do
    {user, group} = user_with_group_fixture()

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 25, due_day: 5},
        ~D[2026-09-01]
      )

    %{user: user, group: group, card: card}
  end

  # A purchase saved by the old code: parcel k on the purchase date + k − 1 months.
  defp old_purchase(ctx, date, count, amount \\ "50.00") do
    group_uuid = Ecto.UUID.generate()

    for k <- 1..count do
      Repo.insert!(%Expense{
        amount: Decimal.new(amount),
        date: Finance.Calendar.shift_date(date, k - 1),
        note: "Jogo",
        type: "expense",
        counts_in_budget: k == 1,
        installment_group_id: group_uuid,
        installment_number: k,
        installment_count: count,
        group_id: ctx.group.id,
        created_by_id: ctx.user.id,
        account_id: ctx.card.id
      })
    end

    group_uuid
  end

  defp parcels(group_uuid) do
    Repo.all(
      from(e in Expense,
        where: e.installment_group_id == ^group_uuid,
        order_by: e.installment_number
      )
    )
  end

  defp invoices(ctx, group_uuid),
    do: Enum.map(parcels(group_uuid), &Invoices.month_for(ctx.card, &1.date))

  test "parcels of an unchanged card only get the opening date: same invoices, same totals",
       ctx do
    purchase = old_purchase(ctx, ~D[2026-10-13], 4)
    before = invoices(ctx, purchase)

    summary = Installments.apply_plan(Installments.plan(:all, @today), "test")

    assert summary.moved == 0
    assert summary.redated == 3
    assert invoices(ctx, purchase) == before

    assert Enum.map(parcels(purchase), & &1.date) ==
             [~D[2026-10-13], ~D[2026-10-25], ~D[2026-11-25], ~D[2026-12-25]]

    assert Enum.all?(parcels(purchase), &Decimal.equal?(&1.amount, Decimal.new("50.00")))
    assert Installments.plan(:all, @today) == []
  end

  test "after a closing-day change, parcels go back to the invoice after the first one's", ctx do
    # Bought on 13/10 with closing 10: invoices Nov, Dec, Jan. Then the card's
    # closing day was fixed to 25 without moving the parcels (old behaviour).
    ctx = %{ctx | card: Repo.update!(Ecto.Changeset.change(ctx.card, closing_day: 10))}
    purchase = old_purchase(ctx, ~D[2026-10-13], 3)
    card = Repo.update!(Ecto.Changeset.change(ctx.card, closing_day: 25))
    ctx = %{ctx | card: card}

    # 13/10 < 25: parcel 1 is now on October, and so is each following one a month later.
    assert invoices(ctx, purchase) == [{2026, 10}, {2026, 11}, {2026, 12}]

    summary = Installments.apply_plan(Installments.plan(:all, @today), "test")
    assert summary.moved == 0
    assert invoices(ctx, purchase) == [{2026, 10}, {2026, 11}, {2026, 12}]
  end

  test "a misplaced parcel moves to its invoice, unless an invoice involved has a payment", ctx do
    {:ok, checking} =
      Finance.create_account(
        ctx.group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("1000")},
        ~D[2026-09-01]
      )

    # Parcel 1 on 13/10 (October invoice). Parcel 3 of each purchase sits on 13/11,
    # the November invoice, though it belongs to December.
    free = old_purchase(ctx, ~D[2026-10-13], 3)
    locked = old_purchase(ctx, ~D[2026-10-13], 3)

    for purchase <- [free, locked] do
      third = List.last(parcels(purchase))
      Repo.update!(Ecto.Changeset.change(third, date: ~D[2026-11-13]))
    end

    # Once the November invoice has a payment, the locked purchase's parcel stays.
    pay = fn ->
      {:ok, _} =
        Finance.create_transfer(ctx.group.id, ctx.user.id, %{
          from_account_id: checking.id,
          to_account_id: ctx.card.id,
          amount: Decimal.new("10"),
          date: @today,
          kind: "card_payment",
          invoice_month: ~D[2026-11-01]
        })
    end

    # First the free one alone (no payment yet).
    summary = Installments.apply_plan(Installments.plan({:purchase, free}, @today), "test")
    assert summary.moved == 1
    assert invoices(ctx, free) == [{2026, 10}, {2026, 11}, {2026, 12}]

    pay.()
    summary = Installments.apply_plan(Installments.plan({:purchase, locked}, @today), "test")
    assert summary.moved == 0

    assert [%{action: :skipped_locked, reason: reason, number: 3}] =
             Enum.filter(summary.items, &(&1.action == :skipped_locked))

    assert reason =~ "sairia da fatura 2026-11, que já tem pagamento"
    assert List.last(parcels(locked)).date == ~D[2026-11-13]

    assert Repo.aggregate(
             from(a in "installment_fix_audit", where: a.action == "skipped_locked"),
             :count
           ) == 1
  end

  test "revert puts back exactly the dates the run changed", ctx do
    purchase = old_purchase(ctx, ~D[2026-10-13], 4)
    before = Enum.map(parcels(purchase), & &1.date)

    Installments.apply_plan(Installments.plan(:all, @today), "test")
    refute Enum.map(parcels(purchase), & &1.date) == before

    assert Installments.revert("test") == 3
    assert Enum.map(parcels(purchase), & &1.date) == before
    assert Installments.revert("test") == 0
  end

  test "parcel 1, non-installment entries and other fields are never touched", ctx do
    purchase = old_purchase(ctx, ~D[2026-10-13], 3)

    single =
      Repo.insert!(%Expense{
        amount: Decimal.new("10"),
        date: ~D[2026-11-13],
        type: "expense",
        group_id: ctx.group.id,
        created_by_id: ctx.user.id,
        account_id: ctx.card.id
      })

    [first | _] = parcels(purchase)
    Installments.apply_plan(Installments.plan(:all, @today), "test")

    assert Repo.get!(Expense, first.id).date == first.date
    assert Repo.get!(Expense, single.id).date == single.date

    for p <- parcels(purchase) do
      assert p.note == "Jogo" and p.installment_count == 3 and
               Decimal.equal?(p.amount, Decimal.new("50.00"))
    end
  end
end
