defmodule PlanfinBackend.Finance.Installments do
  @moduledoc """
  Where the parcels of a card purchase go, the way the bank does it.

  Parcel 1 keeps the purchase date and lands on that date's invoice. Parcel k
  (k ≥ 2) belongs to the invoice `first + k − 1` and is dated on that invoice's
  opening day (the previous closing date), so it shows up in it as soon as it
  opens. A parcel's invoice is still decided by its date (`Invoices.month_for/2`),
  like any card entry.

  Before this rule a parcel was dated at the purchase date plus k − 1 months:
  when the card's closing day changed afterwards (or a short month clamped the
  day), the date fell on the other side of the closing and the parcel showed up
  in the previous invoice. `plan/2` and `apply_plan/2` recompute existing
  parcels with the rule; `realign_card/2` and `realign_purchase/2` keep them
  right when a card's closing day or a first parcel's date changes.

  Invoices already settled — with a payment or a total typed from the bank
  (`invoice_adjustment`) — are never changed: a parcel that would move out of or
  into one is left as it is and reported (`:skipped_locked`). Every change is
  written to `installment_fix_audit` first, so it can be reverted (`revert/1`).
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Account, Calendar, Invoices}

  @doc "Date of parcel `number` of a purchase whose parcel 1 is on `first_invoice`."
  def parcel_date(_card, _first_invoice, 1, first_date), do: first_date

  def parcel_date(%Account{} = card, first_invoice, number, _first_date),
    do: Invoices.start_date(card, Calendar.add_months(first_invoice, number - 1))

  @doc """
  The changes the rule asks for, without applying them. `scope`:
  `:all`, `{:card, card_id}` or `{:purchase, installment_group_id}`. Each item:
  `%{expense, card, number, old_date, new_date, old_invoice, new_invoice,
  action, reason}` with action `:move` (changes invoice), `:redate` (same
  invoice, opening date) or `:skipped_locked`.
  """
  def plan(scope, %Date{} = today) do
    scope
    |> parcels_query()
    |> Repo.all()
    |> Enum.group_by(& &1.installment_group_id)
    |> Enum.flat_map(fn {_purchase, parcels} -> plan_purchase(parcels, today) end)
    |> Enum.sort_by(&{&1.expense.installment_group_id, &1.number})
  end

  defp parcels_query(scope) do
    base =
      Expense
      |> join(:inner, [e], a in Account, on: a.id == e.account_id and a.kind == "credit_card")
      |> where(
        [e],
        not is_nil(e.installment_group_id) and not is_nil(e.installment_number) and
          e.type == "expense"
      )
      # Explicit columns: this runs inside a migration, so it must not depend on
      # columns added to the schemas later.
      |> select([e, a], %{
        id: e.id,
        date: e.date,
        amount: e.amount,
        note: e.note,
        installment_group_id: e.installment_group_id,
        installment_number: e.installment_number,
        installment_count: e.installment_count,
        account: %Account{
          id: a.id,
          name: a.name,
          kind: a.kind,
          closing_day: a.closing_day,
          due_day: a.due_day
        }
      })

    case scope do
      :all -> base
      {:card, card_id} -> where(base, [e], e.account_id == ^card_id)
      {:purchase, group_uuid} -> where(base, [e], e.installment_group_id == ^group_uuid)
    end
  end

  # The lowest parcel anchors the purchase: parcel 1 (the purchase date) or, for a
  # purchase typed after some parcels were paid, the first one created.
  defp plan_purchase(parcels, today) do
    [anchor | _] = parcels = Enum.sort_by(parcels, & &1.installment_number)
    card = anchor.account
    anchor_invoice = Invoices.month_for(card, anchor.date)

    parcels
    |> Enum.filter(&(&1.installment_number >= 2))
    |> Enum.flat_map(fn parcel ->
      invoice =
        Calendar.add_months(anchor_invoice, parcel.installment_number - anchor.installment_number)

      new_date = Invoices.start_date(card, invoice)
      old_invoice = Invoices.month_for(card, parcel.date)

      cond do
        parcel.date == new_date ->
          []

        old_invoice == invoice ->
          [item(parcel, card, new_date, old_invoice, invoice, :redate, nil)]

        reason = locked_reason(card, old_invoice, invoice, today) ->
          [item(parcel, card, new_date, old_invoice, invoice, :skipped_locked, reason)]

        true ->
          [item(parcel, card, new_date, old_invoice, invoice, :move, nil)]
      end
    end)
  end

  defp item(parcel, card, new_date, old_invoice, new_invoice, action, reason) do
    %{
      expense: parcel,
      card: card,
      number: parcel.installment_number,
      old_date: parcel.date,
      new_date: new_date,
      old_invoice: old_invoice,
      new_invoice: new_invoice,
      action: action,
      reason: reason
    }
  end

  # An invoice with a payment or a total typed from the bank is settled history.
  defp locked_reason(card, old_invoice, new_invoice, today) do
    Enum.find_value([{old_invoice, "sairia da"}, {new_invoice, "entraria na"}], fn {month, verb} ->
      invoice = Invoices.build(card, month, today)

      cond do
        Decimal.compare(invoice.paid, 0) == :gt ->
          "#{verb} fatura #{Invoices.format_month(month)}, que já tem pagamento"

        adjusted?(card, month) ->
          "#{verb} fatura #{Invoices.format_month(month)}, que tem o total ajustado pelo banco"

        true ->
          nil
      end
    end)
  end

  defp adjusted?(card, month) do
    start = Invoices.start_date(card, month)
    closing = Invoices.closing_date(card, month)

    Expense
    |> where(
      [e],
      e.account_id == ^card.id and e.source == "invoice_adjustment" and e.date >= ^start and
        e.date < ^closing
    )
    |> Repo.exists?()
  end

  @doc """
  Writes the audit rows of the plan (all of it, skipped items included) and
  re-dates the `:move` and `:redate` parcels, in one transaction. Only the date
  of installment rows 2..n changes. Returns a summary.
  """
  def apply_plan(plan, origin) do
    run_at = DateTime.utc_now() |> DateTime.truncate(:second)

    {:ok, _} =
      Repo.transaction(fn ->
        Enum.each(plan, fn item ->
          Repo.insert_all("installment_fix_audit", [
            %{
              run_at: run_at,
              origin: origin,
              expense_id: dump_uuid(item.expense.id),
              installment_group_id: dump_uuid(item.expense.installment_group_id),
              installment_number: item.number,
              account_id: dump_uuid(item.card.id),
              old_date: item.old_date,
              new_date: item.new_date,
              old_invoice: Invoices.format_month(item.old_invoice),
              new_invoice: Invoices.format_month(item.new_invoice),
              action: Atom.to_string(item.action),
              reason: item.reason
            }
          ])

          if item.action in [:move, :redate] do
            Expense
            |> where([e], e.id == ^item.expense.id and e.date == ^item.old_date)
            |> Repo.update_all(
              set: [date: item.new_date, updated_at: NaiveDateTime.utc_now(:second)]
            )
          end
        end)
      end)

    summary(plan, run_at)
  end

  defp dump_uuid(id), do: Ecto.UUID.dump!(id)

  @doc "Counts of a plan: moved, re-dated, skipped and the purchases touched."
  def summary(plan, run_at \\ nil) do
    by = Enum.frequencies_by(plan, & &1.action)

    %{
      run_at: run_at,
      moved: Map.get(by, :move, 0),
      redated: Map.get(by, :redate, 0),
      skipped_locked: Map.get(by, :skipped_locked, 0),
      purchases: plan |> Enum.map(& &1.expense.installment_group_id) |> Enum.uniq() |> length(),
      items: plan
    }
  end

  @doc "Recomputes the parcels of one card (after its closing day changed)."
  def realign_card(card_id, today \\ Date.utc_today()),
    do: {:card, card_id} |> plan(today) |> apply_plan("closing_day_change")

  @doc "Recomputes the later parcels of one purchase (after its first parcel moved)."
  def realign_purchase(group_uuid, today \\ Date.utc_today()),
    do: {:purchase, group_uuid} |> plan(today) |> apply_plan("first_parcel_edit")

  @doc """
  Puts back the dates changed by the runs of `origin` (or all, with nil) that
  were not reverted yet — only where the row still has the date the fix gave it.
  """
  def revert(origin \\ nil) do
    rows =
      from(a in "installment_fix_audit",
        where: a.action in ["move", "redate"] and is_nil(a.reverted_at),
        select: %{id: a.id, expense_id: a.expense_id, old_date: a.old_date, new_date: a.new_date}
      )
      |> then(fn q -> if origin, do: where(q, [a], a.origin == ^origin), else: q end)
      |> Repo.all()

    now = DateTime.utc_now() |> DateTime.truncate(:second)

    {:ok, count} =
      Repo.transaction(fn ->
        Enum.reduce(rows, 0, fn row, acc ->
          id = Ecto.UUID.cast!(row.expense_id)

          {n, _} =
            Expense
            |> where([e], e.id == ^id and e.date == ^row.new_date)
            |> Repo.update_all(
              set: [date: row.old_date, updated_at: NaiveDateTime.utc_now(:second)]
            )

          from(a in "installment_fix_audit", where: a.id == ^row.id)
          |> Repo.update_all(set: [reverted_at: now])

          acc + n
        end)
      end)

    count
  end

  @doc "Human summary for the release output."
  def report(%{
        moved: moved,
        redated: redated,
        skipped_locked: skipped,
        purchases: purchases,
        items: items
      }) do
    header =
      "Parcelas: #{moved} mudaram de fatura, #{redated} só mudaram de data (mesma fatura), " <>
        "#{skipped} não mexidas (fatura com pagamento/ajuste), em #{purchases} compras."

    # Per purchase: card, short id and counts only (no descriptions or amounts in logs).
    lines =
      items
      |> Enum.group_by(& &1.expense.installment_group_id)
      |> Enum.map(fn {group_uuid, [first | _] = list} ->
        counts =
          list
          |> Enum.frequencies_by(& &1.action)
          |> Enum.map_join(", ", fn {action, n} -> "#{action}: #{n}" end)

        skipped =
          list
          |> Enum.filter(&(&1.action == :skipped_locked))
          |> Enum.map_join("", fn i -> "\n    parcela #{i.number}: #{i.reason}" end)

        "  #{first.card.name} · compra #{String.slice(group_uuid, 0, 8)} · #{counts}#{skipped}"
      end)

    Enum.join([header | lines], "\n")
  end
end
