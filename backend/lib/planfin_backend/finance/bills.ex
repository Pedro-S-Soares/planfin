defmodule PlanfinBackend.Finance.Bills do
  @moduledoc """
  Recurring bills and their monthly occurrences.

  An occurrence is `{bill, month}`. It is `paid` once a `BillPayment` links it
  to the entry that paid it; otherwise it is `pending`, or `overdue` after its
  due date. Paying creates an entry outside the daily budget (fixed bills were
  already taken out of the period budget), on the bill's account or card.

  Bills on a card are charged automatically on their due date
  (`charge_due_card_bills/2`), landing on the invoice of that date. Removing
  such a charge marks the month as `skipped` so it is not charged again.

  A quota bill (`kind: "quota"`) is a monthly spending allowance consumed by
  the month's expenses of its subcategory: while the month runs it is
  `pending` with `amount` = what is left of it (never negative), and it turns
  `paid` once used up or when the month ends, with `amount` = what was spent.
  It is never charged nor paid.

  A recurring bill with `last_month` has no occurrence after that month: it
  leaves the plan, the commitments and the automatic charge from then on,
  while the months up to it stay as they were.

  Any bill can be skipped in one month (`skip/5`, with an optional note): the
  month leaves the commitments, the plan and the automatic charge, and the
  bill comes back the following month.

  A bill exists every month from the month it was created on, whatever its
  day: a bill created on the 3rd with day 1 already has this month's
  occurrence, pending until the user marks it paid. Only the automatic card
  charge waits for a due date after the bill was created: a card occurrence
  due before that is `before_start` (the purchase was already on the invoice
  when the bill was registered) and is not charged nor shown as owed.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Expenses, Repo}
  alias PlanfinBackend.Finance.{Account, BillPayment, Calendar, Invoices, Quotas, RecurringBill}

  def list_bills(group_id) do
    RecurringBill
    |> where([b], b.group_id == ^group_id and b.active == true)
    |> order_by([b], asc: b.due_day, asc: b.name)
    |> preload([:account, subcategory: :category])
    |> Repo.all()
  end

  def get_bill(group_id, bill_id) do
    case Repo.get_by(RecurringBill, id: bill_id, group_id: group_id) do
      nil -> {:error, :not_found}
      bill -> {:ok, Repo.preload(bill, [:account, subcategory: :category])}
    end
  end

  def create_bill(group_id, attrs) do
    with :ok <- validate_account(group_id, attrs[:account_id], attrs[:direction]) do
      %RecurringBill{}
      |> RecurringBill.changeset(attrs |> Map.put(:group_id, group_id) |> invoice_model())
      |> Repo.insert()
      |> preload_bill()
    end
  end

  def update_bill(%RecurringBill{} = bill, attrs) do
    with :ok <-
           validate_account(
             bill.group_id,
             Map.get(attrs, :account_id, bill.account_id),
             Map.get(attrs, :direction, bill.direction)
           ) do
      Repo.transaction(fn ->
        with {:ok, updated} <-
               bill
               |> RecurringBill.changeset(attrs |> Map.drop([:group_id]) |> invoice_model(bill))
               |> Repo.update(),
             :ok <- sync_one_off_entry(bill, updated) do
          updated
        else
          {:error, reason} -> Repo.rollback(reason)
        end
      end)
      |> preload_bill()
    end
  end

  # Every quota created or saved from now on is in the invoice model; a legacy
  # quota converts when it is edited (its old purchases are left as they are).
  defp invoice_model(attrs, bill \\ %RecurringBill{}) do
    if Map.get(attrs, :kind, bill.kind) == "quota",
      do: Map.put(attrs, :per_invoice, true),
      else: attrs
  end

  # A one-off item has a single occurrence: once paid (or charged on the card) that
  # occurrence *is* the entry it created, and the lists show the entry's amount. So an
  # edit of the item carries to that entry, or the edit would not show anywhere.
  # Only what changed is carried, so a note edited in the history is kept. A recurring
  # item is not touched: its paid months keep the real amount, the edit is for the next.
  defp sync_one_off_entry(
         %RecurringBill{once_month: month} = before,
         %RecurringBill{once_month: month} = after_
       )
       when not is_nil(month) do
    attrs =
      %{}
      |> put_changed(:amount, before.amount, after_.amount)
      |> put_changed(:note, before.name, after_.name)
      |> put_changed(:subcategory_id, before.subcategory_id, after_.subcategory_id)
      |> put_changed(:account_id, before.account_id, after_.account_id)

    case {attrs == %{}, Repo.get_by(BillPayment, bill_id: after_.id, month: month)} do
      {false, %BillPayment{expense_id: expense_id}} when not is_nil(expense_id) ->
        case Expenses.update_expense(after_.group_id, expense_id, attrs) do
          {:ok, _expense} -> :ok
          {:error, reason} -> {:error, reason}
        end

      _ ->
        :ok
    end
  end

  defp sync_one_off_entry(_before, _after), do: :ok

  defp put_changed(attrs, key, before, after_) do
    same? =
      case {before, after_} do
        {%Decimal{} = a, %Decimal{} = b} -> Decimal.equal?(a, b)
        {a, b} -> a == b
      end

    if same?, do: attrs, else: Map.put(attrs, key, after_)
  end

  def deactivate_bill(%RecurringBill{} = bill) do
    bill |> Ecto.Changeset.change(active: false) |> Repo.update()
  end

  defp validate_account(_group_id, nil, _direction), do: {:error, :account_not_found}

  defp validate_account(group_id, account_id, direction) do
    case Repo.get_by(Account, id: account_id, group_id: group_id) do
      nil -> {:error, :account_not_found}
      %Account{kind: "credit_card"} when direction == "income" -> {:error, :income_on_card}
      _ -> :ok
    end
  end

  defp preload_bill({:ok, bill}),
    do: {:ok, Repo.preload(bill, [:account, subcategory: :category], force: true)}

  defp preload_bill(error), do: error

  @doc """
  Due date of the bill in `{year, month}`, clamped to the month's last day. A
  planned one-off without a day falls on the last purchase day of its invoice
  (card) or on the last day of its month: it counts there until realized.
  """
  def due_date(
        %RecurringBill{no_due_day: true, account: %Account{kind: "credit_card"} = card},
        month
      ),
      do: Date.add(Invoices.closing_date(card, month), -1)

  def due_date(%RecurringBill{no_due_day: true}, {year, month}),
    do: Date.end_of_month(Date.new!(year, month, 1))

  def due_date(%RecurringBill{due_day: day}, {year, month}) do
    Date.new!(year, month, min(day, Elixir.Calendar.ISO.days_in_month(year, month)))
  end

  @doc "Occurrences of every active bill in `month`, ordered by due date."
  def occurrences(group_id, month, today) do
    bills = list_bills(group_id)
    payments = payments_for(group_id, [month])

    bills
    |> Enum.filter(&exists_in?(&1, month))
    |> Enum.map(&occurrence(&1, month, payments, today))
    |> Enum.sort_by(&{&1.due_date, &1.bill.name}, fn {d1, n1}, {d2, n2} ->
      case Date.compare(d1, d2) do
        :eq -> n1 <= n2
        cmp -> cmp == :lt
      end
    end)
  end

  @doc """
  Unpaid occurrences of bills paid from `account_kinds` with due date up to
  `horizon`, from the month before `today` on. Used for "money already committed".
  """
  def pending_until(group_id, today, horizon, account_kinds) do
    months =
      months_between(
        Calendar.add_months({today.year, today.month}, -1),
        {horizon.year, horizon.month}
      )

    bills =
      group_id
      |> list_bills()
      |> Enum.filter(&(&1.direction == "expense" and &1.account.kind in account_kinds))

    payments = payments_for(group_id, months)

    for month <- months,
        bill <- bills,
        exists_in?(bill, month),
        occ = occurrence(bill, month, payments, today),
        occ.status in ["pending", "overdue"],
        Date.compare(occ.due_date, horizon) != :gt do
      occ
    end
  end

  @doc "Estimated amount of the recurring bills paid from `account_kinds` in a month."
  def monthly_total(group_id, account_kinds) do
    group_id
    |> recurring_expenses(account_kinds)
    |> Enum.reduce(Decimal.new("0"), &Decimal.add(&2, &1.amount))
  end

  @doc """
  Recurring (every month) expense bills paid from `account_kinds` that still
  happen in the month of `today`.
  """
  def recurring_expenses(group_id, account_kinds, today \\ Date.utc_today()) do
    month = {today.year, today.month}

    group_id
    |> list_bills()
    |> Enum.filter(fn b ->
      b.direction == "expense" and is_nil(b.once_month) and b.account.kind in account_kinds and
        (is_nil(b.last_month) or month <= {b.last_month.year, b.last_month.month})
    end)
  end

  @doc "Whether the bill has an occurrence in `month` (for a card quota: the invoice month)."
  def exists_in?(%RecurringBill{once_month: %Date{} = once}, month),
    do: {once.year, once.month} == month

  # A card quota starts in the invoice that was open when it was created.
  def exists_in?(
        %RecurringBill{kind: "quota", account: %Account{kind: "credit_card"} = card} = quota,
        month
      ) do
    first = Invoices.month_for(card, NaiveDateTime.to_date(quota.inserted_at))
    last = quota.last_month
    first <= month and (is_nil(last) or month <= {last.year, last.month})
  end

  def exists_in?(%RecurringBill{inserted_at: inserted_at, last_month: last}, month) do
    {inserted_at.year, inserted_at.month} <= month and
      (is_nil(last) or month <= {last.year, last.month})
  end

  # A due date that passed before the bill was registered may already be on
  # the card; it is shown as pending but never charged automatically.
  defp auto_chargeable?(%RecurringBill{inserted_at: inserted_at}, due),
    do: Date.compare(due, NaiveDateTime.to_date(inserted_at)) != :lt

  # A quota is spent by the purchases linked to it in its invoice (card) or
  # month: pending while there is money left and its purchase days last.
  defp occurrence(%RecurringBill{kind: "quota"} = bill, month, payments, today) do
    payment = Map.get(payments, {bill.id, month})
    %{spent: spent, remaining: remaining, ends_on: ends_on} = Quotas.status(bill, month)

    status =
      cond do
        payment -> "skipped"
        Date.compare(today, ends_on) == :gt -> "paid"
        Decimal.compare(remaining, 0) == :eq -> "paid"
        true -> "pending"
      end

    %{
      bill: bill,
      month: month,
      due_date: due_date(bill, month),
      next_due_date: due_date(bill, Calendar.add_months(month, 1)),
      status: status,
      paid_on: nil,
      amount: if(status == "pending", do: remaining, else: spent),
      expense_id: nil,
      note: payment && payment.note,
      quota_spent: spent
    }
  end

  defp occurrence(bill, month, payments, today) do
    due = due_date(bill, month)
    payment = Map.get(payments, {bill.id, month})
    expense = payment && payment.expense

    status =
      cond do
        expense -> "paid"
        payment -> "skipped"
        card?(bill) and not bill.no_due_day and not auto_chargeable?(bill, due) -> "before_start"
        Date.compare(today, due) == :gt -> "overdue"
        true -> "pending"
      end

    %{
      bill: bill,
      month: month,
      due_date: due,
      next_due_date: due_date(bill, Calendar.add_months(month, 1)),
      status: status,
      paid_on: expense && expense.date,
      amount: if(expense, do: expense.amount, else: bill.amount),
      expense_id: expense && expense.id,
      note: payment && is_nil(expense) && payment.note,
      quota_spent: nil
    }
  end

  # A planned one-off without a day is never charged by itself: it waits for the purchase.
  defp card?(%RecurringBill{no_due_day: true}), do: false

  defp card?(%RecurringBill{
         kind: "fixed",
         direction: "expense",
         account: %Account{kind: "credit_card"}
       }),
       do: true

  defp card?(_bill), do: false

  @doc """
  Charges on the card every card bill whose due date has arrived and that was
  neither charged nor skipped, looking back two months. Idempotent: a month is
  charged at most once even with concurrent calls.
  """
  def charge_due_card_bills(group_id, %Date{} = today) do
    bills = group_id |> list_bills() |> Enum.filter(&card?/1)

    if bills != [] do
      current = {today.year, today.month}
      months = months_between(Calendar.add_months(current, -2), current)
      payments = payments_for(group_id, months)
      owner_id = Repo.get!(PlanfinBackend.Groups.Group, group_id).owner_id

      for month <- months,
          bill <- bills,
          exists_in?(bill, month),
          not Map.has_key?(payments, {bill.id, month}),
          due = due_date(bill, month),
          auto_chargeable?(bill, due),
          Date.compare(due, today) != :gt do
        pay(group_id, owner_id, bill, month, bill.amount, due)
      end
    end

    :ok
  end

  defp payments_for(group_id, months) do
    dates = Enum.map(months, fn {y, m} -> Date.new!(y, m, 1) end)

    BillPayment
    |> where([p], p.group_id == ^group_id and p.month in ^dates)
    |> preload(:expense)
    |> Repo.all()
    |> Map.new(fn p -> {{p.bill_id, {p.month.year, p.month.month}}, p} end)
  end

  defp months_between(from, to) when from > to, do: []
  defp months_between(from, to), do: [from | months_between(Calendar.add_months(from, 1), to)]

  @doc """
  Pays the bill's occurrence of `month`: records an entry outside the budget on
  the bill's account (or card) and links it. Returns `{:ok, occurrence}`.
  """
  def pay(_group_id, _user_id, %RecurringBill{kind: "quota"}, _month, _amount, _date),
    do: {:error, :quota_not_payable}

  def pay(group_id, user_id, %RecurringBill{} = bill, month, %Decimal{} = amount, %Date{} = date) do
    month_date = Date.new!(elem(month, 0), elem(month, 1), 1)

    Repo.transaction(fn ->
      existing = Repo.get_by(BillPayment, bill_id: bill.id, month: month_date)

      with :ok <- not_paid_yet(existing),
           {:ok, expense} <-
             Expenses.create_expense(group_id, user_id, %{
               amount: amount,
               date: date,
               type: if(bill.direction == "income", do: "income", else: "expense"),
               note: bill.name,
               account_id: bill.account_id,
               subcategory_id: bill.subcategory_id,
               counts_in_budget: false,
               source: if(is_nil(bill.once_month), do: "bill", else: "one_off_bill")
             }),
           {:ok, _payment} <-
             (existing || %BillPayment{})
             |> BillPayment.changeset(%{
               group_id: group_id,
               bill_id: bill.id,
               expense_id: expense.id,
               month: month_date
             })
             |> Repo.insert_or_update() do
        payments = payments_for(group_id, [month])
        occurrence(bill, month, payments, date)
      else
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
  end

  # A skipped month (payment without entry) can be paid again.
  defp not_paid_yet(%BillPayment{expense_id: id}) when not is_nil(id), do: {:error, :already_paid}
  defp not_paid_yet(_), do: :ok

  @doc """
  Skips the bill in `month`: it is neither owed nor charged that month. A paid
  month must be undone first. Returns `{:ok, occurrence}`.
  """
  def skip(group_id, %RecurringBill{} = bill, month, note, today \\ Date.utc_today()) do
    month_date = Date.new!(elem(month, 0), elem(month, 1), 1)
    existing = Repo.get_by(BillPayment, bill_id: bill.id, month: month_date, group_id: group_id)

    with :ok <- not_paid_yet(existing),
         {:ok, _payment} <-
           (existing || %BillPayment{})
           |> BillPayment.changeset(%{
             group_id: group_id,
             bill_id: bill.id,
             month: month_date,
             note: note || ""
           })
           |> Repo.insert_or_update() do
      {:ok, occurrence(bill, month, payments_for(group_id, [month]), today)}
    end
  end

  @doc "Brings back a skipped month: it is owed (or charged) again."
  def unskip(group_id, %RecurringBill{} = bill, month) do
    month_date = Date.new!(elem(month, 0), elem(month, 1), 1)

    case Repo.get_by(BillPayment, bill_id: bill.id, month: month_date, group_id: group_id) do
      %BillPayment{expense_id: nil} = payment ->
        Repo.delete!(payment)
        :ok

      _ ->
        {:error, :not_found}
    end
  end

  @doc "Ids of the bills skipped in `month`."
  def skipped_ids(group_id, month) do
    group_id
    |> payments_for([month])
    |> Enum.filter(fn {_key, p} -> is_nil(p.expense_id) end)
    |> MapSet.new(fn {{bill_id, _month}, _p} -> bill_id end)
  end

  @doc """
  Undoes the payment of `month`, deleting the entry it created. For a card bill
  the month becomes `skipped`, so the automatic charge does not come back.
  """
  def unpay(group_id, %RecurringBill{} = bill, month) do
    month_date = Date.new!(elem(month, 0), elem(month, 1), 1)

    case Repo.get_by(BillPayment, bill_id: bill.id, month: month_date, group_id: group_id) do
      nil ->
        {:error, :not_found}

      %BillPayment{expense_id: nil} ->
        {:error, :not_found}

      payment ->
        Repo.transaction(fn ->
          unless card?(Repo.preload(bill, :account)), do: Repo.delete!(payment)
          {:ok, _} = Expenses.delete_expense(group_id, payment.expense_id)
        end)

        :ok
    end
  end
end
