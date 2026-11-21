defmodule PlanfinBackend.Finance.BillEditTest do
  @moduledoc """
  Editing an item after it was paid: the lists of fixas/avulsas show the entry the
  payment created, so a one-off item's edit must reach that entry (2026-11-21: the
  amount of a paid avulsa was edited and the list kept the old value).
  """
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Finance, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.Bills

  @today ~D[2026-11-21]

  setup do
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
        %{name: "Cartão", kind: "credit_card", closing_day: 25, due_day: 5},
        ~D[2026-10-01]
      )

    %{user: user, group: group, checking: checking, card: card}
  end

  defp bill(ctx, attrs) do
    {:ok, bill} = Bills.create_bill(ctx.group.id, attrs)

    bill
    |> Ecto.Changeset.change(inserted_at: ~N[2026-09-01 00:00:00])
    |> Repo.update!()
    |> Repo.preload([:account, subcategory: :category], force: true)
  end

  defp occurrence(ctx, bill, month) do
    ctx.group.id |> Bills.occurrences(month, @today) |> Enum.find(&(&1.bill.id == bill.id))
  end

  test "editing a paid one-off item updates the entry, so the list shows the new amount", ctx do
    conserto =
      bill(ctx, %{
        name: "Conserto",
        amount: Decimal.new("300"),
        due_day: 15,
        account_id: ctx.checking.id,
        once_month: ~D[2026-11-01]
      })

    {:ok, paid} =
      Bills.pay(ctx.group.id, ctx.user.id, conserto, {2026, 11}, conserto.amount, @today)

    assert paid.status == "paid"

    {:ok, _} = Bills.update_bill(conserto, %{amount: Decimal.new("350"), name: "Conserto da pia"})

    occ = occurrence(ctx, conserto, {2026, 11})
    assert occ.status == "paid"
    assert Decimal.equal?(occ.amount, Decimal.new("350"))

    entry = Repo.get!(Expense, paid.expense_id)
    assert Decimal.equal?(entry.amount, Decimal.new("350"))
    assert entry.note == "Conserto da pia"
    assert entry.counts_in_budget == false
    assert entry.date == @today
  end

  test "a one-off item charged on the card carries the new amount to the invoice entry", ctx do
    presente =
      bill(ctx, %{
        name: "Presente",
        amount: Decimal.new("200"),
        due_day: 10,
        account_id: ctx.card.id,
        once_month: ~D[2026-11-01]
      })

    :ok = Bills.charge_due_card_bills(ctx.group.id, @today)
    assert %{status: "paid", expense_id: expense_id} = occurrence(ctx, presente, {2026, 11})

    {:ok, _} = Bills.update_bill(presente, %{amount: Decimal.new("180")})

    assert Decimal.equal?(occurrence(ctx, presente, {2026, 11}).amount, Decimal.new("180"))
    assert Decimal.equal?(Repo.get!(Expense, expense_id).amount, Decimal.new("180"))
  end

  test "only what changed is carried: a note edited in the history is kept", ctx do
    conserto =
      bill(ctx, %{
        name: "Conserto",
        amount: Decimal.new("300"),
        due_day: 15,
        account_id: ctx.checking.id,
        once_month: ~D[2026-11-01]
      })

    {:ok, paid} =
      Bills.pay(ctx.group.id, ctx.user.id, conserto, {2026, 11}, conserto.amount, @today)

    paid.expense_id
    |> then(&Repo.get!(Expense, &1))
    |> Ecto.Changeset.change(note: "pia da cozinha")
    |> Repo.update!()

    {:ok, _} = Bills.update_bill(conserto, %{amount: Decimal.new("320")})

    entry = Repo.get!(Expense, paid.expense_id)
    assert Decimal.equal?(entry.amount, Decimal.new("320"))
    assert entry.note == "pia da cozinha"
  end

  test "a recurring item keeps the real amount of the months already paid", ctx do
    aluguel =
      bill(ctx, %{
        name: "Aluguel",
        amount: Decimal.new("1850"),
        due_day: 7,
        account_id: ctx.checking.id
      })

    {:ok, paid} =
      Bills.pay(ctx.group.id, ctx.user.id, aluguel, {2026, 11}, aluguel.amount, ~D[2026-11-07])

    {:ok, updated} = Bills.update_bill(aluguel, %{amount: Decimal.new("1900")})

    assert Decimal.equal?(Repo.get!(Expense, paid.expense_id).amount, Decimal.new("1850"))
    assert Decimal.equal?(occurrence(ctx, updated, {2026, 11}).amount, Decimal.new("1850"))
    assert Decimal.equal?(occurrence(ctx, updated, {2026, 12}).amount, Decimal.new("1900"))
  end

  test "an unpaid one-off item just changes its own amount", ctx do
    conserto =
      bill(ctx, %{
        name: "Conserto",
        amount: Decimal.new("300"),
        due_day: 28,
        account_id: ctx.checking.id,
        once_month: ~D[2026-11-01]
      })

    {:ok, updated} = Bills.update_bill(conserto, %{amount: Decimal.new("310")})

    assert Decimal.equal?(occurrence(ctx, updated, {2026, 11}).amount, Decimal.new("310"))
    assert Repo.aggregate(Expense, :count) == 0
  end
end
