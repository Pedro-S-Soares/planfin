defmodule PlanfinBackend.Finance.Allowance do
  @moduledoc """
  Monthly allowance for the couple.

  The allowance is what the invoice plan (`CyclePlan`) leaves free once every
  commitment up to the eve of the salary after the one that pays the cycle
  card's invoice is covered:

    * invoice closed: its result (= the carry the next cycle starts with);
    * invoice open: its result minus the daily goal still to be spent until
      the closing (the active period's limit × the purchase days left).

  The month window used before (`MonthPlan`, up to the eve of the next salary)
  missed an invoice due right after the salary, so it offered money the plan
  needs.

  It is capped by the cash free until the next salary (`Panel`: the primary
  balance minus what leaves it before then): money that has not arrived yet,
  or that a bill takes before the salary lands, can't be transferred. When
  positive it is split equally between the allowance accounts and moved there
  out of the primary account. Distribution is offered in the last 3 days
  before the next salary (the month closing); a negative plan is shown as the
  shortfall. Without a card there is no invoice plan and nothing is offered.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.{Finance, Periods, Repo}
  alias PlanfinBackend.Finance.{CyclePlan, Panel, Salary, Transfer}

  @closing_days 3

  def build(group_id, today) do
    primary = Finance.get_primary_account(group_id)
    cycle = cycle_dates(group_id, today)
    breakdown = plan_breakdown(group_id, today)
    leftover = breakdown.leftover
    cash = cash_until_salary(group_id, primary, today)

    amount =
      leftover
      |> Decimal.min(cash)
      |> Decimal.max(Decimal.new("0"))
      |> Decimal.round(2, :down)

    {cycle_start, cycle_end} = cycle

    shortfall = leftover |> Decimal.negate() |> Decimal.max(Decimal.new("0"))
    accounts = allowance_accounts(group_id)
    shares = split(amount, length(accounts))
    distributable_from = Date.add(cycle_end, -(@closing_days - 1))

    %{
      cycle_end_date: cycle_end,
      opens_on: distributable_from,
      free: leftover,
      shortfall: shortfall,
      invoice_status: breakdown.invoice_status,
      plan_result: breakdown.plan_result,
      plan_until: breakdown.plan_until,
      goal_days: breakdown.goal_days,
      goal_daily: breakdown.goal_daily,
      goal_amount: breakdown.goal_amount,
      cash: cash,
      cash_until: Salary.horizon(group_id, today),
      capped: Decimal.compare(leftover, 0) == :gt and Decimal.compare(cash, leftover) == :lt,
      amount: amount,
      can_distribute:
        accounts != [] and primary != nil and Decimal.compare(amount, 0) == :gt and
          Date.compare(today, distributable_from) != :lt,
      distributed: distributed_between(group_id, cycle_start, cycle_end),
      primary_account_id: primary && primary.id,
      shares:
        Enum.zip_with(accounts, shares, fn account, share ->
          %{account: account, amount: share}
        end)
    }
  end

  @doc """
  Moves the allowance from the primary account to each allowance account in
  equal parts. `amount` defaults to the computed left over and can't exceed it.
  """
  def distribute(group_id, user_id, today, amount \\ nil) do
    plan = build(group_id, today)
    amount = amount || plan.amount

    cond do
      not plan.can_distribute ->
        {:error, :not_available}

      Decimal.compare(amount, plan.amount) == :gt or Decimal.compare(amount, 0) != :gt ->
        {:error, :invalid_amount}

      true ->
        shares = split(amount, length(plan.shares))

        Repo.transaction(fn ->
          plan.shares
          |> Enum.zip(shares)
          |> Enum.each(fn {%{account: account}, share} ->
            case Finance.create_transfer(group_id, user_id, %{
                   from_account_id: plan.primary_account_id,
                   to_account_id: account.id,
                   amount: share,
                   date: today,
                   kind: "allowance",
                   note: "Mesada"
                 }) do
              {:ok, _} -> :ok
              {:error, reason} -> Repo.rollback(reason)
            end
          end)

          build(group_id, today)
        end)
    end
  end

  @doc "Reserve goal and how much the reserve accounts hold today."
  def reserve_status(group_id, today) do
    goal = Salary.get_settings(group_id).reserve_goal

    total =
      group_id
      |> Finance.list_accounts()
      |> Enum.filter(&(&1.kind == "reserve"))
      |> Enum.reduce(Decimal.new("0"), &Decimal.add(&2, Finance.account_balance(&1, today)))

    %{goal: goal, total: total}
  end

  defp cycle_dates(group_id, today) do
    if Salary.configured?(Salary.get_settings(group_id)) do
      c = Salary.cycle(group_id, today)
      {c.start_date, c.end_date}
    else
      {Date.beginning_of_month(today), Date.end_of_month(today)}
    end
  end

  # What the invoice plan leaves free (see the moduledoc), with the parts of
  # the math shown on the Home: the plan's result minus the daily goal still to
  # be spent while the invoice is open. `plan_until` is the date the Home puts
  # on that result: the last purchase day while open (what can still be spent
  # until the closing), the eve of the salary after the one that pays the
  # invoice once closed (the left over until then). Zero without a plan.
  defp plan_breakdown(group_id, today) do
    case CyclePlan.build(group_id, today) do
      {:ok, %{current: %{status: "closed"} = current}} ->
        %{
          invoice_status: "closed",
          plan_result: current.result,
          plan_until: current.window_end,
          goal_days: nil,
          goal_daily: nil,
          goal_amount: nil,
          leftover: current.result
        }

      {:ok, %{current: current}} ->
        {daily, days} = goal_until_closing(group_id, today, current.last_purchase_date)
        goal = Decimal.mult(daily, days)

        %{
          invoice_status: current.status,
          plan_result: current.result,
          plan_until: current.last_purchase_date,
          goal_days: days,
          goal_daily: daily,
          goal_amount: goal,
          leftover: Decimal.sub(current.result, goal)
        }

      {:error, _} ->
        %{
          invoice_status: nil,
          plan_result: nil,
          plan_until: nil,
          goal_days: nil,
          goal_daily: nil,
          goal_amount: nil,
          leftover: Decimal.new("0")
        }
    end
  end

  # The daily goal still to be spent on the open invoice, as {daily, days}: the
  # active period's limit for each day from today to the eve of the closing (or
  # the period end). No active goal: {0, 0}.
  defp goal_until_closing(group_id, today, last_purchase_date) do
    case Periods.get_active_period(group_id, today) do
      {:ok, %{daily_limit: %Decimal{} = daily, end_date: end_date}} ->
        last = Enum.min([last_purchase_date, end_date], Date)
        {daily, max(Date.diff(last, today) + 1, 0)}

      _ ->
        {Decimal.new("0"), 0}
    end
  end

  # The primary balance minus what leaves it before the next salary.
  defp cash_until_salary(_group_id, nil, _today), do: Decimal.new("0")

  defp cash_until_salary(group_id, _primary, today) do
    Panel.build(group_id, today, Salary.horizon(group_id, today)).free || Decimal.new("0")
  end

  defp allowance_accounts(group_id) do
    group_id
    |> Finance.list_accounts()
    |> Enum.filter(&(&1.kind == "allowance"))
    |> Enum.sort_by(& &1.inserted_at, NaiveDateTime)
  end

  # Equal parts in cents; the remainder goes to the first ones.
  defp split(_amount, 0), do: []

  defp split(amount, n) do
    cents = amount |> Decimal.mult(100) |> Decimal.round(0, :down) |> Decimal.to_integer()
    base = div(cents, n)
    extra = rem(cents, n)

    for i <- 0..(n - 1) do
      Decimal.div(Decimal.new(base + if(i < extra, do: 1, else: 0)), 100) |> Decimal.round(2)
    end
  end

  defp distributed_between(group_id, from, to) do
    Transfer
    |> where(
      [t],
      t.group_id == ^group_id and t.kind == "allowance" and t.date >= ^from and t.date <= ^to
    )
    |> select([t], sum(t.amount))
    |> Repo.one()
    |> Kernel.||(Decimal.new("0"))
  end
end
