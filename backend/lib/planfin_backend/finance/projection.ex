defmodule PlanfinBackend.Finance.Projection do
  @moduledoc """
  How much of the next salary is already spoken for.

  The next salary pays everything due during the cycle it opens:

    * card invoices due in that cycle — what is already on them (purchases so
      far, installments) plus card bills that will still be charged before
      the invoice closes;
    * bills paid from accounts due in that cycle.

  `left` is what would remain of the next salary if nothing else were bought.
  Returns `nil` when the salary is not configured.
  """

  alias PlanfinBackend.Finance
  alias PlanfinBackend.Finance.{Bills, Calendar, Invoices, Salary}

  def build(group_id, today) do
    settings = Salary.get_settings(group_id)

    if Salary.configured?(settings) do
      next = Salary.next_cycle(group_id, today)
      cards = group_id |> Finance.list_accounts() |> Enum.filter(&(&1.kind == "credit_card"))
      occurrences = occurrences_around(group_id, next, today)

      invoices = Enum.flat_map(cards, &card_items(&1, next, today, occurrences))

      account_bills =
        occurrences
        |> Enum.filter(fn occ ->
          occ.bill.account.kind != "credit_card" and occ.status in ["pending", "overdue"] and
            in_range?(occ.due_date, next.start_date, next.end_date)
        end)
        |> sum_by(& &1.amount)

      card_total = sum_by(invoices, &Decimal.add(&1.amount, &1.pending_bills))
      committed = Decimal.add(card_total, account_bills)

      %{
        salary_date: next.start_date,
        cycle_end_date: next.end_date,
        salary: settings.salary_amount,
        invoices: invoices,
        account_bills: account_bills,
        committed: committed,
        left: Decimal.sub(settings.salary_amount, committed)
      }
    end
  end

  # Invoices of `card` due inside the cycle opened by the next salary.
  defp card_items(card, next, today, occurrences) do
    month = Invoices.month_for(card, next.start_date)

    for m <- [Calendar.add_months(month, -1), month, Calendar.add_months(month, 1)],
        invoice = Invoices.build(card, m, today),
        in_range?(invoice.due_date, next.start_date, next.end_date) do
      pending_bills =
        occurrences
        |> Enum.filter(fn occ ->
          occ.bill.account_id == card.id and occ.status in ["pending", "overdue"] and
            in_range?(occ.due_date, invoice.start_date, Date.add(invoice.closing_date, -1))
        end)
        |> sum_by(& &1.amount)

      %{
        card_id: card.id,
        card_name: card.name,
        month: m,
        due_date: invoice.due_date,
        status: invoice.status,
        amount: invoice.remaining,
        pending_bills: pending_bills
      }
    end
  end

  defp occurrences_around(group_id, next, today) do
    first = Calendar.add_months({next.start_date.year, next.start_date.month}, -2)
    last = {next.end_date.year, next.end_date.month}

    first
    |> Stream.iterate(&Calendar.add_months(&1, 1))
    |> Enum.take_while(&(&1 <= last))
    |> Enum.flat_map(&Bills.occurrences(group_id, &1, today))
  end

  defp in_range?(date, from, to),
    do: Date.compare(date, from) != :lt and Date.compare(date, to) != :gt

  defp sum_by(items, fun), do: Enum.reduce(items, Decimal.new("0"), &Decimal.add(&2, fun.(&1)))
end
