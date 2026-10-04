defmodule PlanfinBackend.Finance.FreshPlan do
  @moduledoc """
  Plan the money from today on, without looking back.

      Saldo da conta principal hoje
    + salário que ainda vai cair dentro do plano
    − cartão: o que já está lançado nas faturas não pagas (compras feitas,
      parcelas, ajustes) até o fim do plano
    − despesas fixas da conta pendentes até o fim do plano
    − despesas fixas no cartão que ainda vão entrar até o fim do plano
    = sobra para gastos variáveis

  The plan ends at the end of a salary cycle: the current one when its salary
  already arrived (or is due to be registered), otherwise the cycle opened by
  the next salary. Card purchases are counted against today's money (cash
  view), which is what gets the household out of "the salary goes all to the
  invoice".

  `start/4` closes the active period yesterday and creates a period from today
  to the plan's end with daily limit `(sobra − gordura) ÷ dias`.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Finance, Periods, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Bills, Calendar, Invoices, Salary}
  alias PlanfinBackend.Periods.{BudgetDay, Period}

  def build(group_id, %Date{} = today) do
    settings = Salary.get_settings(group_id)
    {salary, end_date} = salary_and_end(group_id, settings, today)
    primary = Finance.get_primary_account(group_id)
    balance = if primary, do: Finance.account_balance(primary, today), else: Decimal.new("0")

    cards =
      group_id |> Finance.list_accounts() |> Enum.filter(&(&1.kind == "credit_card"))

    card_items = Enum.flat_map(cards, &card_exposure(&1, today, end_date))
    occurrences = occurrences_until(group_id, today, end_date)

    account_bills =
      occurrences
      |> Enum.filter(&(&1.bill.account.kind != "credit_card"))
      |> Enum.map(&bill_item/1)

    card_bills =
      occurrences
      |> Enum.filter(&(&1.bill.account.kind == "credit_card" and &1.status == "pending"))
      |> Enum.map(&bill_item/1)

    salary_amount = (salary && salary.amount) || Decimal.new("0")

    variable =
      balance
      |> Decimal.add(salary_amount)
      |> Decimal.sub(sum(card_items))
      |> Decimal.sub(sum(account_bills))
      |> Decimal.sub(sum(card_bills))

    %{
      start_date: today,
      end_date: end_date,
      days: Date.diff(end_date, today) + 1,
      has_primary: primary != nil,
      balance: balance,
      salary: salary,
      cards: card_items,
      account_bills: account_bills,
      card_bills: card_bills,
      variable: variable
    }
  end

  defp salary_and_end(group_id, settings, today) do
    if Salary.configured?(settings) do
      cycle = Salary.cycle(group_id, today)
      info = Salary.panel_info(group_id, today)

      cond do
        info.pending ->
          {%{date: cycle.start_date, amount: settings.salary_amount}, cycle.end_date}

        Salary.received?(group_id, today) ->
          {nil, cycle.end_date}

        true ->
          next = Salary.cycle(group_id, cycle.next_salary_date)
          {%{date: cycle.next_salary_date, amount: settings.salary_amount}, next.end_date}
      end
    else
      {nil, Finance.Panel.default_horizon(group_id, today)}
    end
  end

  # What each unpaid invoice already holds from entries dated up to `end_date`.
  defp card_exposure(card, today, end_date) do
    current = Invoices.current_month(card, today)
    last = Invoices.month_for(card, end_date)

    current
    |> Calendar.add_months(-3)
    |> Stream.iterate(&Calendar.add_months(&1, 1))
    |> Enum.take_while(&(&1 <= last))
    |> Enum.flat_map(fn month ->
      invoice = Invoices.build(card, month, today)
      upto = min_date(Date.add(invoice.closing_date, -1), end_date)
      owed = Decimal.sub(entries_total(card, invoice.start_date, upto), invoice.paid)

      if invoice.status in ["paid", "empty"] or Decimal.compare(owed, 0) != :gt do
        []
      else
        [
          %{
            label: "Fatura #{card.name} #{format_month(month)}",
            date: invoice.due_date,
            amount: owed,
            card_id: card.id,
            month: month
          }
        ]
      end
    end)
  end

  defp entries_total(card, from, to) do
    Expense
    |> where([e], e.account_id == ^card.id and e.date >= ^from and e.date <= ^to)
    |> group_by([e], e.type)
    |> select([e], {e.type, sum(e.amount)})
    |> Repo.all()
    |> Map.new()
    |> then(fn by_type ->
      Decimal.sub(
        Map.get(by_type, "expense") || Decimal.new("0"),
        Map.get(by_type, "income") || Decimal.new("0")
      )
    end)
  end

  defp occurrences_until(group_id, today, end_date) do
    {today.year, today.month}
    |> Calendar.add_months(-1)
    |> Stream.iterate(&Calendar.add_months(&1, 1))
    |> Enum.take_while(&(&1 <= {end_date.year, end_date.month}))
    |> Enum.flat_map(&Bills.occurrences(group_id, &1, today))
    |> Enum.filter(fn occ ->
      occ.status in ["pending", "overdue"] and Date.compare(occ.due_date, end_date) != :gt
    end)
  end

  defp bill_item(occ) do
    %{
      label: occ.bill.name,
      date: occ.due_date,
      amount: occ.amount,
      card_id: nil,
      month: occ.month
    }
  end

  defp sum(items), do: Enum.reduce(items, Decimal.new("0"), &Decimal.add(&2, &1.amount))

  defp min_date(a, b), do: if(Date.compare(a, b) == :gt, do: b, else: a)

  defp format_month({y, m}), do: "#{String.pad_leading(Integer.to_string(m), 2, "0")}/#{y}"

  @doc """
  Starts the plan: active periods end yesterday (or are abandoned when they
  start today or later) and a new period runs from today to the plan's end.
  Returns `{:ok, period}` or `{:error, :insufficient}` when nothing is left
  for variable spending after the gordura.
  """
  def start(group_id, %Decimal{} = gordura, %Date{} = today, name \\ nil) do
    plan = build(group_id, today)

    spendable_cents =
      plan.variable |> Decimal.sub(gordura) |> Decimal.mult(100) |> Decimal.round(0, :down)

    daily_cents = div(Decimal.to_integer(spendable_cents), plan.days)

    if daily_cents <= 0 or Decimal.compare(gordura, 0) == :lt do
      {:error, :insufficient}
    else
      daily = Decimal.div(Decimal.new(daily_cents), 100) |> Decimal.round(2)

      Repo.transaction(fn ->
        close_active_periods(group_id, today)

        attrs = %{
          name: name || "A partir de #{Calendar.format_br(today)}",
          start_date: today,
          end_date: plan.end_date,
          daily_limit: daily,
          total_budget: Decimal.round(plan.variable, 2)
        }

        case Periods.create_period(group_id, attrs, today) do
          {:ok, period} -> period
          {:error, reason} -> Repo.rollback(reason)
        end
      end)
    end
  end

  defp close_active_periods(group_id, today) do
    Period
    |> where([p], p.group_id == ^group_id and p.status == "active")
    |> Repo.all()
    |> Enum.each(fn period ->
      if Date.compare(period.start_date, today) == :lt do
        yesterday = Date.add(today, -1)
        new_end = min_date(period.end_date, yesterday)

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
