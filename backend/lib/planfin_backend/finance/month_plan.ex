defmodule PlanfinBackend.Finance.MonthPlan do
  @moduledoc """
  The household's monthly plan, as done on paper.

  **This month** — from today to the eve of next month's salary:

        saldo da conta principal
      + salários e entradas previstas que caem até o vencimento da fatura
      − faturas do cartão que vencem até lá
      = resto após pagar a fatura (dinheiro na conta no dia do vencimento)
      − despesas fixas no boleto (recorrentes, da conta) até lá
      − gastos avulsos no boleto (despesas de um mês só) até lá
      + salários e entradas previstas depois do vencimento
      = sobra do mês → mesada (quando positiva)

  Salaries counted are the ones still to come in the window (not registered
  nor already inside the balance); expected incomes, the ones not received.
  Without invoices in the window every inflow counts before the "resto".

  **Next month** — the salary cycle opened by next month's salary:

        salário
      + saldo do vale alimentação
      − despesas fixas recorrentes (conta e cartão)
      − parcelas que caem na fatura paga nesse ciclo
      = resto para gastos variáveis

  The daily goal is the user's choice: `goal × days` is the expected variable
  spending and `resto − goal × days` the expected allowance. Applying a goal
  closes the active period yesterday and starts one from today to the end of
  this month's window.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Finance, Periods, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Bills, Calendar, Invoices, Salary}
  alias PlanfinBackend.Periods.{BudgetDay, Period}

  def build(group_id, %Date{} = today) do
    settings = Salary.get_settings(group_id)

    if Salary.configured?(settings) do
      {:ok, do_build(group_id, settings, today)}
    else
      {:error, :salary_not_configured}
    end
  end

  defp do_build(group_id, settings, today) do
    this_month = {today.year, today.month}
    next_month = Calendar.add_months(this_month, 1)
    next_salary = Salary.salary_date(group_id, next_month, settings)
    following_salary = Salary.salary_date(group_id, Calendar.add_months(next_month, 1), settings)
    a_end = Date.add(next_salary, -1)
    b_end = Date.add(following_salary, -1)

    accounts = Finance.list_accounts(group_id)
    primary = Enum.find(accounts, & &1.is_primary)
    balance = if primary, do: Finance.account_balance(primary, today), else: Decimal.new("0")
    occurrences = occurrences_between(group_id, today, a_end)

    current = %{
      end_date: a_end,
      balance: balance,
      has_primary: primary != nil,
      salaries: pending_salaries(group_id, settings, primary, today, a_end),
      incomes: occurrences |> Enum.filter(&(&1.bill.direction == "income")) |> Enum.map(&item/1),
      invoices:
        accounts
        |> Enum.filter(&(&1.kind == "credit_card"))
        |> Enum.flat_map(&invoices_due(&1, today, a_end)),
      fixed_bills:
        occurrences
        |> Enum.filter(&(boleto?(&1) and is_nil(&1.bill.once_month)))
        |> Enum.map(&item/1),
      one_off_bills:
        occurrences
        |> Enum.filter(&(boleto?(&1) and not is_nil(&1.bill.once_month)))
        |> Enum.map(&item/1)
    }

    invoice_due_date =
      current.invoices |> Enum.map(& &1.date) |> Enum.max(Date, fn -> nil end)

    inflows = current.salaries ++ current.incomes
    {before_due, after_due} = Enum.split_with(inflows, &on_or_before?(&1.date, invoice_due_date))

    after_invoices =
      current.balance
      |> Decimal.add(sum(before_due))
      |> Decimal.sub(sum(current.invoices))

    leftover =
      after_invoices
      |> Decimal.sub(sum(current.fixed_bills))
      |> Decimal.sub(sum(current.one_off_bills))
      |> Decimal.add(sum(after_due))

    current =
      Map.merge(current, %{
        invoice_due_date: invoice_due_date,
        after_invoices: after_invoices,
        leftover: leftover
      })

    benefits =
      accounts
      |> Enum.filter(&(&1.kind == "benefit"))
      |> Enum.map(fn a ->
        %{label: a.name, date: today, amount: Finance.account_balance(a, today)}
      end)

    fixed =
      group_id
      |> Bills.recurring_expenses(["checking", "allowance", "reserve", "benefit", "credit_card"])
      |> Enum.map(fn bill ->
        %{label: bill.name, date: Bills.due_date(bill, next_month), amount: bill.amount}
      end)

    installments =
      accounts
      |> Enum.filter(&(&1.kind == "credit_card"))
      |> Enum.flat_map(&installments_due(&1, next_salary, b_end))

    salary_item = %{label: "Salário", date: next_salary, amount: settings.salary_amount}

    remaining =
      settings.salary_amount
      |> Decimal.add(sum(benefits))
      |> Decimal.sub(sum(fixed))
      |> Decimal.sub(sum(installments))

    next = %{
      start_date: next_salary,
      end_date: b_end,
      days: Date.diff(b_end, next_salary) + 1,
      salary: salary_item,
      benefits: benefits,
      fixed_bills: fixed,
      installments: installments,
      remaining: remaining
    }

    %{today: today, current: current, next: next}
  end

  # A salary is still to come when its date is not before the current cycle,
  # it was not registered, and the balance was reconciled before it arrived.
  defp pending_salaries(group_id, settings, primary, today, a_end) do
    cycle = Salary.cycle(group_id, today)

    [{cycle.start_date.year, cycle.start_date.month}, {today.year, today.month}]
    |> Enum.uniq()
    |> Enum.map(&Salary.salary_date(group_id, &1, settings))
    |> Enum.uniq()
    |> Enum.filter(fn date ->
      Date.compare(date, cycle.start_date) != :lt and Date.compare(date, a_end) != :gt and
        not registered?(group_id, date) and
        (is_nil(primary) or Date.compare(primary.balance_date, date) == :lt)
    end)
    |> Enum.map(&%{label: "Salário", date: &1, amount: settings.salary_amount})
  end

  defp registered?(group_id, date) do
    from = Date.add(date, -3)

    Expense
    |> where(
      [e],
      e.group_id == ^group_id and e.source == "salary" and e.date >= ^from and e.date <= ^date
    )
    |> Repo.exists?()
  end

  defp invoices_due(card, today, a_end) do
    current = Invoices.current_month(card, today)

    for offset <- -3..2,
        month = Calendar.add_months(current, offset),
        invoice = Invoices.build(card, month, today),
        invoice.status not in ["paid", "empty"],
        Decimal.compare(invoice.remaining, 0) == :gt,
        Date.compare(invoice.due_date, a_end) != :gt do
      %{
        label: "Fatura #{card.name} #{format_month(month)}",
        date: invoice.due_date,
        amount: invoice.remaining
      }
    end
  end

  defp installments_due(card, from, to) do
    current = Invoices.month_for(card, from)

    for offset <- -1..2,
        month = Calendar.add_months(current, offset),
        due = Invoices.due_date(card, month),
        Date.compare(due, from) != :lt and Date.compare(due, to) != :gt,
        sum = installment_sum(card, month),
        Decimal.compare(sum, 0) == :gt do
      %{label: "Parcelas #{card.name} #{format_month(month)}", date: due, amount: sum}
    end
  end

  defp installment_sum(card, month) do
    start = Invoices.start_date(card, month)
    closing = Invoices.closing_date(card, month)

    Expense
    |> where(
      [e],
      e.account_id == ^card.id and e.date >= ^start and e.date < ^closing and
        not is_nil(e.installment_group_id) and e.counts_in_budget == false and e.type == "expense"
    )
    |> select([e], sum(e.amount))
    |> Repo.one()
    |> Kernel.||(Decimal.new("0"))
  end

  defp occurrences_between(group_id, today, a_end) do
    {today.year, today.month}
    |> Calendar.add_months(-1)
    |> Stream.iterate(&Calendar.add_months(&1, 1))
    |> Enum.take_while(&(&1 <= {a_end.year, a_end.month}))
    |> Enum.flat_map(&Bills.occurrences(group_id, &1, today))
    |> Enum.filter(fn occ ->
      occ.status in ["pending", "overdue"] and Date.compare(occ.due_date, a_end) != :gt
    end)
  end

  defp on_or_before?(_date, nil), do: true
  defp on_or_before?(date, cutoff), do: Date.compare(date, cutoff) != :gt

  defp boleto?(occ),
    do: occ.bill.direction == "expense" and occ.bill.account.kind != "credit_card"

  defp item(occ), do: %{label: occ.bill.name, date: occ.due_date, amount: occ.amount}

  defp sum(items), do: Enum.reduce(items, Decimal.new("0"), &Decimal.add(&2, &1.amount))

  defp format_month({y, m}), do: "#{String.pad_leading(Integer.to_string(m), 2, "0")}/#{y}"

  @doc """
  Applies a daily goal from today: active periods end yesterday (or are
  abandoned when they start today or later) and a new period runs from today
  to `end_date` (default: the end of this month's window).
  """
  def apply_goal(group_id, %Decimal{} = daily, %Date{} = today, end_date \\ nil) do
    with {:ok, plan} <- build(group_id, today),
         :ok <- validate_goal(daily),
         end_date = end_date || plan.current.end_date,
         :ok <- validate_end(end_date, today) do
      days = Date.diff(end_date, today) + 1
      daily = Decimal.round(daily, 2)

      Repo.transaction(fn ->
        close_active_periods(group_id, today)

        attrs = %{
          name: "Meta de #{Calendar.format_br(today)}",
          start_date: today,
          end_date: end_date,
          daily_limit: daily,
          total_budget: Decimal.mult(daily, days)
        }

        case Periods.create_period(group_id, attrs, today) do
          {:ok, period} -> period
          {:error, reason} -> Repo.rollback(reason)
        end
      end)
    end
  end

  defp validate_end(end_date, today) do
    if Date.compare(end_date, today) == :gt, do: :ok, else: {:error, :invalid_end_date}
  end

  defp validate_goal(daily) do
    if Decimal.compare(daily, 0) == :gt, do: :ok, else: {:error, :invalid_goal}
  end

  defp close_active_periods(group_id, today) do
    Period
    |> where([p], p.group_id == ^group_id and p.status == "active")
    |> Repo.all()
    |> Enum.each(fn period ->
      if Date.compare(period.start_date, today) == :lt do
        yesterday = Date.add(today, -1)

        new_end =
          if Date.compare(period.end_date, yesterday) == :gt, do: yesterday, else: period.end_date

        BudgetDay
        |> where([bd], bd.period_id == ^period.id and bd.date > ^new_end)
        |> Repo.delete_all()

        period |> Ecto.Changeset.change(end_date: new_end, status: "closed") |> Repo.update!()
      else
        period |> Ecto.Changeset.change(status: "abandoned") |> Repo.update!()
      end
    end)
  end
end
