defmodule PlanfinBackend.Finance.Salary do
  @moduledoc """
  Salary cycle of a group.

  The salary arrives on the N-th labor business day of each month (default 10,
  Saturdays count). A cycle runs from one salary date to the day before the
  next one. Any month can have a manual date (`SalaryDateOverride`).

  The cycle proposal turns the salary into a period budget:

      available = salary − bills paid from accounts − card bills
                  − installments landing on the invoice this cycle's
                    purchases go to
      daily     = (available − gordura) ÷ days

  Installments are taken from the invoice due in the *next* cycle: that is the
  invoice that also receives this cycle's daily card spending, so both are paid
  by the same salary and the budget balances.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Expenses, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance
  alias PlanfinBackend.Finance.{Bills, Calendar, Invoices, SalaryDateOverride, Settings}

  # ---- Settings ----

  @doc "Settings of the group, or an unsaved struct with defaults."
  def get_settings(group_id) do
    Repo.get_by(Settings, group_id: group_id) || %Settings{group_id: group_id}
  end

  def configured?(%Settings{salary_amount: %Decimal{}}), do: true
  def configured?(_), do: false

  def update_settings(group_id, attrs) do
    with :ok <- validate_account(group_id, attrs[:salary_account_id]) do
      group_id
      |> get_settings()
      |> Settings.changeset(Map.put(attrs, :group_id, group_id))
      |> Repo.insert_or_update()
    end
  end

  defp validate_account(_group_id, nil), do: :ok

  defp validate_account(group_id, account_id) do
    case Finance.get_account(group_id, account_id) do
      {:ok, _} -> :ok
      _ -> {:error, :account_not_found}
    end
  end

  # ---- Dates ----

  @doc "Salary date of `{year, month}`: manual override or the N-th labor business day."
  def salary_date(group_id, {year, month}, settings \\ nil) do
    settings = settings || get_settings(group_id)
    month_date = Date.new!(year, month, 1)

    case Repo.get_by(SalaryDateOverride, group_id: group_id, month: month_date) do
      %SalaryDateOverride{date: date} -> date
      nil -> Calendar.nth_labor_business_day(year, month, settings.salary_business_day)
    end
  end

  @doc "Expected salary of `{year, month}`: the month's own amount or the usual one."
  def salary_amount(group_id, {year, month}, settings \\ nil) do
    settings = settings || get_settings(group_id)

    case Repo.get_by(SalaryDateOverride, group_id: group_id, month: Date.new!(year, month, 1)) do
      %SalaryDateOverride{amount: %Decimal{} = amount} -> amount
      _ -> settings.salary_amount
    end
  end

  def set_salary_date(group_id, month, %Date{} = date),
    do: set_month(group_id, month, %{date: date})

  @doc """
  Sets what is specific to a month's salary. `:date` and `:amount` are both
  optional; a `nil` amount goes back to the usual salary.
  """
  def set_month(group_id, {year, month}, attrs) do
    month_date = Date.new!(year, month, 1)
    existing = Repo.get_by(SalaryDateOverride, group_id: group_id, month: month_date)
    settings = get_settings(group_id)

    date =
      Map.get(attrs, :date) || (existing && existing.date) ||
        Calendar.nth_labor_business_day(year, month, settings.salary_business_day)

    amount = if Map.has_key?(attrs, :amount), do: attrs.amount, else: existing && existing.amount

    (existing || %SalaryDateOverride{})
    |> SalaryDateOverride.changeset(%{
      group_id: group_id,
      month: month_date,
      date: date,
      amount: amount
    })
    |> Repo.insert_or_update()
  end

  @doc "Back to the automatic date. The month's own amount, if any, is kept."
  def clear_salary_date(group_id, {year, month}) do
    month_date = Date.new!(year, month, 1)

    case Repo.get_by(SalaryDateOverride, group_id: group_id, month: month_date) do
      nil ->
        :ok

      %SalaryDateOverride{amount: nil} = override ->
        Repo.delete!(override)
        :ok

      override ->
        settings = get_settings(group_id)
        automatic = Calendar.nth_labor_business_day(year, month, settings.salary_business_day)
        override |> SalaryDateOverride.changeset(%{date: automatic}) |> Repo.update!()
        :ok
    end
  end

  @doc "Cycle containing `today`: `%{start_date, end_date, next_salary_date, month}`."
  def cycle(group_id, %Date{} = today) do
    settings = get_settings(group_id)
    this_month = {today.year, today.month}
    this_salary = salary_date(group_id, this_month, settings)

    {start_month, start} =
      if Date.compare(today, this_salary) == :lt do
        prev = Calendar.add_months(this_month, -1)
        {prev, salary_date(group_id, prev, settings)}
      else
        {this_month, this_salary}
      end

    next_month = Calendar.add_months(start_month, 1)
    next_salary = salary_date(group_id, next_month, settings)

    %{
      month: start_month,
      start_date: start,
      end_date: Date.add(next_salary, -1),
      next_salary_date: next_salary
    }
  end

  @doc "The cycle after the one containing `today`."
  def next_cycle(group_id, today) do
    current = cycle(group_id, today)
    cycle(group_id, current.next_salary_date)
  end

  @doc """
  Day before the next money arrives: the eve of the next salary when the salary
  is configured, otherwise the end of the active period.
  """
  def horizon(group_id, today) do
    if configured?(get_settings(group_id)),
      do: Date.add(cycle(group_id, today).next_salary_date, -1),
      else: Finance.Panel.default_horizon(group_id, today)
  end

  @doc """
  Salary facts for the panel. `pending` is true during the first week of a
  cycle while its salary has not been registered yet.
  """
  def panel_info(group_id, today) do
    settings = get_settings(group_id)

    if configured?(settings) do
      c = cycle(group_id, today)
      recent? = Date.diff(today, c.start_date) <= 7

      %{
        configured: true,
        amount: salary_amount(group_id, c.month, settings),
        cycle_start_date: c.start_date,
        next_salary_date: c.next_salary_date,
        pending: recent? and not received?(group_id, today)
      }
    else
      %{
        configured: false,
        amount: nil,
        cycle_start_date: nil,
        next_salary_date: nil,
        pending: false
      }
    end
  end

  # ---- Salary entry ----

  @doc """
  Whether the salary of the cycle containing `today` was registered. A salary
  deposited up to 3 days early (e.g. on the Friday before) still counts.
  """
  def received?(group_id, today) do
    c = cycle(group_id, today)
    from = Date.add(c.start_date, -3)

    Expense
    |> where(
      [e],
      e.group_id == ^group_id and e.source == "salary" and e.date >= ^from and
        e.date <= ^c.end_date
    )
    |> Repo.exists?()
  end

  @doc """
  The entry that paid the salary of `month`, or `nil`. A salary deposited up to
  3 days before the month's salary date still counts.
  """
  def payment(group_id, month, settings \\ nil) do
    date = salary_date(group_id, month, settings)
    from = Date.add(date, -3)

    Expense
    |> where(
      [e],
      e.group_id == ^group_id and e.source == "salary" and e.date >= ^from and e.date <= ^date
    )
    |> order_by([e], desc: e.date)
    |> limit(1)
    |> Repo.one()
  end

  @doc """
  Marks the salary of `month` (default: the month of `date`) as paid: records
  the real `amount` as income on the salary account, outside the daily
  budget, and makes `date` that month's salary date, so the cycle starts when
  the money actually arrived.
  """
  def register(group_id, user_id, %Decimal{} = amount, %Date{} = date, month \\ nil) do
    settings = get_settings(group_id)
    month = month || {date.year, date.month}

    account_id =
      settings.salary_account_id ||
        case Finance.get_primary_account(group_id) do
          nil -> nil
          primary -> primary.id
        end

    if payment(group_id, month, settings) do
      {:error, :already_registered}
    else
      Repo.transaction(fn ->
        with {:ok, _} <- set_month(group_id, month, %{date: date}),
             {:ok, entry} <-
               Expenses.create_expense(group_id, user_id, %{
                 amount: amount,
                 date: date,
                 type: "income",
                 note: "Salário",
                 account_id: account_id,
                 counts_in_budget: false,
                 source: "salary"
               }) do
          entry
        else
          {:error, reason} -> Repo.rollback(reason)
        end
      end)
    end
  end

  @doc "Undoes the payment of `month`: deletes the entry and restores the automatic date."
  def unregister(group_id, month) do
    case payment(group_id, month) do
      nil ->
        {:error, :not_found}

      entry ->
        {:ok, _} = Expenses.delete_expense(group_id, entry.id)
        clear_salary_date(group_id, month)
    end
  end

  @doc """
  The salary of the current month and the next two: date, expected amount and,
  when already paid, the real amount and date.
  """
  def upcoming(group_id, %Date{} = today) do
    settings = get_settings(group_id)

    for offset <- 0..2 do
      {year, mon} = month = Calendar.add_months({today.year, today.month}, offset)
      date = salary_date(group_id, month, settings)
      paid = payment(group_id, month, settings)

      %{
        month: month,
        date: date,
        is_manual:
          date != Calendar.nth_labor_business_day(year, mon, settings.salary_business_day),
        amount: salary_amount(group_id, month, settings),
        paid: paid != nil,
        paid_amount: paid && paid.amount,
        paid_on: paid && paid.date
      }
    end
  end

  # ---- Proposal ----

  @doc """
  Budget proposal for the first cycle without a period: the current cycle, or
  the next one when a period already covers the current cycle's end.
  Returns `nil` when the salary is not configured.
  """
  def proposal(group_id, today) do
    settings = get_settings(group_id)

    if configured?(settings) do
      current = cycle(group_id, today)

      target =
        if covered?(group_id, current.end_date),
          do: next_cycle(group_id, today),
          else: current

      build_proposal(group_id, settings, target)
    end
  end

  defp covered?(group_id, date) do
    PlanfinBackend.Periods.Period
    |> where(
      [p],
      p.group_id == ^group_id and p.status == "active" and p.start_date <= ^date and
        p.end_date >= ^date
    )
    |> Repo.exists?()
  end

  defp build_proposal(group_id, settings, target) do
    days = Date.diff(target.end_date, target.start_date) + 1
    account_bills = Bills.monthly_total(group_id, ["checking", "allowance", "reserve"])
    card_bills = Bills.monthly_total(group_id, ["credit_card"])
    installments = installments_for(group_id, cycle(group_id, target.next_salary_date))

    available =
      settings.salary_amount
      |> Decimal.sub(account_bills)
      |> Decimal.sub(card_bills)
      |> Decimal.sub(installments)

    %{
      start_date: target.start_date,
      end_date: target.end_date,
      days: days,
      salary: settings.salary_amount,
      account_bills: account_bills,
      card_bills: card_bills,
      installments: installments,
      available: available
    }
  end

  # Installments 2..N on invoices due within `paying_cycle`.
  defp installments_for(group_id, paying_cycle) do
    group_id
    |> Finance.list_accounts()
    |> Enum.filter(&(&1.kind == "credit_card"))
    |> Enum.reduce(Decimal.new("0"), fn card, acc ->
      month = Invoices.month_for(card, paying_cycle.start_date)

      [Calendar.add_months(month, -1), month, Calendar.add_months(month, 1)]
      |> Enum.filter(fn m ->
        due = Invoices.due_date(card, m)

        Date.compare(due, paying_cycle.start_date) != :lt and
          Date.compare(due, paying_cycle.end_date) != :gt
      end)
      |> Enum.reduce(acc, fn m, inner ->
        start = Invoices.start_date(card, m)
        closing = Invoices.closing_date(card, m)

        sum =
          Expense
          |> where(
            [e],
            e.account_id == ^card.id and e.date >= ^start and e.date < ^closing and
              e.installment_number >= 2 and e.type == "expense"
          )
          |> select([e], sum(e.amount))
          |> Repo.one()

        Decimal.add(inner, sum || Decimal.new("0"))
      end)
    end)
  end
end
