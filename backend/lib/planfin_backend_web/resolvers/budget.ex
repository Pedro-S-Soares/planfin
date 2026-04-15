defmodule PlanfinBackendWeb.Resolvers.Budget do
  alias PlanfinBackend.{Categories, Periods, BudgetDays, Expenses}

  # ---- Queries ----

  def active_period(_parent, args, %{context: %{current_user: user}}) do
    today = parse_today(args)

    case Periods.get_active_period(user.id) do
      {:ok, nil} ->
        {:ok, nil}

      {:ok, period} ->
        case BudgetDays.close_past_days(period, today) do
          {:abandoned, _abandoned_period} ->
            {:ok, nil}

          {:ok, period} ->
            case BudgetDays.get_or_create_today(period, today) do
              {:ok, budget_day} ->
                budget_day = load_expenses(budget_day)
                today_data = format_budget_day(budget_day)
                {:ok, format_period(period, today_data)}

              {:error, reason} ->
                {:error, inspect(reason)}
            end
        end
    end
  end

  def active_period(_parent, _args, _context), do: {:error, "Not authenticated"}

  def expense_history(_parent, %{period_id: period_id}, %{context: %{current_user: user}}) do
    case Periods.get_period(user.id, period_id) do
      {:ok, period} ->
        days =
          Expenses.list_expenses_by_period(user.id, period.id)
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

  def expense_history(_parent, _args, _context), do: {:error, "Not authenticated"}

  def period_summary(_parent, %{period_id: period_id}, %{context: %{current_user: user}}) do
    case Periods.get_period(user.id, period_id) do
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

  def period_summary(_parent, _args, _context), do: {:error, "Not authenticated"}

  def list_categories(_parent, _args, %{context: %{current_user: user}}) do
    categories =
      Categories.list_categories(user.id)
      |> Enum.map(fn category ->
        %{
          id: to_string(category.id),
          name: category.name,
          subcategories: Enum.map(category.subcategories, &format_subcategory/1)
        }
      end)

    {:ok, categories}
  end

  def list_categories(_parent, _args, _context), do: {:error, "Not authenticated"}

  def list_periods(_parent, _args, %{context: %{current_user: user}}) do
    periods =
      Periods.list_periods(user.id)
      |> Enum.map(fn period -> format_period(period, nil) end)

    {:ok, periods}
  end

  def list_periods(_parent, _args, _context), do: {:error, "Not authenticated"}

  # ---- Mutations ----

  def create_period(_parent, args, %{context: %{current_user: user}}) do
    attrs = %{
      start_date: Date.from_iso8601!(args.start_date),
      end_date: Date.from_iso8601!(args.end_date),
      daily_limit: Decimal.new(args.daily_limit)
    }

    case Periods.create_period(user.id, attrs) do
      {:ok, period} ->
        {:ok, format_period(period, nil)}

      {:error, :already_has_active_period} ->
        {:error, "User already has an active period"}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
    end
  end

  def create_period(_parent, _args, _context), do: {:error, "Not authenticated"}

  def create_expense(_parent, args, %{context: %{current_user: user}}) do
    attrs = %{
      amount: Decimal.new(args.amount),
      date: Date.from_iso8601!(args.date),
      note: Map.get(args, :note),
      subcategory_id: Map.get(args, :subcategory_id)
    }

    case Expenses.create_expense(user.id, attrs) do
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

  def create_expense(_parent, _args, _context), do: {:error, "Not authenticated"}

  def update_expense(_parent, %{id: id} = args, %{context: %{current_user: user}}) do
    attrs =
      %{}
      |> maybe_put(:amount, args[:amount], &Decimal.new/1)
      |> maybe_put(:date, args[:date], &Date.from_iso8601!/1)
      |> maybe_put(:note, args[:note], & &1)
      |> maybe_put(:subcategory_id, args[:subcategory_id], & &1)

    case Expenses.update_expense(user.id, id, attrs) do
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

  def update_expense(_parent, _args, _context), do: {:error, "Not authenticated"}

  def delete_expense(_parent, %{id: id}, %{context: %{current_user: user}}) do
    case Expenses.delete_expense(user.id, id) do
      {:ok, _expense} -> {:ok, true}
      {:error, :not_found} -> {:error, "Expense not found"}
    end
  end

  def delete_expense(_parent, _args, _context), do: {:error, "Not authenticated"}

  def create_category(_parent, %{name: name}, %{context: %{current_user: user}}) do
    case Categories.create_category(user.id, %{name: name}) do
      {:ok, category} ->
        {:ok,
         %{
           id: to_string(category.id),
           name: category.name,
           subcategories: []
         }}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
    end
  end

  def create_category(_parent, _args, _context), do: {:error, "Not authenticated"}

  def update_category(_parent, %{id: id, name: name}, %{context: %{current_user: user}}) do
    try do
      category = Categories.get_category!(user.id, id)

      case Categories.update_category(category, %{name: name}) do
        {:ok, updated} ->
          updated = PlanfinBackend.Repo.preload(updated, :subcategories)

          {:ok,
           %{
             id: to_string(updated.id),
             name: updated.name,
             subcategories: Enum.map(updated.subcategories, &format_subcategory/1)
           }}

        {:error, changeset} ->
          {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Category not found"}
    end
  end

  def update_category(_parent, _args, _context), do: {:error, "Not authenticated"}

  def delete_category(_parent, %{id: id}, %{context: %{current_user: user}}) do
    try do
      category = Categories.get_category!(user.id, id)

      case Categories.delete_category(category) do
        {:ok, _} -> {:ok, true}
        {:error, changeset} -> {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Category not found"}
    end
  end

  def delete_category(_parent, _args, _context), do: {:error, "Not authenticated"}

  def create_subcategory(_parent, %{category_id: category_id, name: name}, %{
        context: %{current_user: user}
      }) do
    try do
      category = Categories.get_category!(user.id, category_id)

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

  def create_subcategory(_parent, _args, _context), do: {:error, "Not authenticated"}

  def update_subcategory(_parent, %{id: id, name: name}, %{context: %{current_user: user}}) do
    try do
      subcategory = Categories.get_subcategory!(user.id, id)

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

  def update_subcategory(_parent, _args, _context), do: {:error, "Not authenticated"}

  def delete_subcategory(_parent, %{id: id}, %{context: %{current_user: user}}) do
    try do
      subcategory = Categories.get_subcategory!(user.id, id)

      case Categories.delete_subcategory(subcategory) do
        {:ok, _} -> {:ok, true}
        {:error, changeset} -> {:error, format_errors(changeset)}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Subcategory not found"}
    end
  end

  def delete_subcategory(_parent, _args, _context), do: {:error, "Not authenticated"}

  # ---- Private helpers ----

  defp maybe_put(map, _key, nil, _transform), do: map
  defp maybe_put(map, key, value, transform), do: Map.put(map, key, transform.(value))

  defp parse_today(%{today: date_str}) when is_binary(date_str) do
    Date.from_iso8601!(date_str)
  end

  defp parse_today(_args), do: Date.utc_today()

  defp format_period(period, today) do
    %{
      id: to_string(period.id),
      start_date: Date.to_iso8601(period.start_date),
      end_date: Date.to_iso8601(period.end_date),
      daily_limit: Decimal.to_string(period.daily_limit),
      status: period.status,
      today: today
    }
  end

  defp format_budget_day(budget_day) do
    available = BudgetDays.available_balance(budget_day)

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
      subcategory: if(expense.subcategory, do: format_subcategory(expense.subcategory), else: nil)
    }
  end

  defp format_subcategory(subcategory) do
    %{
      id: to_string(subcategory.id),
      name: subcategory.name,
      category_id: to_string(subcategory.category_id)
    }
  end

  defp load_expenses(budget_day) do
    PlanfinBackend.Repo.preload(budget_day, :expenses)
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
