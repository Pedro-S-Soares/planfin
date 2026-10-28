defmodule PlanfinBackend.Finance.CyclePlan do
  @moduledoc """
  The plan around the invoice of the cycle card (the main card, see
  `Settings.cycle_card`). Daily spending goes on that card, so what is bought
  from one closing to the next is paid by the salary of the month the invoice
  is due in.

  **Current invoice** — the oldest unpaid invoice of the cycle card: the one
  receiving purchases (`open`), or, between the closing and the payment, the
  closed one (`closed`). Its money window runs from today to the eve of the
  salary after the one that pays it:

        saldo da conta principal
      + salários e entradas previstas (inclusive o salário do parceiro) até lá
      + vale alimentação (aberta): saldo de hoje e créditos até o fechamento
      − fatura do cartão até agora
      − fixas do cartão que ainda entram nela (aberta)
      − faturas dos outros cartões que vencem até lá
      − fixas e avulsos no boleto até lá
      = aberta: quanto ainda dá para gastar até o fechamento
        fechada: a sobra até o próximo salário

  **Next invoice** — the purchases from the current closing to the next one,
  paid by the following salary. Its money window runs from that salary to the
  eve of the next one:

        salário + salário do parceiro + entradas previstas
      + créditos do vale alimentação no ciclo (e o saldo, se a atual fechou)
      − fixas do cartão lançadas no ciclo
      − parcelas que caem na fatura
      − faturas dos outros cartões que vencem na janela
      − fixas e avulsos no boleto da janela
      = livre para gastos variáveis no ciclo
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Finance, Repo}
  alias PlanfinBackend.Expenses.Expense
  alias PlanfinBackend.Finance.{Benefits, Bills, Calendar, Invoices, RecurringBill, Salary}

  @default_partner_name "Salário da esposa"
  @default_partner_day 15

  def build(group_id, %Date{} = today) do
    settings = Salary.get_settings(group_id)
    accounts = Finance.list_accounts(group_id)
    card = cycle_card(accounts, settings)

    cond do
      not Salary.configured?(settings) -> {:error, :salary_not_configured}
      is_nil(card) -> {:error, :no_card}
      true -> {:ok, do_build(group_id, settings, accounts, card, today)}
    end
  end

  @doc "The card whose cycle drives the plan: the chosen one, else the first card."
  def cycle_card(accounts, settings) do
    cards = Enum.filter(accounts, &(&1.kind == "credit_card"))
    Enum.find(cards, &(&1.id == settings.cycle_card_id)) || List.first(cards)
  end

  defp do_build(group_id, settings, accounts, card, today) do
    open_month = Invoices.current_month(card, today)
    previous = Calendar.add_months(open_month, -1)

    first_month =
      if unpaid?(Invoices.build(card, previous, today)), do: previous, else: open_month

    second_month = Calendar.add_months(first_month, 1)

    ctx = %{
      group_id: group_id,
      settings: settings,
      accounts: accounts,
      card: card,
      other_cards: Enum.filter(accounts, &(&1.kind == "credit_card" and &1.id != card.id)),
      primary: Enum.find(accounts, & &1.is_primary),
      today: today
    }

    current =
      current_block(ctx, first_month, if(first_month == open_month, do: "open", else: "closed"))

    next = next_block(ctx, second_month, current)

    %{card: card, current: current, next: next}
  end

  defp unpaid?(invoice),
    do: invoice.status not in ["paid", "empty"] and Decimal.compare(invoice.remaining, 0) == :gt

  # ---- Current invoice ----

  defp current_block(ctx, month, status) do
    %{card: card, today: today} = ctx
    dates = invoice_dates(ctx, month)
    balance = if ctx.primary, do: Finance.account_balance(ctx.primary, today), else: zero()
    partner = partner_income(ctx.group_id, dates.salary_month, today)

    occurrences =
      occurrences_between(ctx.group_id, months_between(today, dates.window_end), today)

    invoice = Invoices.build(card, month, today)

    pending =
      Enum.filter(occurrences, fn occ ->
        occ.status in ["pending", "overdue"] and on_or_before?(occ.due_date, dates.window_end)
      end)

    card_bills =
      if status == "open" do
        pending
        |> Enum.filter(fn occ ->
          occ.bill.account_id == card.id and occ.bill.direction == "expense" and
            in_range?(occ.due_date, today, Date.add(dates.closing_date, -1))
        end)
        |> Enum.map(&item/1)
      else
        []
      end

    block = %{
      status: status,
      invoice_month: month,
      purchase_start: dates.purchase_start,
      last_purchase_date: Date.add(dates.closing_date, -1),
      due_date: dates.due_date,
      salary_date: dates.salary_date,
      window_end: dates.window_end,
      balance: balance,
      has_primary: ctx.primary != nil,
      salaries: pending_salaries(ctx, dates.window_end),
      partner: partner,
      incomes: pending |> Enum.filter(&income?(&1, partner)) |> Enum.map(&item/1),
      benefits:
        if(status == "open",
          do: benefit_items(ctx, today, Date.add(dates.closing_date, -1), true),
          else: []
        ),
      invoice: %{
        label: "Fatura #{card.name}",
        date: dates.due_date,
        amount: invoice.remaining
      },
      card_bills: card_bills,
      installments: [],
      other_cards:
        Enum.flat_map(ctx.other_cards, &other_card_items(ctx, &1, today, dates.window_end, :owed)),
      fixed_bills:
        pending |> Enum.filter(&(boleto?(&1) and not one_off?(&1))) |> Enum.map(&item/1),
      one_off_bills: pending |> Enum.filter(&(boleto?(&1) and one_off?(&1))) |> Enum.map(&item/1)
    }

    inflows =
      sum(block.salaries)
      |> Decimal.add(sum(block.incomes))
      |> Decimal.add(partner_amount(partner))
      |> Decimal.add(sum(block.benefits))

    outflows =
      block.invoice.amount
      |> Decimal.add(sum(block.card_bills))
      |> Decimal.add(sum(block.other_cards))
      |> Decimal.add(sum(block.fixed_bills))
      |> Decimal.add(sum(block.one_off_bills))

    result = balance |> Decimal.add(inflows) |> Decimal.sub(outflows)
    {goal_start, days} = goal_days(status, today, dates)

    Map.merge(block, %{result: result, goal_start: goal_start, days: days})
  end

  # ---- Next invoice ----

  defp next_block(ctx, month, current) do
    %{card: card, today: today, group_id: group_id, settings: settings} = ctx
    dates = invoice_dates(ctx, month)
    from = Date.add(current.window_end, 1)
    {goal_start, days} = goal_days("next", today, dates)
    partner = partner_income(group_id, dates.salary_month, today)

    occurrences =
      group_id
      |> occurrences_between(months_between(dates.purchase_start, dates.window_end), today)
      |> Enum.reject(&(&1.status == "skipped"))

    in_window = Enum.filter(occurrences, &in_range?(&1.due_date, from, dates.window_end))

    block = %{
      status: "next",
      invoice_month: month,
      purchase_start: dates.purchase_start,
      last_purchase_date: Date.add(dates.closing_date, -1),
      due_date: dates.due_date,
      salary_date: dates.salary_date,
      window_end: dates.window_end,
      balance: nil,
      has_primary: ctx.primary != nil,
      salaries: [
        %{
          label: "Salário",
          date: dates.salary_date,
          amount: Salary.salary_amount(group_id, dates.salary_month, settings)
        }
      ],
      partner: partner,
      incomes:
        in_window
        |> Enum.filter(&(&1.status in ["pending", "overdue"] and income?(&1, partner)))
        |> Enum.map(&item/1),
      # While the current invoice is open the voucher balance belongs to it.
      benefits:
        benefit_items(
          ctx,
          goal_start,
          Date.add(dates.closing_date, -1),
          current.status == "closed"
        ),
      invoice: nil,
      card_bills:
        occurrences
        |> Enum.filter(fn occ ->
          occ.bill.account_id == card.id and occ.bill.direction == "expense" and
            in_range?(occ.due_date, dates.purchase_start, Date.add(dates.closing_date, -1))
        end)
        |> Enum.map(&planned_item/1),
      installments: installment_items(card, month),
      other_cards:
        Enum.flat_map(
          ctx.other_cards,
          &other_card_items(ctx, &1, from, dates.window_end, :planned)
        ),
      fixed_bills:
        in_window |> Enum.filter(&(boleto?(&1) and not one_off?(&1))) |> Enum.map(&planned_item/1),
      one_off_bills:
        in_window |> Enum.filter(&(boleto?(&1) and one_off?(&1))) |> Enum.map(&planned_item/1)
    }

    inflows =
      sum(block.salaries)
      |> Decimal.add(partner_amount(partner))
      |> Decimal.add(sum(block.incomes))
      |> Decimal.add(sum(block.benefits))

    outflows =
      sum(block.card_bills)
      |> Decimal.add(sum(block.installments))
      |> Decimal.add(sum(block.other_cards))
      |> Decimal.add(sum(block.fixed_bills))
      |> Decimal.add(sum(block.one_off_bills))

    Map.merge(block, %{result: Decimal.sub(inflows, outflows), goal_start: goal_start, days: days})
  end

  # ---- Dates ----

  # The invoice's purchase window, its due date, the salary that pays it and
  # the eve of the salary after that one (the end of its money window).
  defp invoice_dates(ctx, month) do
    due = Invoices.due_date(ctx.card, month)
    salary_month = {due.year, due.month}

    following =
      Salary.salary_date(ctx.group_id, Calendar.add_months(salary_month, 1), ctx.settings)

    %{
      purchase_start: Invoices.start_date(ctx.card, month),
      closing_date: Invoices.closing_date(ctx.card, month),
      due_date: due,
      salary_month: salary_month,
      salary_date: Salary.salary_date(ctx.group_id, salary_month, ctx.settings),
      window_end: Date.add(following, -1)
    }
  end

  # The daily goal covers the purchase days still ahead: from today (or the
  # cycle start, when it is still to come) to the eve of the closing. A closed
  # invoice takes no more purchases.
  defp goal_days("closed", _today, _dates), do: {nil, nil}

  defp goal_days(_status, today, dates) do
    start =
      if Date.compare(dates.purchase_start, today) == :gt, do: dates.purchase_start, else: today

    {start, max(Date.diff(dates.closing_date, start), 1)}
  end

  # ---- Meal voucher ----

  # Voucher money for the purchases from `from` to `to`: the balance of today
  # (when asked) plus the monthly credits still to arrive in that range.
  # Today's credit is already recorded, so it is inside the balance.
  defp benefit_items(ctx, from, to, with_balance?) do
    ctx.accounts
    |> Enum.filter(&(&1.kind == "benefit"))
    |> Enum.flat_map(fn account ->
      balance =
        if with_balance?,
          do: [
            %{
              label: "#{account.name} · saldo hoje",
              date: ctx.today,
              amount: Finance.account_balance(account, ctx.today)
            }
          ],
          else: []

      balance ++ benefit_credits(account, ctx.today, from, to)
    end)
  end

  defp benefit_credits(%{monthly_credit: nil}, _today, _from, _to), do: []
  defp benefit_credits(%{credit_day: nil}, _today, _from, _to), do: []

  defp benefit_credits(account, today, from, to) do
    from
    |> months_between(to)
    |> Enum.map(&Benefits.credit_date(account, &1))
    |> Enum.filter(&(Date.compare(&1, today) == :gt and in_range?(&1, from, to)))
    |> Enum.map(&%{label: "#{account.name} · crédito", date: &1, amount: account.monthly_credit})
  end

  # ---- Salaries and incomes ----

  # A salary is still to come when it falls in the window from the start of
  # the current salary cycle, was not registered and arrived after the last
  # reconciliation of the main account.
  defp pending_salaries(ctx, window_end) do
    %{group_id: group_id, settings: settings, primary: primary, today: today} = ctx
    cycle = Salary.cycle(group_id, today)

    {cycle.start_date.year, cycle.start_date.month}
    |> Stream.iterate(&Calendar.add_months(&1, 1))
    |> Enum.take_while(&(&1 <= {window_end.year, window_end.month}))
    |> Enum.map(fn month ->
      %{
        label: "Salário",
        date: Salary.salary_date(group_id, month, settings),
        amount: Salary.salary_amount(group_id, month, settings)
      }
    end)
    |> Enum.uniq_by(& &1.date)
    |> Enum.filter(fn %{date: date} ->
      in_range?(date, cycle.start_date, window_end) and not salary_registered?(group_id, date) and
        (is_nil(primary) or Date.compare(primary.balance_date, date) == :lt)
    end)
  end

  defp salary_registered?(group_id, date) do
    from = Date.add(date, -3)

    Expense
    |> where(
      [e],
      e.group_id == ^group_id and e.source == "salary" and e.date >= ^from and e.date <= ^date
    )
    |> Repo.exists?()
  end

  defp income?(occ, partner),
    do: occ.bill.direction == "income" and (is_nil(partner) or occ.bill.id != partner.bill_id)

  @doc """
  The partner's expected salary in `month`, or nil when none was typed. It
  only counts while not received: once received it is already in the balance.
  """
  def partner_income(group_id, {year, mon} = month, today) do
    case partner_bill(group_id, month) do
      nil ->
        nil

      bill ->
        occ = group_id |> Bills.occurrences(month, today) |> Enum.find(&(&1.bill.id == bill.id))

        %{
          bill_id: bill.id,
          month: month,
          label: bill.name,
          date: Bills.due_date(bill, {year, mon}),
          amount: bill.amount,
          received: occ != nil and occ.status == "paid"
        }
    end
  end

  defp partner_amount(%{received: false, amount: amount}), do: amount
  defp partner_amount(_), do: zero()

  defp partner_bill(group_id, {year, month}) do
    once = Date.new!(year, month, 1)

    RecurringBill
    |> where(
      [b],
      b.group_id == ^group_id and b.partner_income == true and b.once_month == ^once and
        b.active == true
    )
    |> limit(1)
    |> Repo.one()
  end

  @doc """
  Sets the partner's expected salary of `month`. The first time in a month it
  takes over a one-off expected income named "Salário…" already typed there;
  otherwise it repeats the name, day and account of the latest month (default
  "#{@default_partner_name}" on day #{@default_partner_day}). A nil or zero
  amount removes the month's expectation, unless it was already received.
  """
  def set_partner_income(group_id, {year, month} = m, amount) do
    once = Date.new!(year, month, 1)
    bill = partner_bill(group_id, m) || adoptable_bill(group_id, once)
    remove? = is_nil(amount) or Decimal.compare(amount, 0) != :gt

    cond do
      remove? and is_nil(bill) ->
        {:ok, nil}

      remove? ->
        with :ok <- not_received(group_id, bill, m),
             {:ok, _} <- Bills.deactivate_bill(bill),
             do: {:ok, nil}

      bill ->
        Bills.update_bill(bill, %{amount: amount, partner_income: true})

      true ->
        template = latest_partner_bill(group_id)
        settings = Salary.get_settings(group_id)
        primary = Finance.get_primary_account(group_id)

        Bills.create_bill(group_id, %{
          name: (template && template.name) || @default_partner_name,
          due_day: (template && template.due_day) || @default_partner_day,
          account_id:
            (template && template.account_id) || settings.salary_account_id ||
              (primary && primary.id),
          amount: amount,
          direction: "income",
          once_month: once,
          partner_income: true
        })
    end
  end

  defp not_received(group_id, bill, month) do
    case partner_income(group_id, month, Date.utc_today()) do
      %{bill_id: id, received: true} when id == bill.id -> {:error, :already_received}
      _ -> :ok
    end
  end

  defp adoptable_bill(group_id, once) do
    RecurringBill
    |> where(
      [b],
      b.group_id == ^group_id and b.direction == "income" and b.once_month == ^once and
        b.active == true and (ilike(b.name, "salário%") or ilike(b.name, "salario%"))
    )
    |> limit(1)
    |> Repo.one()
  end

  defp latest_partner_bill(group_id) do
    RecurringBill
    |> where([b], b.group_id == ^group_id and b.partner_income == true)
    |> order_by([b], desc: b.once_month)
    |> limit(1)
    |> Repo.one()
  end

  # ---- Other cards ----

  # Invoices of another card due in the window. `:owed` (current block): what
  # is still unpaid of each invoice plus its fixed bills not yet charged.
  # `:planned` (next block): its installments plus its fixed bills.
  defp other_card_items(ctx, card, from, to, mode) do
    current = Invoices.current_month(card, ctx.today)

    for offset <- -2..3,
        month = Calendar.add_months(current, offset),
        due = Invoices.due_date(card, month),
        mode == :owed or Date.compare(due, from) != :lt,
        Date.compare(due, to) != :gt,
        amount = other_card_amount(ctx, card, month, mode),
        Decimal.compare(amount, 0) == :gt do
      %{label: "Fatura #{card.name}", date: due, amount: amount}
    end
  end

  defp other_card_amount(ctx, card, month, mode) do
    start = Invoices.start_date(card, month)
    last_day = Date.add(Invoices.closing_date(card, month), -1)

    bills =
      ctx.group_id
      |> occurrences_between(months_between(start, last_day), ctx.today)
      |> Enum.filter(fn occ ->
        occ.bill.account_id == card.id and occ.bill.direction == "expense" and
          in_range?(occ.due_date, start, last_day) and
          if(mode == :owed,
            do: occ.status in ["pending", "overdue"],
            else: occ.status != "skipped"
          )
      end)
      |> Enum.map(if(mode == :owed, do: &item/1, else: &planned_item/1))
      |> sum()

    base =
      case mode do
        :owed ->
          invoice = Invoices.build(card, month, ctx.today)
          if invoice.status in ["paid", "empty"], do: zero(), else: invoice.remaining

        :planned ->
          installment_sum(card, month)
      end

    Decimal.add(base, bills)
  end

  # ---- Installments ----

  defp installment_items(card, month) do
    amount = installment_sum(card, month)

    if Decimal.compare(amount, 0) == :gt,
      do: [
        %{label: "Parcelas #{card.name}", date: Invoices.due_date(card, month), amount: amount}
      ],
      else: []
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
    |> Kernel.||(zero())
  end

  # ---- Helpers ----

  defp occurrences_between(group_id, months, today),
    do: Enum.flat_map(months, &Bills.occurrences(group_id, &1, today))

  # Months from the one before `from` (for overdue items) to the one of `to`.
  defp months_between(from, to) do
    {from.year, from.month}
    |> Calendar.add_months(-1)
    |> Stream.iterate(&Calendar.add_months(&1, 1))
    |> Enum.take_while(&(&1 <= {to.year, to.month}))
  end

  defp boleto?(occ),
    do: occ.bill.direction == "expense" and occ.bill.account.kind != "credit_card"

  defp one_off?(occ), do: not is_nil(occ.bill.once_month)

  defp item(occ), do: %{label: occ.bill.name, date: occ.due_date, amount: occ.amount}

  # A running quota is planned at its full value, whatever was already spent.
  defp planned_item(%{bill: %{kind: "quota"} = bill} = occ),
    do: %{label: bill.name, date: occ.due_date, amount: bill.amount}

  defp planned_item(occ), do: item(occ)

  defp in_range?(date, from, to),
    do: Date.compare(date, from) != :lt and Date.compare(date, to) != :gt

  defp on_or_before?(date, cutoff), do: Date.compare(date, cutoff) != :gt

  defp sum(items), do: Enum.reduce(items, zero(), &Decimal.add(&2, &1.amount))

  defp zero, do: Decimal.new("0")
end
