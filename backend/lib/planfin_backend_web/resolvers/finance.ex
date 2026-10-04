defmodule PlanfinBackendWeb.Resolvers.Finance do
  require Ecto.Query

  alias PlanfinBackend.{Expenses, Finance}

  alias PlanfinBackend.Finance.{
    Allowance,
    Bills,
    Calendar,
    FreshPlan,
    Invoices,
    Panel,
    Projection,
    Salary
  }

  alias PlanfinBackendWeb.Resolvers.Budget

  # ---- Queries ----

  def list_accounts(_parent, args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)
    today = today(args)
    {:ok, group.id |> Finance.list_accounts() |> Enum.map(&format_account(&1, today))}
  end

  def list_accounts(_parent, _args, context), do: access_error(context)

  def list_invoices(_parent, %{card_id: card_id} = args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)

    with {:ok, card} <- fetch_card(group.id, card_id) do
      past = args |> Map.get(:past, 3) |> max(0) |> min(24)
      {:ok, card |> Invoices.list(today(args), past) |> Enum.map(&format_invoice/1)}
    end
  end

  def list_invoices(_parent, _args, context), do: access_error(context)

  def get_invoice(_parent, %{card_id: card_id, month: month} = args, %{
        context: %{current_group: group}
      }) do
    charge_card_bills(group.id, args)

    with {:ok, card} <- fetch_card(group.id, card_id),
         {:ok, month} <- parse_month(month) do
      {:ok, card |> Invoices.build(month, today(args), with_entries: true) |> format_invoice()}
    end
  end

  def get_invoice(_parent, _args, context), do: access_error(context)

  def list_movements(_parent, %{account_id: id} = args, %{context: %{current_group: group}}) do
    with {:ok, account} <- fetch_account(group.id, id) do
      limit = args |> Map.get(:limit, 50) |> max(1) |> min(200)

      {:ok,
       account
       |> Finance.list_movements(limit)
       |> Enum.map(fn m ->
         %{m | date: Date.to_iso8601(m.date), amount: Decimal.to_string(m.amount)}
       end)}
    end
  end

  def list_movements(_parent, _args, context), do: access_error(context)

  def panel(_parent, args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)
    today = today(args)
    horizon = horizon(group.id, today)

    panel =
      group.id
      |> Panel.build(today, horizon)
      |> format_panel()
      |> Map.put(:salary, format_salary_info(Salary.panel_info(group.id, today)))

    {:ok, panel}
  end

  def panel(_parent, _args, context), do: access_error(context)

  def get_settings(_parent, args, %{context: %{current_group: group}}) do
    {:ok, format_settings(group.id, Salary.get_settings(group.id), today(args))}
  end

  def get_settings(_parent, _args, context), do: access_error(context)

  def cycle_proposal(_parent, args, %{context: %{current_group: group}}) do
    case Salary.proposal(group.id, today(args)) do
      nil -> {:ok, nil}
      p -> {:ok, format_proposal(p)}
    end
  end

  def cycle_proposal(_parent, _args, context), do: access_error(context)

  def salary_projection(_parent, args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)

    case Projection.build(group.id, today(args)) do
      nil -> {:ok, nil}
      p -> {:ok, format_projection(p)}
    end
  end

  def salary_projection(_parent, _args, context), do: access_error(context)

  def allowance_plan(_parent, args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)
    {:ok, group.id |> Allowance.build(today(args)) |> format_allowance()}
  end

  def allowance_plan(_parent, _args, context), do: access_error(context)

  def reserve_status(_parent, args, %{context: %{current_group: group}}) do
    status = Allowance.reserve_status(group.id, today(args))
    {:ok, %{goal: decimal_string(status.goal), total: Decimal.to_string(status.total)}}
  end

  def reserve_status(_parent, _args, context), do: access_error(context)

  def distribute_allowance(_parent, args, %{context: %{current_group: group, current_user: user}}) do
    amount_result =
      case args[:amount] do
        nil -> {:ok, nil}
        value -> parse_decimal(value)
      end

    with {:ok, amount} <- amount_result do
      case Allowance.distribute(group.id, user.id, today(args), amount) do
        {:ok, plan} -> {:ok, format_allowance(plan)}
        {:error, :not_available} -> {:error, "Allowance is not available now"}
        {:error, :invalid_amount} -> {:error, "Amount exceeds what is left over"}
        {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
        {:error, reason} -> {:error, inspect(reason)}
      end
    end
  end

  def distribute_allowance(_parent, _args, context), do: access_error(context)

  def fresh_plan(_parent, args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)
    {:ok, group.id |> FreshPlan.build(today(args)) |> format_fresh_plan()}
  end

  def fresh_plan(_parent, _args, context), do: access_error(context)

  def set_invoice_total(_parent, args, %{context: %{current_group: group, current_user: user}}) do
    with {:ok, card} <- fetch_card(group.id, args.card_id),
         {:ok, month} <- parse_month(args.month),
         {:ok, total} <- parse_decimal(args.total),
         {:ok, invoice} <- Invoices.set_total(group.id, user.id, card, month, total, today(args)) do
      {:ok, format_invoice(invoice)}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, msg} when is_binary(msg) -> {:error, msg}
      {:error, reason} -> {:error, inspect(reason)}
    end
  end

  def set_invoice_total(_parent, _args, context), do: access_error(context)

  def start_fresh_plan(_parent, args, %{context: %{current_group: group}}) do
    gordura_result =
      case args[:gordura] do
        nil -> {:ok, Decimal.new("0")}
        value -> parse_decimal(value)
      end

    with {:ok, gordura} <- gordura_result do
      case FreshPlan.start(group.id, gordura, today(args), args[:name]) do
        {:ok, period} -> {:ok, Budget.format_period(period, nil)}
        {:error, :insufficient} -> {:error, "Not enough left for variable spending"}
        {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
        {:error, reason} -> {:error, inspect(reason)}
      end
    end
  end

  def start_fresh_plan(_parent, _args, context), do: access_error(context)

  def list_bills(_parent, _args, %{context: %{current_group: group}}) do
    {:ok, group.id |> Bills.list_bills() |> Enum.map(&format_bill/1)}
  end

  def list_bills(_parent, _args, context), do: access_error(context)

  def bill_occurrences(_parent, %{month: month} = args, %{context: %{current_group: group}}) do
    charge_card_bills(group.id, args)

    with {:ok, month} <- parse_month(month) do
      {:ok, group.id |> Bills.occurrences(month, today(args)) |> Enum.map(&format_occurrence/1)}
    end
  end

  def bill_occurrences(_parent, _args, context), do: access_error(context)

  # ---- Mutations ----

  def update_settings(_parent, args, %{context: %{current_group: group}}) do
    with {:ok, attrs} <- settings_attrs(args),
         {:ok, settings} <- Salary.update_settings(group.id, attrs) do
      {:ok, format_settings(group.id, settings, today(args))}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, :account_not_found} -> {:error, "Account not found"}
      {:error, msg} -> {:error, msg}
    end
  end

  def update_settings(_parent, _args, context), do: access_error(context)

  def set_salary_date(_parent, %{month: month} = args, %{context: %{current_group: group}}) do
    with {:ok, month} <- parse_month(month) do
      case args[:date] do
        nil ->
          :ok = Salary.clear_salary_date(group.id, month)
          {:ok, true}

        date ->
          with {:ok, date} <- parse_date(date),
               {:ok, _} <- Salary.set_salary_date(group.id, month, date) do
            {:ok, true}
          end
      end
    end
  end

  def set_salary_date(_parent, _args, context), do: access_error(context)

  def register_salary(_parent, args, %{context: %{current_group: group, current_user: user}}) do
    settings = Salary.get_settings(group.id)

    amount_result =
      case args[:amount] do
        nil when is_nil(settings.salary_amount) -> {:error, "Salary amount not configured"}
        nil -> {:ok, settings.salary_amount}
        value -> parse_decimal(value)
      end

    with {:ok, amount} <- amount_result,
         {:ok, date} <- parse_date(args.date),
         {:ok, expense} <- Salary.register(group.id, user.id, amount, date) do
      {:ok, Budget.format_expense(expense)}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, msg} when is_binary(msg) -> {:error, msg}
      {:error, reason} -> {:error, inspect(reason)}
    end
  end

  def register_salary(_parent, _args, context), do: access_error(context)

  def create_bill(_parent, args, %{context: %{current_group: group}}) do
    with {:ok, amount} <- parse_decimal(args.amount),
         {:ok, bill} <-
           Bills.create_bill(group.id, %{
             name: args.name,
             amount: amount,
             due_day: args.due_day,
             account_id: args.account_id,
             subcategory_id: args[:subcategory_id]
           }) do
      {:ok, format_bill(bill)}
    else
      error -> bill_error(error)
    end
  end

  def create_bill(_parent, _args, context), do: access_error(context)

  def update_bill(_parent, %{id: id} = args, %{context: %{current_group: group}}) do
    with {:ok, bill} <- fetch_bill(group.id, id),
         {:ok, attrs} <- bill_attrs(args),
         {:ok, bill} <- Bills.update_bill(bill, attrs) do
      {:ok, format_bill(bill)}
    else
      error -> bill_error(error)
    end
  end

  def update_bill(_parent, _args, context), do: access_error(context)

  def delete_bill(_parent, %{id: id}, %{context: %{current_group: group}}) do
    with {:ok, bill} <- fetch_bill(group.id, id),
         {:ok, _} <- Bills.deactivate_bill(bill) do
      {:ok, true}
    end
  end

  def delete_bill(_parent, _args, context), do: access_error(context)

  def pay_bill(_parent, args, %{context: %{current_group: group, current_user: user}}) do
    with {:ok, bill} <- fetch_bill(group.id, args.bill_id),
         {:ok, month} <- parse_month(args.month),
         {:ok, amount} <- parse_decimal(args.amount),
         {:ok, date} <- parse_date(args.date),
         {:ok, occurrence} <- Bills.pay(group.id, user.id, bill, month, amount, date) do
      {:ok, format_occurrence(occurrence)}
    else
      {:error, %Ecto.Changeset{} = cs} ->
        if Keyword.has_key?(cs.errors, :bill_id),
          do: {:error, "This month is already paid"},
          else: {:error, Budget.format_errors(cs)}

      {:error, msg} when is_binary(msg) ->
        {:error, msg}

      {:error, :already_paid} ->
        {:error, "This month is already paid"}

      {:error, reason} ->
        {:error, inspect(reason)}
    end
  end

  def pay_bill(_parent, _args, context), do: access_error(context)

  def unpay_bill(_parent, args, %{context: %{current_group: group}}) do
    with {:ok, bill} <- fetch_bill(group.id, args.bill_id),
         {:ok, month} <- parse_month(args.month) do
      case Bills.unpay(group.id, bill, month) do
        :ok -> {:ok, true}
        {:error, :not_found} -> {:error, "This month is not paid"}
      end
    end
  end

  def unpay_bill(_parent, _args, context), do: access_error(context)

  def create_account(_parent, args, %{context: %{current_group: group}}) do
    attrs = %{
      name: args.name,
      kind: args.kind,
      closing_day: args[:closing_day],
      due_day: args[:due_day],
      credit_day: args[:credit_day],
      owner_user_id: parse_int(args[:owner_user_id])
    }

    with {:ok, attrs} <- put_decimal(attrs, :balance, args[:balance]),
         {:ok, attrs} <- put_decimal(attrs, :monthly_credit, args[:monthly_credit]),
         :ok <- validate_owner(group.id, attrs.owner_user_id),
         {:ok, account} <- Finance.create_account(group.id, attrs, today(args)) do
      {:ok, format_account(account, today(args))}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, msg} -> {:error, msg}
    end
  end

  def create_account(_parent, _args, context), do: access_error(context)

  def update_account(_parent, %{id: id} = args, %{context: %{current_group: group}}) do
    attrs =
      args
      |> Map.take([:name, :closing_day, :due_day, :credit_day])
      |> then(fn a ->
        if Map.has_key?(args, :owner_user_id),
          do: Map.put(a, :owner_user_id, parse_int(args.owner_user_id)),
          else: a
      end)

    with {:ok, attrs} <- put_optional_decimal(attrs, :invoice_goal, args),
         {:ok, attrs} <- put_optional_decimal(attrs, :monthly_credit, args),
         {:ok, account} <- fetch_account(group.id, id),
         :ok <- validate_owner(group.id, Map.get(attrs, :owner_user_id)),
         {:ok, account} <- Finance.update_account(account, attrs) do
      {:ok, format_account(account, Date.utc_today())}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, msg} -> {:error, msg}
    end
  end

  def update_account(_parent, _args, context), do: access_error(context)

  def make_primary(_parent, %{id: id}, %{context: %{current_group: group}}) do
    with {:ok, account} <- fetch_account(group.id, id),
         {:ok, account} <- Finance.make_primary(account) do
      {:ok, format_account(account, Date.utc_today())}
    else
      {:error, :not_checking} -> {:error, "Only a checking account can be primary"}
      {:error, msg} -> {:error, msg}
    end
  end

  def make_primary(_parent, _args, context), do: access_error(context)

  def archive_account(_parent, %{id: id}, %{context: %{current_group: group}}) do
    with {:ok, account} <- fetch_account(group.id, id),
         {:ok, _} <- Finance.archive_account(account) do
      {:ok, true}
    end
  end

  def archive_account(_parent, _args, context), do: access_error(context)

  def set_balance(_parent, %{id: id, balance: balance} = args, %{
        context: %{current_group: group}
      }) do
    with {:ok, account} <- fetch_account(group.id, id),
         {:ok, amount} <- parse_decimal(balance),
         {:ok, account} <- Finance.set_balance(account, amount, today(args)) do
      {:ok, format_account(account, today(args))}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, msg} -> {:error, msg}
    end
  end

  def set_balance(_parent, _args, context), do: access_error(context)

  def create_transfer(_parent, args, %{context: %{current_group: group, current_user: user}}) do
    with {:ok, amount} <- parse_decimal(args.amount),
         {:ok, date} <- parse_date(args.date),
         {:ok, transfer} <-
           Finance.create_transfer(group.id, user.id, %{
             from_account_id: args.from_account_id,
             to_account_id: args.to_account_id,
             amount: amount,
             date: date,
             kind: args[:kind] || "other",
             note: args[:note]
           }) do
      {:ok, format_transfer(transfer)}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, :not_found} -> {:error, "Account not found"}
      {:error, msg} -> {:error, msg}
    end
  end

  def create_transfer(_parent, _args, context), do: access_error(context)

  def delete_transfer(_parent, %{id: id}, %{context: %{current_group: group}}) do
    case Finance.delete_transfer(group.id, id) do
      {:ok, _} -> {:ok, true}
      {:error, :not_found} -> {:error, "Transfer not found"}
    end
  end

  def delete_transfer(_parent, _args, context), do: access_error(context)

  def pay_invoice(_parent, args, %{context: %{current_group: group, current_user: user}}) do
    with {:ok, card} <- fetch_card(group.id, args.card_id),
         {:ok, month} <- parse_month(args.month),
         {:ok, amount} <- parse_decimal(args.amount),
         {:ok, date} <- parse_date(args.date),
         {:ok, _transfer} <-
           Finance.create_transfer(group.id, user.id, %{
             from_account_id: args.from_account_id,
             to_account_id: card.id,
             amount: amount,
             date: date,
             kind: "card_payment",
             invoice_month: Invoices.month_date(month)
           }) do
      {:ok, card |> Invoices.build(month, date, with_entries: true) |> format_invoice()}
    else
      {:error, %Ecto.Changeset{} = cs} -> {:error, Budget.format_errors(cs)}
      {:error, :not_found} -> {:error, "Account not found"}
      {:error, msg} -> {:error, msg}
    end
  end

  def pay_invoice(_parent, _args, context), do: access_error(context)

  def assign_entries(_parent, %{account_id: id, from_date: from}, %{
        context: %{current_group: group}
      }) do
    with {:ok, from} <- parse_date(from) do
      case Expenses.assign_unassigned_to_account(group.id, id, from) do
        {:ok, count} -> {:ok, count}
        {:error, :account_not_found} -> {:error, "Account not found"}
      end
    end
  end

  def assign_entries(_parent, _args, context), do: access_error(context)

  # ---- Formatting ----

  @doc false
  def horizon(group_id, today), do: PlanfinBackend.Finance.Salary.horizon(group_id, today)

  defp format_panel(panel) do
    %{
      has_accounts: panel.has_accounts,
      primary_account_id: panel.primary_account_id,
      available: decimal_string(panel.available),
      committed: Decimal.to_string(panel.committed),
      free: decimal_string(panel.free),
      horizon_date: Date.to_iso8601(panel.horizon_date),
      commitments:
        Enum.map(panel.commitments, fn c ->
          %{
            c
            | due_date: Date.to_iso8601(c.due_date),
              amount: Decimal.to_string(c.amount),
              month: Invoices.format_month(c.month)
          }
        end)
    }
  end

  defp format_salary_info(info) do
    %{
      configured: info.configured,
      amount: decimal_string(info.amount),
      cycle_start_date: info.cycle_start_date && Date.to_iso8601(info.cycle_start_date),
      next_salary_date: info.next_salary_date && Date.to_iso8601(info.next_salary_date),
      pending: info.pending
    }
  end

  defp format_settings(group_id, settings, today) do
    upcoming =
      for offset <- 0..2 do
        month = Calendar.add_months({today.year, today.month}, offset)
        date = Salary.salary_date(group_id, month, settings)

        automatic =
          Calendar.nth_labor_business_day(
            elem(month, 0),
            elem(month, 1),
            settings.salary_business_day
          )

        %{
          month: Invoices.format_month(month),
          date: Date.to_iso8601(date),
          is_manual: date != automatic
        }
      end

    %{
      salary_amount: decimal_string(settings.salary_amount),
      salary_business_day: settings.salary_business_day,
      salary_account_id: settings.salary_account_id,
      reserve_goal: decimal_string(settings.reserve_goal),
      upcoming_salary_dates: upcoming
    }
  end

  defp format_allowance(plan) do
    %{
      cycle_end_date: Date.to_iso8601(plan.cycle_end_date),
      opens_on: Date.to_iso8601(plan.opens_on),
      free: Decimal.to_string(plan.free),
      shortfall: Decimal.to_string(plan.shortfall),
      amount: Decimal.to_string(plan.amount),
      can_distribute: plan.can_distribute,
      distributed: Decimal.to_string(plan.distributed),
      shares:
        Enum.map(plan.shares, fn %{account: a, amount: amount} ->
          owner = a.owner_user

          %{
            account_id: a.id,
            account_name: a.name,
            owner_name: owner && (owner.name || owner.email |> String.split("@") |> hd()),
            amount: Decimal.to_string(amount)
          }
        end)
    }
  end

  defp format_projection(p) do
    %{
      salary_date: Date.to_iso8601(p.salary_date),
      cycle_end_date: Date.to_iso8601(p.cycle_end_date),
      salary: Decimal.to_string(p.salary),
      account_bills: Decimal.to_string(p.account_bills),
      committed: Decimal.to_string(p.committed),
      left: Decimal.to_string(p.left),
      invoices:
        Enum.map(p.invoices, fn i ->
          %{
            card_id: i.card_id,
            card_name: i.card_name,
            month: Invoices.format_month(i.month),
            due_date: Date.to_iso8601(i.due_date),
            status: i.status,
            amount: Decimal.to_string(i.amount),
            pending_bills: Decimal.to_string(i.pending_bills)
          }
        end)
    }
  end

  defp format_fresh_plan(plan) do
    item = fn i ->
      %{
        label: i.label,
        date: Date.to_iso8601(i.date),
        amount: Decimal.to_string(i.amount),
        card_id: i.card_id,
        month: i.month && Invoices.format_month(i.month)
      }
    end

    %{
      start_date: Date.to_iso8601(plan.start_date),
      end_date: Date.to_iso8601(plan.end_date),
      days: plan.days,
      has_primary: plan.has_primary,
      balance: Decimal.to_string(plan.balance),
      salary_amount: plan.salary && Decimal.to_string(plan.salary.amount),
      salary_date: plan.salary && Date.to_iso8601(plan.salary.date),
      cards: Enum.map(plan.cards, item),
      account_bills: Enum.map(plan.account_bills, item),
      card_bills: Enum.map(plan.card_bills, item),
      variable: Decimal.to_string(plan.variable)
    }
  end

  defp format_proposal(p) do
    %{
      start_date: Date.to_iso8601(p.start_date),
      end_date: Date.to_iso8601(p.end_date),
      days: p.days,
      salary: Decimal.to_string(p.salary),
      account_bills: Decimal.to_string(p.account_bills),
      card_bills: Decimal.to_string(p.card_bills),
      installments: Decimal.to_string(p.installments),
      available: Decimal.to_string(p.available)
    }
  end

  defp settings_attrs(args) do
    Enum.reduce_while(
      [:salary_amount, :reserve_goal],
      {:ok, Map.take(args, [:salary_business_day, :salary_account_id])},
      fn key, {:ok, acc} ->
        case Map.fetch(args, key) do
          :error ->
            {:cont, {:ok, acc}}

          {:ok, nil} ->
            {:cont, {:ok, Map.put(acc, key, nil)}}

          {:ok, value} ->
            case parse_decimal(value) do
              {:ok, d} -> {:cont, {:ok, Map.put(acc, key, d)}}
              error -> {:halt, error}
            end
        end
      end
    )
  end

  defp format_bill(bill) do
    %{
      id: bill.id,
      name: bill.name,
      amount: Decimal.to_string(bill.amount),
      due_day: bill.due_day,
      account: %{id: bill.account.id, name: bill.account.name, kind: bill.account.kind},
      subcategory:
        if(match?(%PlanfinBackend.Categories.Subcategory{}, bill.subcategory),
          do: %{
            id: bill.subcategory.id,
            name: bill.subcategory.name,
            category_id: bill.subcategory.category_id,
            category: nil
          },
          else: nil
        )
    }
  end

  defp format_occurrence(occ) do
    %{
      bill: format_bill(occ.bill),
      month: Invoices.format_month(occ.month),
      due_date: Date.to_iso8601(occ.due_date),
      next_due_date: Date.to_iso8601(occ.next_due_date),
      paid_on: occ.paid_on && Date.to_iso8601(occ.paid_on),
      status: occ.status,
      amount: Decimal.to_string(occ.amount),
      expense_id: occ.expense_id
    }
  end

  @doc false
  def format_account(account, today) do
    %{
      id: account.id,
      name: account.name,
      kind: account.kind,
      is_primary: account.is_primary,
      balance: account |> Finance.account_balance(today) |> decimal_string(),
      balance_date: Date.to_iso8601(account.balance_date),
      closing_day: account.closing_day,
      due_day: account.due_day,
      invoice_goal: decimal_string(account.invoice_goal),
      monthly_credit: decimal_string(account.monthly_credit),
      credit_day: account.credit_day,
      next_credit_date:
        case PlanfinBackend.Finance.Benefits.next_credit_date(account, today) do
          nil -> nil
          date -> Date.to_iso8601(date)
        end,
      owner: format_owner(account.owner_user)
    }
  end

  defp format_owner(%PlanfinBackend.Accounts.User{} = u),
    do: %{id: to_string(u.id), email: u.email, name: u.name}

  defp format_owner(_), do: nil

  @doc false
  def format_invoice(invoice) do
    %{
      card_id: invoice.card_id,
      month: Invoices.format_month(invoice.month),
      start_date: Date.to_iso8601(invoice.start_date),
      closing_date: Date.to_iso8601(invoice.closing_date),
      due_date: Date.to_iso8601(invoice.due_date),
      total: Decimal.to_string(invoice.total),
      paid: Decimal.to_string(invoice.paid),
      remaining: Decimal.to_string(invoice.remaining),
      status: invoice.status,
      entries:
        case Map.get(invoice, :entries) do
          nil -> nil
          entries -> Enum.map(entries, &Budget.format_expense/1)
        end
    }
  end

  defp format_transfer(t) do
    %{
      id: t.id,
      from_account_id: t.from_account_id,
      to_account_id: t.to_account_id,
      amount: Decimal.to_string(t.amount),
      date: Date.to_iso8601(t.date),
      kind: t.kind,
      invoice_month: t.invoice_month && Date.to_iso8601(t.invoice_month),
      note: t.note
    }
  end

  # ---- Helpers ----

  # Card bills whose day has come are charged lazily, right before any read
  # that shows balances, invoices or bills.
  @doc false
  def charge_card_bills(group_id, args) do
    today = today(args)
    :ok = PlanfinBackend.Finance.Benefits.credit_due(group_id, today)
    Bills.charge_due_card_bills(group_id, today)
  end

  defp fetch_account(group_id, id) do
    case Finance.get_account(group_id, id) do
      {:ok, account} -> {:ok, account}
      {:error, :not_found} -> {:error, "Account not found"}
    end
  end

  defp fetch_bill(group_id, id) do
    case Bills.get_bill(group_id, id) do
      {:ok, bill} -> {:ok, bill}
      {:error, :not_found} -> {:error, "Bill not found"}
    end
  end

  defp bill_attrs(args) do
    base = Map.take(args, [:name, :due_day, :account_id, :subcategory_id])

    case args[:amount] do
      nil -> {:ok, base}
      amount -> with {:ok, d} <- parse_decimal(amount), do: {:ok, Map.put(base, :amount, d)}
    end
  end

  defp bill_error({:error, %Ecto.Changeset{} = cs}), do: {:error, Budget.format_errors(cs)}
  defp bill_error({:error, :account_not_found}), do: {:error, "Account not found"}
  defp bill_error({:error, msg}) when is_binary(msg), do: {:error, msg}

  defp fetch_card(group_id, id) do
    case fetch_account(group_id, id) do
      {:ok, %{kind: "credit_card"} = card} -> {:ok, card}
      {:ok, _} -> {:error, "Account is not a credit card"}
      error -> error
    end
  end

  defp validate_owner(_group_id, nil), do: :ok

  defp validate_owner(group_id, user_id) do
    member? =
      PlanfinBackend.Groups.GroupMembership
      |> Ecto.Query.where([m], m.group_id == ^group_id and m.user_id == ^user_id)
      |> PlanfinBackend.Repo.exists?()

    if member?,
      do: :ok,
      else: {:error, "Owner must be a member of the group"}
  end

  defp parse_month(month) do
    case Invoices.parse_month(month) do
      {:ok, m} -> {:ok, m}
      {:error, _} -> {:error, "Invalid month, expected YYYY-MM"}
    end
  end

  defp parse_decimal(value) when is_binary(value) do
    case Decimal.parse(value) do
      {d, ""} -> {:ok, d}
      _ -> {:error, "Invalid amount"}
    end
  end

  defp parse_decimal(_), do: {:error, "Invalid amount"}

  # Absent → untouched; null or "" → cleared; value → parsed.
  defp put_optional_decimal(attrs, key, args) do
    case Map.fetch(args, key) do
      :error -> {:ok, attrs}
      {:ok, v} when v in [nil, ""] -> {:ok, Map.put(attrs, key, nil)}
      {:ok, v} -> with {:ok, d} <- parse_decimal(v), do: {:ok, Map.put(attrs, key, d)}
    end
  end

  defp put_decimal(attrs, _key, nil), do: {:ok, attrs}

  defp put_decimal(attrs, key, value) do
    with {:ok, d} <- parse_decimal(value), do: {:ok, Map.put(attrs, key, d)}
  end

  defp parse_date(value) do
    case Date.from_iso8601(value || "") do
      {:ok, d} -> {:ok, d}
      _ -> {:error, "Invalid date"}
    end
  end

  defp parse_int(nil), do: nil
  defp parse_int(v) when is_integer(v), do: v

  defp parse_int(v) when is_binary(v) do
    case Integer.parse(v) do
      {i, ""} -> i
      _ -> nil
    end
  end

  defp today(%{today: t}) when is_binary(t) do
    case Date.from_iso8601(t) do
      {:ok, d} -> d
      _ -> Date.utc_today()
    end
  end

  defp today(_), do: Date.utc_today()

  defp decimal_string(nil), do: nil
  defp decimal_string(d), do: Decimal.to_string(d)

  defp access_error(%{context: %{current_user: _}}), do: {:error, "No active group"}
  defp access_error(_), do: {:error, "Not authenticated"}
end
