defmodule PlanfinBackend.Finance.Panel do
  @moduledoc """
  The "Dinheiro livre" panel:

      Tenho        = live balance of the primary account
      Comprometido = what must leave that account until `horizon`
                     (card invoices due by then + bills paid from accounts)
      Posso gastar = Tenho − Comprometido (may be negative)

  `horizon` is the day before the next money arrives (the next salary once it is
  configured, otherwise the end of the current period).
  """

  alias PlanfinBackend.Finance
  alias PlanfinBackend.Finance.{Bills, Calendar, Invoices}

  @doc """
  Last day before the next money arrives: the end of the active period, or 30
  days ahead when there is none.
  """
  def default_horizon(group_id, today) do
    case PlanfinBackend.Periods.get_active_period(group_id) do
      {:ok, %{end_date: end_date}} ->
        if Date.compare(end_date, today) == :lt, do: Date.add(today, 30), else: end_date

      _ ->
        Date.add(today, 30)
    end
  end

  def build(group_id, today, %Date{} = horizon) do
    accounts = Finance.list_accounts(group_id)
    primary = Enum.find(accounts, & &1.is_primary)
    cards = Enum.filter(accounts, &(&1.kind == "credit_card"))

    invoice_items = Enum.flat_map(cards, &invoice_commitments(&1, today, horizon))
    bill_items = bill_commitments(group_id, today, horizon)
    commitments = Enum.sort_by(invoice_items ++ bill_items, & &1.due_date, Date)
    committed = Enum.reduce(commitments, Decimal.new("0"), &Decimal.add(&2, &1.amount))
    available = primary && Finance.account_balance(primary, today)

    %{
      has_accounts: accounts != [],
      primary_account_id: primary && primary.id,
      available: available,
      committed: committed,
      free: available && Decimal.sub(available, committed),
      horizon_date: horizon,
      commitments: commitments
    }
  end

  defp invoice_commitments(card, today, horizon) do
    current = Invoices.current_month(card, today)

    for offset <- -3..1,
        invoice = Invoices.build(card, Calendar.add_months(current, offset), today),
        Decimal.compare(invoice.remaining, 0) == :gt,
        Date.compare(invoice.due_date, horizon) != :gt do
      %{
        kind: "invoice",
        label: "Fatura #{card.name}",
        due_date: invoice.due_date,
        amount: invoice.remaining,
        status: invoice.status,
        card_id: card.id,
        bill_id: nil,
        month: invoice.month
      }
    end
  end

  defp bill_commitments(group_id, today, horizon) do
    group_id
    |> Bills.pending_until(today, horizon, ["checking", "allowance", "reserve"])
    |> Enum.map(fn occ ->
      %{
        kind: "bill",
        label: occ.bill.name,
        due_date: occ.due_date,
        amount: occ.amount,
        status: occ.status,
        card_id: nil,
        bill_id: occ.bill.id,
        month: occ.month
      }
    end)
  end
end
