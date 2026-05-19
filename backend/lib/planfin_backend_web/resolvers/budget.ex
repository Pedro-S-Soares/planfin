defmodule PlanfinBackendWeb.Resolvers.Budget do
  alias PlanfinBackend.{Categories, Periods, BudgetDays, Expenses}

  # ---- Queries ----

  def active_period(_parent, args, %{context: %{current_group: group}}) do
    today = parse_today(args)

    period_result =
      case Map.get(args, :period_id) do
        nil ->
          Periods.get_active_period(group.id)

        period_id ->
          case Periods.get_period(group.id, period_id) do
            {:ok, period} -> Periods.preload_budget_days(period)
            {:error, _} -> Periods.get_active_period(group.id)
          end
      end

    case period_result do
      {:ok, nil} ->
        {:ok, nil}

      {:ok, period} ->
        case BudgetDays.close_past_days(period, today) do
          {:abandoned, _abandoned_period} ->
            {:ok, nil}

          {:ok, period} ->
            case BudgetDays.get_or_create_today(period, today) do
              {:ok, budget_day} ->
                today_data = format_budget_day(budget_day, period, today)
                {:ok, format_period(period, today_data)}

              {:error, reason} ->
                {:error, inspect(reason)}
            end
        end
    end
  end

  def active_period(_parent, _args, context), do: access_error(context)

  def expense_history(_parent, %{period_id: period_id}, %{context: %{current_group: group}}) do
    case Periods.get_period(group.id, period_id) do
      {:ok, period} ->
        days =
          Expenses.list_expenses_by_period(group.id, period.id)
          |> Enum.map(fn %{date: date, expenses: expenses, total: total} ->
            %{
              date: Date.to_iso8601(date),
              total: Decimal.to_string(total),
              expenses: Enum.map(expenses, &format_expense/1)
            }
          end)

        {:ok, days}

      {:error, :not_found} ->
        {:error, "Period not found"}
    end
  end

  def expense_history(_parent, _args, context), do: access_error(context)

  def period_summary(_parent, %{period_id: period_id}, %{context: %{current_group: group}}) do
    case Periods.get_period(group.id, period_id) do
      {:ok, period} ->
        summary = Periods.get_period_summary(period)

        {:ok,
         %{
           total_budgeted: Decimal.to_string(summary.total_budgeted),
           total_spent: Decimal.to_string(summary.total_spent),
           difference: Decimal.to_string(summary.difference),
           days_count: summary.days_count
         }}

      {:error, :not_found} ->
        {:error, "Period not found"}
    end
  end

  def period_summary(_parent, _args, context), do: access_error(context)

  def list_categories(_parent, args, %{context: %{current_group: group}}) do
    type = Map.get(args, :type)

    categories =
      Categories.list_categories(group.id, type)
      |> Enum.map(fn category ->
        %{
          id: to_string(category.id),
          name: category.name,
          type: category.type,
          subcategories: Enum.map(category.subcategories, &format_subcategory/1)
        }
      end)

    {:ok, categories}
  end

  def list_categories(_parent, _args, context), do: access_error(context)

  def list_periods(_parent, _args, %{context: %{current_group: group}}) do
    periods =
      Periods.list_periods(group.id)
      |> Enum.map(fn period -> format_period(period, nil) end)

    {:ok, periods}
  end

  def list_periods(_parent, _args, context), do: access_error(context)

  # ---- Mutations ----

  def create_period(_parent, args, %{context: %{current_group: group}}) do
    start_date = Date.from_iso8601!(args.start_date)
    end_date = Date.from_iso8601!(args.end_date)
    daily_limit = Decimal.new(args.daily_limit)

    total_budget =
      case Map.get(args, :total_budget) do
        nil ->
          days = Date.diff(end_date, start_date) + 1
          Decimal.mult(daily_limit, Decimal.new(days))

        tb ->
          Decimal.new(tb)
      end

    attrs =
      %{
        start_date: start_date,
        end_date: end_date,
        daily_limit: daily_limit,
        total_budget: total_budget
      }
      |> maybe_put(:name, Map.get(args, :name), & &1)

    case Periods.create_period(group.id, attrs) do
      {:ok, period} ->
        {:ok, format_period(period, nil)}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
    end
  end

  def create_period(_parent, _args, context), do: access_error(context)

  def update_period(_parent, args, %{context: %{current_group: group}}) do
    case Periods.get_active_period(group.id) do
      {:ok, nil} ->
        {:error, "No active period"}

      {:ok, period} ->
        attrs =
          %{}
          |> maybe_put(:daily_limit, args[:daily_limit], &Decimal.new/1)
          |> maybe_put(:total_budget, args[:total_budget], &Decimal.new/1)

        case Periods.update_period(period, attrs) do
          {:ok, updated} -> {:ok, format_period(updated, nil)}
          {:error, changeset} -> {:error, format_errors(changeset)}
        end
    end
  end

  def update_period(_parent, _args, context), do: access_error(context)

  def create_expense(_parent, args, %{context: %{current_user: user, current_group: group}}) do
    attrs = %{
      amount: Decimal.new(args.amount),
      date: Date.from_iso8601!(args.date),
      note: Map.get(args, :note),
      is_extra: Map.get(args, :is_extra, false),
      subcategory_id: Map.get(args, :subcategory_id),
      type: Map.get(args, :type, "expense")
    }

    case Expenses.create_expense(group.id, user.id, attrs) do
      {:ok, expense} ->
        {:ok, format_expense(expense)}

      {:error, :no_active_period} ->
        {:error, "No active period"}

      {:error, :date_out_of_range} ->
        {:error, "Date is out of the period range"}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
    end
  end

  def create_expense(_parent, _args, context), do: access_error(context)

  def update_expense(_parent, %{id: id} = args, %{context: %{current_group: group}}) do
    attrs =
      %{}
      |> maybe_put(:amount, args[:amount], &Decimal.new/1)
      |> maybe_put(:date, args[:date], &Date.from_iso8601!/1)
      |> maybe_put(:note, args[:note], & &1)
      |> maybe_put(:is_extra, args[:is_extra], & &1)
      |> maybe_put(:subcategory_id, args[:subcategory_id], & &1)
      |> maybe_put(:type, args[:type], & &1)

    case Expenses.update_expense(group.id, id, attrs) do
      {:ok, expense} ->
        {:ok, format_expense(expense)}

      {:error, :not_found} ->
        {:error, "Expense not found"}

      {:error, :date_out_of_range} ->
        {:error, "Date is out of the period range"}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
    end
  end

  def update_expense(_parent, _args, context), do: access_error(context)

  def delete_expense(_parent, %{id: id}, %{context: %{current_group: group}}) do
    case Expenses.delete_expense(group.id, id) do
      {:ok, _expense} -> {:ok, true}
      {:error, :not_found} -> {:error, "Expense not found"}
    end
  end

  def delete_expense(_parent, _args, context), do: access_error(context)

  def create_category(_parent, args, %{context: %{current_group: group}}) do
    attrs = %{
      name: args.name,
      type: Map.get(args, :type, "expense")
    }

    case Categories.create_category(group.id, attrs) do
      {:ok, category} ->
        {:ok,
         %{
           id: to_string(category.id),
           name: category.name,
           type: category.type,
           subcategories: []
         }}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
    end
  end

  def create_category(_parent, _args, context), do: access_error(context)

  def update_category(_parent, %{id: id} = args, %{context: %{current_group: group}}) do
    try do
      category = Categories.get_category!(group.id, id)

      attrs =
        %{}
        |> maybe_put(:name, args[:name], & &1)
        |> maybe_put(:type, args[:type], & &1)

      case Categories.update_category(category, attrs) do
        {:ok, updated} ->
          updated = PlanfinBackend.Repo.preload(updated, :subcategories)

          {:ok,
           %{
             id: to_string(updated.id),
             name: updated.name,
             type: updated.type,
             subcategories: Enum.map(updated.subcategories, &format_subcategory/1)
           }}

        {:error, changeset} ->
          {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Category not found"}
    end
  end

  def update_category(_parent, _args, context), do: access_error(context)

  def delete_category(_parent, %{id: id}, %{context: %{current_group: group}}) do
    try do
      category = Categories.get_category!(group.id, id)

      case Categories.delete_category(category) do
        {:ok, _} -> {:ok, true}
        {:error, changeset} -> {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Category not found"}
    end
  end

  def delete_category(_parent, _args, context), do: access_error(context)

  def create_subcategory(_parent, %{category_id: category_id, name: name}, %{
        context: %{current_group: group}
      }) do
    try do
      category = Categories.get_category!(group.id, category_id)

      case Categories.create_subcategory(category, %{name: name}) do
        {:ok, subcategory} ->
          {:ok, format_subcategory(subcategory)}

        {:error, changeset} ->
          {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Category not found"}
    end
  end

  def create_subcategory(_parent, _args, context), do: access_error(context)

  def update_subcategory(_parent, %{id: id, name: name}, %{context: %{current_group: group}}) do
    try do
      subcategory = Categories.get_subcategory!(group.id, id)

      case Categories.update_subcategory(subcategory, %{name: name}) do
        {:ok, updated} ->
          {:ok, format_subcategory(updated)}

        {:error, changeset} ->
          {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Subcategory not found"}
    end
  end

  def update_subcategory(_parent, _args, context), do: access_error(context)

  def delete_subcategory(_parent, %{id: id}, %{context: %{current_group: group}}) do
    try do
      subcategory = Categories.get_subcategory!(group.id, id)

      case Categories.delete_subcategory(subcategory) do
        {:ok, _} -> {:ok, true}
        {:error, changeset} -> {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Subcategory not found"}
    end
  end

  def delete_subcategory(_parent, _args, context), do: access_error(context)

  # ---- Private helpers ----

  defp access_error(%{context: %{current_user: _}}), do: {:error, "No active group"}
  defp access_error(_), do: {:error, "Not authenticated"}

  defp maybe_put(map, _key, nil, _transform), do: map
  defp maybe_put(map, key, value, transform), do: Map.put(map, key, transform.(value))

  defp parse_today(%{today: date_str}) when is_binary(date_str) do
    Date.from_iso8601!(date_str)
  end

  defp parse_today(_args), do: Date.utc_today()

  defp format_period(period, today) do
    remaining_total = BudgetDays.compute_remaining_total(period)
    available_balance = BudgetDays.compute_today_balance(period)

    %{
      id: to_string(period.id),
      name: period.name,
      start_date: Date.to_iso8601(period.start_date),
      end_date: Date.to_iso8601(period.end_date),
      daily_limit: Decimal.to_string(period.daily_limit),
      total_budget: Decimal.to_string(period.total_budget),
      remaining_total: Decimal.to_string(remaining_total),
      available_balance: Decimal.to_string(available_balance),
      status: period.status,
      today: today
    }
  end

  defp format_budget_day(budget_day, period, today) do
    available = BudgetDays.compute_today_balance(period, today)

    %{
      id: to_string(budget_day.id),
      date: Date.to_iso8601(budget_day.date),
      daily_limit: Decimal.to_string(budget_day.daily_limit),
      carryover: Decimal.to_string(budget_day.carryover),
      available_balance: Decimal.to_string(available),
      closed_at:
        if(budget_day.closed_at, do: DateTime.to_iso8601(budget_day.closed_at), else: nil)
    }
  end

  defp format_expense(expense) do
    %{
      id: to_string(expense.id),
      amount: Decimal.to_string(expense.amount),
      date: Date.to_iso8601(expense.date),
      note: expense.note,
      is_extra: expense.is_extra,
      subcategory:
        if(expense.subcategory, do: format_subcategory(expense.subcategory), else: nil),
      created_by: format_created_by(expense)
    }
  end

  defp format_created_by(%{created_by: %{id: id, email: email}}) do
    %{id: to_string(id), email: email}
  end

  defp format_created_by(_), do: nil

  defp format_subcategory(subcategory) do
    %{
      id: to_string(subcategory.id),
      name: subcategory.name,
      category_id: to_string(subcategory.category_id)
    }
  end

  defp format_errors(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, val}, acc ->
        String.replace(acc, "%{#{key}}", to_string(val))
      end)
    end)
    |> Enum.map(fn {field, errors} -> "#{field}: #{Enum.join(errors, ", ")}" end)
    |> Enum.join("; ")
  end
end
