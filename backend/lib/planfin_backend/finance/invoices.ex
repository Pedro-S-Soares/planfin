defmodule PlanfinBackend.Finance.Invoices do
  @moduledoc """
  Credit card invoices, computed from the card's entries (never stored).

  An invoice is identified by its month `{year, month}`: it closes on
  `closing_day` of that month and gathers the entries dated from the previous
  closing day (inclusive) up to the day before its own closing day. A purchase
  made on the closing day itself already belongs to the next invoice.

  The due date is `due_day` of the same month when `due_day > closing_day`,
  otherwise of the next month, moved to the next bank business day.

  Payments are `card_payment` transfers into the card tagged with the invoice
  month.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Finance.{Account, Calendar, Transfer}
  alias PlanfinBackend.Expenses.Expense

  @doc "Invoice month that receives an entry dated `date`."
  def month_for(%Account{closing_day: closing_day}, %Date{} = date) do
    if date.day < closing_day,
      do: {date.year, date.month},
      else: Calendar.add_months({date.year, date.month}, 1)
  end

  def closing_date(%Account{closing_day: closing_day}, {year, month}),
    do: Date.new!(year, month, closing_day)

  @doc "First day covered by the invoice (the previous closing date)."
  def start_date(card, month), do: closing_date(card, Calendar.add_months(month, -1))

  def due_date(%Account{closing_day: closing_day, due_day: due_day}, month) do
    {year, mon} = if due_day > closing_day, do: month, else: Calendar.add_months(month, 1)
    Calendar.next_bank_business_day(Date.new!(year, mon, due_day))
  end

  @doc "First day of the invoice month, the value stored in `transfers.invoice_month`."
  def month_date({year, month}), do: Date.new!(year, month, 1)

  def parse_month(<<year::binary-size(4), "-", month::binary-size(2)>>) do
    with {y, ""} <- Integer.parse(year),
         {m, ""} <- Integer.parse(month),
         true <- m in 1..12 do
      {:ok, {y, m}}
    else
      _ -> {:error, :invalid_month}
    end
  end

  def parse_month(_), do: {:error, :invalid_month}

  def format_month({year, month}),
    do: "#{year}-#{String.pad_leading(Integer.to_string(month), 2, "0")}"

  @doc """
  Builds the invoice of `month` for `card` as of `today`:

    * `total` — purchases minus refunds (income entries on the card)
    * `paid` — payments tagged with this month
    * `remaining` — what is still owed (never negative)
    * `status` — `open` (still accepting purchases), `closed` (to pay),
      `partial`, `paid` or `overdue` (past due and not fully paid)

  With `with_entries: true` the invoice also carries its entries.
  """
  def build(%Account{kind: "credit_card"} = card, month, today, opts \\ []) do
    start = start_date(card, month)
    closing = closing_date(card, month)
    due = due_date(card, month)

    entries_query =
      Expense
      |> where([e], e.account_id == ^card.id and e.date >= ^start and e.date < ^closing)

    {spent, refunded} = sums(entries_query)
    total = Decimal.sub(spent, refunded)
    paid = paid_for(card, month)
    remaining = Decimal.max(Decimal.sub(total, paid), Decimal.new("0"))

    invoice = %{
      card_id: card.id,
      month: month,
      start_date: start,
      closing_date: closing,
      due_date: due,
      total: total,
      paid: paid,
      remaining: remaining,
      status: status(today, closing, due, total, paid)
    }

    if Keyword.get(opts, :with_entries, false) do
      entries =
        entries_query
        |> order_by([e], desc: e.date, desc: e.inserted_at)
        |> preload([:created_by, :account, subcategory: :category])
        |> Repo.all()

      Map.put(invoice, :entries, entries)
    else
      invoice
    end
  end

  defp status(today, closing, due, total, paid) do
    cond do
      Date.compare(today, closing) == :lt -> "open"
      Decimal.compare(total, 0) != :gt -> "paid"
      Decimal.compare(paid, total) != :lt -> "paid"
      Date.compare(today, due) == :gt -> "overdue"
      Decimal.compare(paid, 0) == :gt -> "partial"
      true -> "closed"
    end
  end

  defp sums(query) do
    query
    |> group_by([e], e.type)
    |> select([e], {e.type, sum(e.amount)})
    |> Repo.all()
    |> Map.new()
    |> then(fn by_type ->
      {Map.get(by_type, "expense") || Decimal.new("0"),
       Map.get(by_type, "income") || Decimal.new("0")}
    end)
  end

  defp paid_for(card, month) do
    month_date = month_date(month)

    Transfer
    |> where([t], t.to_account_id == ^card.id and t.invoice_month == ^month_date)
    |> select([t], sum(t.amount))
    |> Repo.one()
    |> Kernel.||(Decimal.new("0"))
  end

  @doc "The invoice currently receiving purchases."
  def current_month(card, today), do: month_for(card, today)

  @doc """
  Invoices around today: `past` closed months before the current one, the
  current one, and every future month that already has entries (installments),
  up to `future` months ahead. Oldest first.
  """
  def list(card, today, past \\ 3, future \\ 12) do
    current = current_month(card, today)

    future_with_entries =
      future_months_with_entries(card, current, future)

    months =
      (Enum.map(past..1//-1, &Calendar.add_months(current, -&1)) ++ [current]) ++
        future_with_entries

    Enum.map(months, &build(card, &1, today))
  end

  defp future_months_with_entries(_card, _current, 0), do: []

  defp future_months_with_entries(card, current, future) do
    next = Calendar.add_months(current, 1)
    from = start_date(card, next)
    to = closing_date(card, Calendar.add_months(current, future))

    Expense
    |> where([e], e.account_id == ^card.id and e.date >= ^from and e.date < ^to)
    |> select([e], e.date)
    |> distinct(true)
    |> Repo.all()
    |> Enum.map(&month_for(card, &1))
    |> Enum.uniq()
    |> Enum.sort()
  end

  @doc """
  The most recent invoice whose closing date has passed (the one to pay now),
  or `nil` when the card has no closed invoice with a balance.
  """
  def last_closed(card, today) do
    build(card, Calendar.add_months(current_month(card, today), -1), today)
  end
end
