defmodule PlanfinBackend.Finance.DatelessBillTest do
  @moduledoc """
  A planned one-off expense without a day: it belongs to an invoice (card) or a
  month, counts there until the real purchase is registered and is never charged
  by itself.
  """
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Finance, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.Bills

  setup do
    {user, group} = user_with_group_fixture()

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("5000")},
        ~D[2026-10-01]
      )

    # Closes on the 5th: the December invoice takes purchases from 05/11 to 04/12.
    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    %{user: user, group: group, checking: checking, card: card}
  end

  defp planned(ctx, attrs) do
    {:ok, bill} =
      Bills.create_bill(
        ctx.group.id,
        Map.merge(
          %{name: "Presente", amount: Decimal.new("300"), due_day: 1, no_due_day: true},
          attrs
        )
      )

    bill
  end

  defp occurrence(ctx, bill, month, today) do
    ctx.group.id |> Bills.occurrences(month, today) |> Enum.find(&(&1.bill.id == bill.id))
  end

  test "only a one-off item can have no day", ctx do
    assert {:error, cs} =
             Bills.create_bill(ctx.group.id, %{
               name: "Sem dia",
               amount: Decimal.new("10"),
               due_day: 1,
               account_id: ctx.card.id,
               no_due_day: true
             })

    assert Keyword.has_key?(cs.errors, :no_due_day)
  end

  test "on a card it belongs to its invoice: due on the last purchase day, never charged by itself",
       ctx do
    bill = planned(ctx, %{account_id: ctx.card.id, once_month: ~D[2026-12-01]})

    occ = occurrence(ctx, bill, {2026, 12}, ~D[2026-11-10])
    assert occ.due_date == ~D[2026-12-04]
    assert occ.status == "pending"
    assert occurrence(ctx, bill, {2026, 11}, ~D[2026-11-10]) == nil

    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-12-20])
    assert Repo.aggregate(from(e in Expense, where: e.account_id == ^ctx.card.id), :count) == 0
    assert occurrence(ctx, bill, {2026, 12}, ~D[2026-12-20]).status == "overdue"
  end

  test "registering the real purchase realizes it on its invoice", ctx do
    bill = planned(ctx, %{account_id: ctx.card.id, once_month: ~D[2026-12-01]})

    {:ok, paid} =
      Bills.pay(ctx.group.id, ctx.user.id, bill, {2026, 12}, Decimal.new("280"), ~D[2026-11-20])

    assert paid.status == "paid"
    assert Decimal.equal?(paid.amount, Decimal.new("280"))

    entry = Repo.get!(Expense, paid.expense_id)
    assert entry.account_id == ctx.card.id
    assert entry.date == ~D[2026-11-20]
    refute entry.counts_in_budget
  end

  test "off a card it belongs to its month: due on the month's last day", ctx do
    bill = planned(ctx, %{account_id: ctx.checking.id, once_month: ~D[2026-12-01]})
    assert occurrence(ctx, bill, {2026, 12}, ~D[2026-11-10]).due_date == ~D[2026-12-31]
  end
end
