defmodule PlanfinBackend.Finance.ProjectionTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Expenses, Finance, Repo}
  alias PlanfinBackend.Finance.{Bills, Projection, Salary}

  @today ~D[2026-10-20]

  defp setup_group do
    {user, group} = user_with_group_fixture()

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("100")},
        ~D[2026-10-01]
      )

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Nubank", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-10-01]
      )

    {:ok, _} = Salary.update_settings(group.id, %{salary_amount: Decimal.new("6000.00")})
    %{user: user, group: group, checking: checking, card: card}
  end

  defp old_bill(ctx, attrs) do
    {:ok, bill} = Bills.create_bill(ctx.group.id, attrs)
    bill |> Ecto.Changeset.change(inserted_at: ~N[2026-09-01 00:00:00]) |> Repo.update!()
  end

  test "next salary covers the open invoice, card bills still to come and account bills" do
    ctx = setup_group()

    # Purchases on the open invoice (Oct 5 – Nov 4, due Nov 16)
    {:ok, _} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("2500.00"),
        date: ~D[2026-10-10],
        account_id: ctx.card.id,
        counts_in_budget: false
      })

    # Netflix on the 20th of October (already launched) and November (after close: not on this invoice)
    netflix =
      old_bill(ctx, %{
        name: "Netflix",
        amount: Decimal.new("55.90"),
        due_day: 20,
        account_id: ctx.card.id
      })

    {:ok, _} =
      Bills.pay(
        ctx.group.id,
        ctx.user.id,
        Repo.preload(netflix, [:account, subcategory: :category]),
        {2026, 10},
        Decimal.new("55.90"),
        ~D[2026-10-20]
      )

    # Spotify on the 1st: November occurrence still to be charged on this invoice
    old_bill(ctx, %{
      name: "Spotify",
      amount: Decimal.new("21.90"),
      due_day: 1,
      account_id: ctx.card.id
    })

    # Rent paid from the account on the 10th: November's falls in the next cycle (Nov 13 – Dec 10)? No — due Nov 10 is before.
    # December's (Dec 10) is inside the cycle Nov 13 – Dec 10.
    old_bill(ctx, %{
      name: "Aluguel",
      amount: Decimal.new("1500.00"),
      due_day: 10,
      account_id: ctx.checking.id
    })

    p = Projection.build(ctx.group.id, @today)
    assert p.salary_date == ~D[2026-11-13]
    assert p.cycle_end_date == ~D[2026-12-10]

    assert [%{card_name: "Nubank", month: {2026, 11}, due_date: ~D[2026-11-16]} = inv] =
             p.invoices

    # 2500 + Netflix already on it
    assert Decimal.equal?(inv.amount, Decimal.new("2555.90"))

    # Spotify of Nov 1 still to be charged (Oct 1 was in the previous invoice and is overdue there)
    assert Decimal.equal?(inv.pending_bills, Decimal.new("21.90"))
    assert Decimal.equal?(p.account_bills, Decimal.new("1500.00"))
    assert Decimal.equal?(p.committed, Decimal.new("4077.80"))
    assert Decimal.equal?(p.left, Decimal.new("1922.20"))
  end

  test "nil without salary" do
    {_user, group} = user_with_group_fixture()
    assert Projection.build(group.id, @today) == nil
  end

  test "invoice goal is stored on the card" do
    ctx = setup_group()
    {:ok, card} = Finance.update_account(ctx.card, %{invoice_goal: Decimal.new("2000")})
    assert Decimal.equal?(card.invoice_goal, Decimal.new("2000"))
  end
end
