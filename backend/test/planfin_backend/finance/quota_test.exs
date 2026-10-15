defmodule PlanfinBackend.Finance.QuotaTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Categories, Expenses, Finance, Periods, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Bills, MonthPlan, Panel, Salary}

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
      Categories.create_category(group.id, %{name: "Beleza", type: "expense", icon: "star"})

    {:ok, nails} = Categories.create_subcategory(category, %{name: "Unhas"})
    {:ok, other} = Categories.create_subcategory(category, %{name: "Cabelo"})

    {:ok, _period} =
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

    %{user: user, group: group, checking: checking, card: card, nails: nails, other: other}
  end

  defp quota(ctx, account_id) do
    {:ok, bill} =
      Bills.create_bill(ctx.group.id, %{
        name: "Unhas Dri",
        amount: Decimal.new("350"),
        due_day: 1,
        account_id: account_id,
        subcategory_id: ctx.nails.id,
        kind: "quota"
      })

    bill
    |> Ecto.Changeset.change(inserted_at: ~N[2026-09-01 00:00:00])
    |> Repo.update!()
    |> Repo.preload([:account, subcategory: :category], force: true)
  end

  defp spend(ctx, amount, date, subcategory \\ nil) do
    {:ok, e} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new(amount),
        date: date,
        account_id: ctx.card.id,
        subcategory_id: (subcategory || ctx.nails).id
      })

    e
  end

  defp occurrence(ctx, bill, month, today \\ @today) do
    ctx.group.id |> Bills.occurrences(month, today) |> Enum.find(&(&1.bill.id == bill.id))
  end

  test "a quota needs a subcategory and is an expense" do
    ctx = setup_group()

    assert {:error, cs} =
             Bills.create_bill(ctx.group.id, %{
               name: "Cota",
               amount: Decimal.new("100"),
               due_day: 1,
               account_id: ctx.card.id,
               kind: "quota"
             })

    assert Keyword.has_key?(cs.errors, :subcategory_id)
  end

  test "purchases consume the quota, stay out of the daily budget and other subcategories don't count" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    first = spend(ctx, "75", ~D[2026-10-14])
    _second = spend(ctx, "100", ~D[2026-10-15])
    hair = spend(ctx, "80", ~D[2026-10-15], ctx.other)

    refute first.counts_in_budget
    assert hair.counts_in_budget

    occ = occurrence(ctx, bill, {2026, 10})
    assert occ.status == "pending"
    assert Decimal.equal?(occ.quota_spent, Decimal.new("175"))
    assert Decimal.equal?(occ.amount, Decimal.new("175"))

    # Going over closes it, with the real total
    spend(ctx, "200", ~D[2026-10-20])
    occ = occurrence(ctx, bill, {2026, 10}, ~D[2026-10-20])
    assert occ.status == "paid"
    assert Decimal.equal?(occ.amount, Decimal.new("375"))
  end

  test "a quota is never charged nor paid, and the month end closes it" do
    ctx = setup_group()
    bill = quota(ctx, ctx.card.id)

    :ok = Bills.charge_due_card_bills(ctx.group.id, @today)
    assert Repo.aggregate(from(e in Expense, where: e.account_id == ^ctx.card.id), :count) == 0

    assert {:error, :quota_not_payable} =
             Bills.pay(ctx.group.id, ctx.user.id, bill, {2026, 10}, Decimal.new("350"), @today)

    spend(ctx, "300", ~D[2026-10-14])
    occ = occurrence(ctx, bill, {2026, 10}, ~D[2026-11-01])
    assert occ.status == "paid"
    assert Decimal.equal?(occ.amount, Decimal.new("300"))
  end

  test "a quota paid from the account commits only what is left; the next month plans it whole" do
    ctx = setup_group()
    bill = quota(ctx, ctx.checking.id)

    {:ok, _} =
      Expenses.create_expense(ctx.group.id, ctx.user.id, %{
        amount: Decimal.new("150"),
        date: ~D[2026-11-03],
        account_id: ctx.checking.id,
        subcategory_id: ctx.nails.id
      })

    panel = Panel.build(ctx.group.id, ~D[2026-11-03], ~D[2026-11-12])
    nov = Enum.find(panel.commitments, &(&1.bill_id == bill.id and &1.month == {2026, 11}))
    assert Decimal.equal?(nov.amount, Decimal.new("200"))

    {:ok, plan} = MonthPlan.build(ctx.group.id, @today)
    assert [%{label: "Unhas Dri", amount: amount}] = plan.next.fixed_bills
    assert Decimal.equal?(amount, Decimal.new("350"))
  end

  test "moving an expense into the quota subcategory takes it out of the daily budget" do
    ctx = setup_group()
    _bill = quota(ctx, ctx.card.id)

    hair = spend(ctx, "80", ~D[2026-10-15], ctx.other)
    assert hair.counts_in_budget

    {:ok, moved} = Expenses.update_expense(ctx.group.id, hair.id, %{subcategory_id: ctx.nails.id})
    refute moved.counts_in_budget
    assert moved.budget_day_id == nil
  end
end
