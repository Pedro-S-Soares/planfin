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

  A bill exists every month from the month it was created on, whatever its
  day: a bill created on the 3rd with day 1 already has this month's
  occurrence, pending until the user marks it paid. Only the automatic card
  charge waits for a due date after the bill was created.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Expenses, Repo}
  alias PlanfinBackend.Finance.{Account, BillPayment, Calendar, RecurringBill}

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
      |> RecurringBill.changeset(Map.put(attrs, :group_id, group_id))
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
      bill
      |> RecurringBill.changeset(Map.drop(attrs, [:group_id]))
      |> Repo.update()
      |> preload_bill()
    end
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

  @doc "Due date of the bill in `{year, month}`, clamped to the month's last day."
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

  @doc "Active recurring (every month) expense bills paid from `account_kinds`."
  def recurring_expenses(group_id, account_kinds) do
    group_id
    |> list_bills()
    |> Enum.filter(fn b ->
      b.direction == "expense" and is_nil(b.once_month) and b.account.kind in account_kinds
    end)
  end

  defp exists_in?(%RecurringBill{once_month: %Date{} = once}, month),
    do: {once.year, once.month} == month

  defp exists_in?(%RecurringBill{inserted_at: inserted_at}, month),
    do: {inserted_at.year, inserted_at.month} <= month

  # A due date that passed before the bill was registered may already be on
  # the card; it is shown as pending but never charged automatically.
  defp auto_chargeable?(%RecurringBill{inserted_at: inserted_at}, due),
    do: Date.compare(due, NaiveDateTime.to_date(inserted_at)) != :lt

  defp occurrence(bill, month, payments, today) do
    due = due_date(bill, month)
    payment = Map.get(payments, {bill.id, month})
    expense = payment && payment.expense

    status =
      cond do
        expense -> "paid"
        payment && card?(bill) -> "skipped"
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
      expense_id: expense && expense.id
    }
  end

  defp card?(%RecurringBill{direction: "expense", account: %Account{kind: "credit_card"}}),
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
               source: "bill"
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
