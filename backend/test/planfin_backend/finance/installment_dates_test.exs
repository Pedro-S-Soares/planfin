defmodule PlanfinBackend.Finance.InstallmentDatesTest do
  @moduledoc """
  Parcels land on the invoices the bank puts them in: parcel 1 on the purchase
  date's invoice, parcel k on the k−1-th next one, dated on its opening day.
  """
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance}
  alias PlanfinBackend.Finance.Invoices

  @today ~D[2026-10-01]

  defp setup_card(closing_day \\ 5, due_day \\ 15) do
    {user, group} = user_with_group_fixture()

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: closing_day, due_day: due_day},
        ~D[2026-09-01]
      )

    %{user: user, group: group, card: card}
  end

  defp buy(ctx, date, count, amount \\ "300.00") do
    {:ok, first} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new(amount),
        date: date,
        account_id: ctx.card.id,
        installments: count,
        counts_in_budget: false,
        today: @today
      })

    Expenses.list_installments(ctx.group.id, first.id)
  end

  defp invoices(ctx, parcels), do: Enum.map(parcels, &Invoices.month_for(ctx.card, &1.date))

  test "purchase before the closing: this invoice, then the next ones from their opening day" do
    ctx = setup_card()
    parcels = buy(ctx, ~D[2026-10-03], 3)

    assert Enum.map(parcels, & &1.date) == [~D[2026-10-03], ~D[2026-10-05], ~D[2026-11-05]]
    assert invoices(ctx, parcels) == [{2026, 10}, {2026, 11}, {2026, 12}]
  end

  test "purchase on the closing day goes to the next invoice, and its parcels after it" do
    ctx = setup_card()
    parcels = buy(ctx, ~D[2026-10-05], 3)

    assert Enum.map(parcels, & &1.date) == [~D[2026-10-05], ~D[2026-11-05], ~D[2026-12-05]]
    assert invoices(ctx, parcels) == [{2026, 11}, {2026, 12}, {2027, 1}]
  end

  test "purchase after the closing" do
    ctx = setup_card()
    parcels = buy(ctx, ~D[2026-10-20], 3)

    assert Enum.map(parcels, & &1.date) == [~D[2026-10-20], ~D[2026-11-05], ~D[2026-12-05]]
    assert invoices(ctx, parcels) == [{2026, 11}, {2026, 12}, {2027, 1}]
  end

  test "purchase on the 31st of a card closing on the 28th, across February" do
    ctx = setup_card(28, 5)
    parcels = buy(ctx, ~D[2027-01-31], 3)

    assert Enum.map(parcels, & &1.date) == [~D[2027-01-31], ~D[2027-02-28], ~D[2027-03-28]]
    assert invoices(ctx, parcels) == [{2027, 2}, {2027, 3}, {2027, 4}]
  end

  test "12 parcels crossing the year, each on its own invoice" do
    ctx = setup_card()
    parcels = buy(ctx, ~D[2026-11-20], 12, "1200.00")

    assert invoices(ctx, parcels) ==
             for(k <- 0..11, do: Finance.Calendar.add_months({2026, 12}, k))

    assert List.last(parcels).date == ~D[2027-10-05]
    assert Enum.all?(parcels, &Decimal.equal?(&1.amount, Decimal.new("100.00")))
  end

  test "moving the first parcel's date takes the next ones along; other edits don't move them" do
    ctx = setup_card()
    [first | _] = buy(ctx, ~D[2026-10-03], 3)

    {:ok, _} = Expenses.update_expense(ctx.group.id, first.id, %{amount: Decimal.new("120.00")})

    assert invoices(ctx, Expenses.list_installments(ctx.group.id, first.id)) == [
             {2026, 10},
             {2026, 11},
             {2026, 12}
           ]

    {:ok, _} = Expenses.update_expense(ctx.group.id, first.id, %{date: ~D[2026-10-06]})
    parcels = Expenses.list_installments(ctx.group.id, first.id)
    assert invoices(ctx, parcels) == [{2026, 11}, {2026, 12}, {2027, 1}]
    assert Decimal.equal?(hd(parcels).amount, Decimal.new("120.00"))
  end

  test "changing the card's closing day keeps each parcel on its invoice" do
    ctx = setup_card()
    parcels = buy(ctx, ~D[2026-10-03], 3)
    assert invoices(ctx, parcels) == [{2026, 10}, {2026, 11}, {2026, 12}]

    {:ok, card} = Finance.update_account(ctx.card, %{closing_day: 10})
    ctx = %{ctx | card: card}

    parcels = Expenses.list_installments(ctx.group.id, hd(parcels).id)
    assert Enum.map(parcels, & &1.date) == [~D[2026-10-03], ~D[2026-10-10], ~D[2026-11-10]]
    assert invoices(ctx, parcels) == [{2026, 10}, {2026, 11}, {2026, 12}]
  end
end
