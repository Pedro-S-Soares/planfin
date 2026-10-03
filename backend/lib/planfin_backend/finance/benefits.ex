defmodule PlanfinBackend.Finance.Benefits do
  @moduledoc """
  Meal voucher accounts (`kind: "benefit"`).

  They work like an account with its own balance, receive `monthly_credit` on
  `credit_day` every month (clamped to the month's last day) and their
  spending stays outside the household budget.

  The credit is recorded lazily, like card bills: before reads, every credit
  date that has arrived since the account's reconciliation becomes an income
  entry (`source: "benefit_credit"`). A unique index keeps it to one per day.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Expenses, Repo}
  alias PlanfinBackend.Finance.{Account, Calendar}

  @doc "Credit date of `{year, month}` for the account."
  def credit_date(%Account{credit_day: day}, {year, month}),
    do: Date.new!(year, month, min(day, Elixir.Calendar.ISO.days_in_month(year, month)))

  @doc "Next credit date after `today` (today's credit is already recorded on read)."
  def next_credit_date(%Account{credit_day: nil}, _today), do: nil

  def next_credit_date(%Account{} = account, %Date{} = today) do
    this_month = credit_date(account, {today.year, today.month})

    if Date.compare(this_month, today) != :gt,
      do: credit_date(account, Calendar.add_months({today.year, today.month}, 1)),
      else: this_month
  end

  @doc """
  Records the monthly credit of every benefit account whose date has arrived
  (looking back two months). Credits dated on or before the reconciliation day
  are already inside the balance and are skipped.
  """
  def credit_due(group_id, %Date{} = today) do
    accounts =
      Account
      |> where(
        [a],
        a.group_id == ^group_id and a.kind == "benefit" and is_nil(a.archived_at) and
          not is_nil(a.monthly_credit) and not is_nil(a.credit_day)
      )
      |> Repo.all()

    if accounts != [] do
      owner_id = Repo.get!(PlanfinBackend.Groups.Group, group_id).owner_id
      current = {today.year, today.month}

      for account <- accounts,
          offset <- -2..0,
          date = credit_date(account, Calendar.add_months(current, offset)),
          Date.compare(date, today) != :gt,
          Date.compare(date, account.balance_date) == :gt,
          not credited?(account, date) do
        Expenses.create_expense(group_id, owner_id, %{
          amount: account.monthly_credit,
          date: date,
          type: "income",
          note: "Crédito do #{account.name}",
          account_id: account.id,
          counts_in_budget: false,
          source: "benefit_credit"
        })
      end
    end

    :ok
  end

  defp credited?(account, date) do
    PlanfinBackend.Expenses.Expense
    |> where(
      [e],
      e.account_id == ^account.id and e.date == ^date and e.source == "benefit_credit"
    )
    |> Repo.exists?()
  end
end
