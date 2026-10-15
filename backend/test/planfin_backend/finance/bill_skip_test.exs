defmodule PlanfinBackend.Finance.BillSkipTest do
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{Finance, Repo}
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

    %{user: user, group: group, checking: checking, card: card}
  end

  defp bill(ctx, attrs) do
    {:ok, bill} = Bills.create_bill(ctx.group.id, attrs)

    bill
    |> Ecto.Changeset.change(inserted_at: ~N[2026-09-01 00:00:00])
    |> Repo.update!()
    |> Repo.preload([:account, subcategory: :category], force: true)
  end

  defp occurrence(ctx, bill, month, today \\ @today) do
    ctx.group.id |> Bills.occurrences(month, today) |> Enum.find(&(&1.bill.id == bill.id))
  end

  test "a skipped month leaves the commitments and comes back the next month" do
    ctx = setup_group()

    creche =
      bill(ctx, %{
        name: "Creche",
        amount: Decimal.new("350"),
        due_day: 5,
        account_id: ctx.checking.id
      })

    horizon = ~D[2026-11-12]

    labels = fn ->
      Enum.map(Panel.build(ctx.group.id, @today, horizon).commitments, & &1.due_date)
    end

    assert labels.() == [~D[2026-09-05], ~D[2026-10-05], ~D[2026-11-05]]

    {:ok, skipped} = Bills.skip(ctx.group.id, creche, {2026, 11}, "Tobias doente", @today)
    assert skipped.status == "skipped"
    assert skipped.note == "Tobias doente"
    assert labels.() == [~D[2026-09-05], ~D[2026-10-05]]

    assert occurrence(ctx, creche, {2026, 12}).status == "pending"

    :ok = Bills.unskip(ctx.group.id, creche, {2026, 11})
    assert occurrence(ctx, creche, {2026, 11}).status == "pending"
    assert occurrence(ctx, creche, {2026, 11}).note == nil
    assert length(labels.()) == 3
  end

  test "a skipped month is out of the next month plan" do
    ctx = setup_group()

    creche =
      bill(ctx, %{
        name: "Creche",
        amount: Decimal.new("350"),
        due_day: 20,
        account_id: ctx.checking.id
      })

    next_fixed = fn ->
      {:ok, plan} = MonthPlan.build(ctx.group.id, @today)
      Enum.map(plan.next.fixed_bills, & &1.label)
    end

    assert next_fixed.() == ["Creche"]
    {:ok, _} = Bills.skip(ctx.group.id, creche, {2026, 11}, nil, @today)
    assert next_fixed.() == []
  end

  test "a skipped card month is not charged" do
    ctx = setup_group()

    gym =
      bill(ctx, %{
        name: "Academia",
        amount: Decimal.new("99.90"),
        due_day: 20,
        account_id: ctx.card.id
      })

    {:ok, _} = Bills.skip(ctx.group.id, gym, {2026, 10}, "", @today)
    :ok = Bills.charge_due_card_bills(ctx.group.id, ~D[2026-10-21])

    assert Repo.aggregate(
             from(e in Expense, where: e.account_id == ^ctx.card.id and e.date >= ^~D[2026-10-01]),
             :count
           ) == 0

    assert occurrence(ctx, gym, {2026, 10}, ~D[2026-10-21]).note == nil
  end

  test "a paid month cannot be skipped" do
    ctx = setup_group()

    creche =
      bill(ctx, %{
        name: "Creche",
        amount: Decimal.new("350"),
        due_day: 5,
        account_id: ctx.checking.id
      })

    {:ok, _} =
      Bills.pay(ctx.group.id, ctx.user.id, creche, {2026, 10}, Decimal.new("350"), @today)

    assert {:error, :already_paid} = Bills.skip(ctx.group.id, creche, {2026, 10}, nil, @today)
  end
end
