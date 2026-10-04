defmodule PlanfinBackend.Finance.InstallmentsTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Periods}
  alias PlanfinBackend.Finance.Invoices

  @today ~D[2026-10-04]

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, _} =
      Periods.create_period(
        group.id,
        %{
          start_date: ~D[2026-09-12],
          end_date: ~D[2026-10-12],
          daily_limit: Decimal.new("50"),
          total_budget: Decimal.new("2000")
        },
        @today
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Nubank", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-09-01]
      )

    %{user: user, group: group, card: card}
  end

  defp parcels(ctx, first), do: Expenses.list_installments(ctx.group.id, first.id)

  test "retroactive purchase: only installments still to pay are created, with real numbering" do
    ctx = setup_group()

    # 12x of 100 whose 1st installment was on the June invoice (due Jun 15).
    # Jun..Sep invoices are due: installments 1..4 already paid.
    {:ok, first} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("100.00"),
        amount_per_installment: true,
        date: @today,
        account_id: ctx.card.id,
        installments: 12,
        first_invoice: {2026, 6},
        today: @today
      })

    all = parcels(ctx, first)
    assert Enum.map(all, & &1.installment_number) == Enum.to_list(5..12)
    assert Enum.all?(all, &(&1.installment_count == 12))
    assert Enum.all?(all, &Decimal.equal?(&1.amount, Decimal.new("100.00")))
    refute Enum.any?(all, & &1.counts_in_budget)

    # 5/12 on the October invoice (due Oct 15), 12/12 on May 2027
    assert Invoices.month_for(ctx.card, hd(all).date) == {2026, 10}
    assert Invoices.month_for(ctx.card, List.last(all).date) == {2027, 5}
  end

  test "choosing a future invoice keeps the whole purchase outside the daily budget" do
    ctx = setup_group()

    {:ok, first} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("300.00"),
        date: @today,
        account_id: ctx.card.id,
        installments: 3,
        first_invoice: {2026, 11},
        today: @today
      })

    all = parcels(ctx, first)

    assert Enum.map(all, &Invoices.month_for(ctx.card, &1.date)) == [
             {2026, 11},
             {2026, 12},
             {2027, 1}
           ]

    refute Enum.any?(all, & &1.counts_in_budget)
  end

  test "default invoice keeps the original behaviour" do
    ctx = setup_group()

    {:ok, first} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("100.00"),
        date: @today,
        account_id: ctx.card.id,
        installments: 3,
        today: @today
      })

    assert first.counts_in_budget
    assert Enum.map(parcels(ctx, first), & &1.installment_number) == [1, 2, 3]
  end

  test "all installments already due is an error" do
    ctx = setup_group()

    assert {:error, :all_installments_past} =
             Expenses.create_expense(ctx.group.id, ctx.user.id, %{
               amount: Decimal.new("100.00"),
               date: @today,
               account_id: ctx.card.id,
               installments: 2,
               first_invoice: {2026, 1},
               today: @today
             })
  end

  test "anticipating merges the remaining installments into one entry on the same invoice" do
    ctx = setup_group()

    {:ok, first} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("100.00"),
        amount_per_installment: true,
        date: @today,
        account_id: ctx.card.id,
        installments: 12,
        first_invoice: {2026, 6},
        today: @today
      })

    five = hd(parcels(ctx, first))
    assert five.installment_number == 5

    {:ok, entry} =
      Expenses.anticipate_installments(ctx.group.id, ctx.user.id, five.id, Decimal.new("650.00"))

    assert Decimal.equal?(entry.amount, Decimal.new("650.00"))
    assert entry.date == five.date
    assert entry.note =~ "Antecipação das parcelas 6–12/12"

    remaining = parcels(ctx, five)
    assert length(remaining) == 2
    assert Enum.map(remaining, & &1.installment_number) == [5, nil]

    # Same invoice as 5/12
    october = Invoices.build(ctx.card, {2026, 10}, @today)
    assert Decimal.equal?(october.total, Decimal.new("750.00"))
    assert Invoices.build(ctx.card, {2026, 11}, @today).status == "upcoming"
    assert Decimal.equal?(Invoices.build(ctx.card, {2026, 11}, @today).total, Decimal.new("0"))

    assert {:error, :nothing_to_anticipate} =
             Expenses.anticipate_installments(ctx.group.id, ctx.user.id, five.id)

    # Deleting the purchase still removes everything, anticipation included
    {:ok, _} = Expenses.delete_expense(ctx.group.id, five.id)
    assert parcels(ctx, entry) == []
  end

  test "anticipation defaults to the sum" do
    ctx = setup_group()

    {:ok, first} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("100.00"),
        date: @today,
        account_id: ctx.card.id,
        installments: 3,
        today: @today
      })

    {:ok, entry} = Expenses.anticipate_installments(ctx.group.id, ctx.user.id, first.id)
    assert Decimal.equal?(entry.amount, Decimal.new("66.66"))
  end
end
