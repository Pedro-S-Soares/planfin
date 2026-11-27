defmodule PlanfinBackend.Finance.QuotaConversionTest do
  @moduledoc "Legacy quotas → invoice model, with the expenses the legacy rule counted linked."
  use PlanfinBackend.DataCase

  import PlanfinBackend.AccountsFixtures

  alias PlanfinBackend.{BudgetDays, Categories, Finance, Periods, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{QuotaConversion, Quotas, RecurringBill}

  setup do
    {user, group} = user_with_group_fixture()

    {:ok, card} =
      Finance.create_account(
        group.id,
        %{name: "Cartão", kind: "credit_card", closing_day: 5, due_day: 15},
        ~D[2026-09-01]
      )

    {:ok, checking} =
      Finance.create_account(
        group.id,
        %{name: "Conta", kind: "checking", balance: Decimal.new("1000")},
        ~D[2026-09-01]
      )

    {:ok, cat} =
      Categories.create_category(group.id, %{name: "Carro", type: "expense", icon: "car"})

    {:ok, wash} = Categories.create_subcategory(cat, %{name: "Lavagem"})
    {:ok, gift} = Categories.create_subcategory(cat, %{name: "Presentes"})
    {:ok, other} = Categories.create_subcategory(cat, %{name: "Outros"})

    %{
      user: user,
      group: group,
      card: card,
      checking: checking,
      wash: wash,
      gift: gift,
      other: other
    }
  end

  # A quota as the old code stored it.
  defp legacy_quota(ctx, attrs) do
    Repo.insert!(
      struct(
        RecurringBill,
        Map.merge(
          %{
            name: "Cota",
            amount: Decimal.new("150"),
            due_day: 1,
            kind: "quota",
            direction: "expense",
            per_invoice: false,
            group_id: ctx.group.id,
            account_id: ctx.card.id,
            inserted_at: ~N[2026-10-04 10:00:00],
            updated_at: ~N[2026-10-04 10:00:00]
          },
          attrs
        )
      )
    )
  end

  defp expense(ctx, sub, date, amount, attrs \\ %{}) do
    Repo.insert!(
      struct(
        Expense,
        Map.merge(
          %{
            amount: Decimal.new(amount),
            date: date,
            type: "expense",
            counts_in_budget: false,
            subcategory_id: sub.id,
            group_id: ctx.group.id,
            created_by_id: ctx.user.id,
            account_id: ctx.card.id
          },
          attrs
        )
      )
    )
  end

  defp reload(struct), do: Repo.get!(struct.__struct__, struct.id)

  test "links exactly what the legacy rule counted and moves card months to invoices", ctx do
    recurring = legacy_quota(ctx, %{subcategory_id: ctx.wash.id, last_month: ~D[2026-12-01]})

    one_off =
      legacy_quota(ctx, %{
        subcategory_id: ctx.gift.id,
        once_month: ~D[2026-11-01],
        amount: Decimal.new("500")
      })

    before_quota = expense(ctx, ctx.wash, ~D[2026-09-20], "40")
    oct_early = expense(ctx, ctx.wash, ~D[2026-10-02], "30")
    oct_in_budget = expense(ctx, ctx.wash, ~D[2026-10-10], "30", %{counts_in_budget: true})
    nov = expense(ctx, ctx.wash, ~D[2026-11-12], "60", %{source: "bill"})
    after_end = expense(ctx, ctx.wash, ~D[2027-01-10], "30")
    gift_nov = expense(ctx, ctx.gift, ~D[2026-11-20], "200")
    gift_dec = expense(ctx, ctx.gift, ~D[2026-12-02], "50")
    unrelated = expense(ctx, ctx.other, ~D[2026-11-12], "99")

    counts = QuotaConversion.run("test")
    assert counts == %{quotas: 2, expenses_linked: 4}

    assert reload(before_quota).quota_id == nil
    assert reload(oct_early).quota_id == recurring.id
    assert reload(oct_in_budget).quota_id == recurring.id
    assert reload(nov).quota_id == recurring.id
    assert reload(after_end).quota_id == nil
    assert reload(gift_nov).quota_id == one_off.id
    assert reload(gift_dec).quota_id == nil
    assert reload(unrelated).quota_id == nil

    # Only quota_id changed on the linked rows.
    linked = reload(oct_in_budget)

    assert linked.counts_in_budget and linked.date == ~D[2026-10-10] and
             Decimal.equal?(linked.amount, Decimal.new("30"))

    # Card closing on the 5th: calendar month M → invoice M + 1.
    r = reload(recurring)
    assert r.per_invoice and r.last_month == ~D[2027-01-01] and r.once_month == nil
    o = reload(one_off)
    assert o.per_invoice and o.once_month == ~D[2026-12-01]
    assert r.subcategory_id == ctx.wash.id and Decimal.equal?(r.amount, Decimal.new("150"))

    # The November gift (20/11) is in the December invoice, where the quota now is.
    o = Repo.preload(o, :account)
    assert Decimal.equal?(Quotas.spent(o, {2026, 12}), Decimal.new("200"))

    # Idempotent.
    assert QuotaConversion.run("test") == %{quotas: 0, expenses_linked: 0}
  end

  test "a quota on an account keeps its calendar months; inactive quotas link nothing", ctx do
    account_quota =
      legacy_quota(ctx, %{
        subcategory_id: ctx.wash.id,
        account_id: ctx.checking.id,
        once_month: ~D[2026-11-01]
      })

    inactive = legacy_quota(ctx, %{subcategory_id: ctx.gift.id, active: false})
    e = expense(ctx, ctx.gift, ~D[2026-11-10], "10")

    QuotaConversion.run("test")
    assert reload(account_quota).once_month == ~D[2026-11-01]
    assert reload(inactive).per_invoice
    assert reload(e).quota_id == nil
  end

  test "revert puts quotas and expenses back exactly", ctx do
    quota = legacy_quota(ctx, %{subcategory_id: ctx.wash.id, once_month: ~D[2026-11-01]})
    e = expense(ctx, ctx.wash, ~D[2026-11-10], "10")
    already = expense(ctx, ctx.wash, ~D[2026-11-11], "10")

    {:ok, new_quota} =
      PlanfinBackend.Finance.Bills.create_bill(ctx.group.id, %{
        name: "Nova",
        amount: Decimal.new("10"),
        due_day: 1,
        account_id: ctx.card.id,
        kind: "quota"
      })

    Repo.update!(Ecto.Changeset.change(already, quota_id: new_quota.id))

    QuotaConversion.run("test")
    assert reload(e).quota_id == quota.id
    assert reload(already).quota_id == new_quota.id

    assert QuotaConversion.revert("test") == %{quotas: 1, expenses_unlinked: 1}
    q = reload(quota)
    refute q.per_invoice
    assert q.once_month == ~D[2026-11-01]
    assert reload(e).quota_id == nil
    assert reload(already).quota_id == new_quota.id
    assert QuotaConversion.revert("test") == %{quotas: 0, expenses_unlinked: 0}
  end

  test "a linked purchase already in the budget fills the quota without adding excess", ctx do
    {:ok, period} =
      Periods.create_period(
        ctx.group.id,
        %{
          start_date: ~D[2026-11-05],
          end_date: ~D[2026-12-04],
          daily_limit: Decimal.new("100"),
          total_budget: Decimal.new("3000")
        },
        ~D[2026-11-05]
      )

    _quota = legacy_quota(ctx, %{subcategory_id: ctx.wash.id, amount: Decimal.new("50")})

    in_budget =
      expense(ctx, ctx.wash, ~D[2026-11-10], "80", %{counts_in_budget: true, period_id: period.id})

    QuotaConversion.run("test")
    assert reload(in_budget).quota_id

    # 80 already counts in the day; the 30 over the quota is not added again.
    assert Decimal.equal?(
             BudgetDays.get_total_spent_for_day(ctx.group.id, ~D[2026-11-10]),
             Decimal.new("80")
           )
  end
end
