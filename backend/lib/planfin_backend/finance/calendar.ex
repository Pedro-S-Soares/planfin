defmodule PlanfinBackend.Finance.Calendar do
  @moduledoc """
  Brazilian business-day rules.

  Two calendars coexist:

    * **Labor** (salary): Monday to Saturday count as business days; Sundays and
      national holidays don't. Carnaval is not a national holiday, so it counts.
    * **Bank** (due dates): Monday to Friday, without national holidays and
      without Carnaval Monday/Tuesday (banks don't clear on those days).
  """

  @doc "National holidays of `year`, as a MapSet of dates."
  def national_holidays(year) do
    easter = easter(year)

    MapSet.new([
      Date.new!(year, 1, 1),
      Date.add(easter, -2),
      Date.new!(year, 4, 21),
      Date.new!(year, 5, 1),
      Date.add(easter, 60),
      Date.new!(year, 9, 7),
      Date.new!(year, 10, 12),
      Date.new!(year, 11, 2),
      Date.new!(year, 11, 15),
      Date.new!(year, 11, 20),
      Date.new!(year, 12, 25)
    ])
  end

  @doc "Carnaval Monday and Tuesday of `year`."
  def carnaval(year) do
    easter = easter(year)
    MapSet.new([Date.add(easter, -48), Date.add(easter, -47)])
  end

  def labor_business_day?(%Date{} = date) do
    Date.day_of_week(date) != 7 and not MapSet.member?(national_holidays(date.year), date)
  end

  def bank_business_day?(%Date{} = date) do
    Date.day_of_week(date) <= 5 and
      not MapSet.member?(national_holidays(date.year), date) and
      not MapSet.member?(carnaval(date.year), date)
  end

  @doc "The `n`-th labor business day of the given month."
  def nth_labor_business_day(year, month, n) when n >= 1 do
    Date.new!(year, month, 1)
    |> Stream.iterate(&Date.add(&1, 1))
    |> Stream.filter(&labor_business_day?/1)
    |> Enum.at(n - 1)
  end

  @doc "`date` itself when it is a bank business day, otherwise the next one."
  def next_bank_business_day(%Date{} = date) do
    if bank_business_day?(date), do: date, else: next_bank_business_day(Date.add(date, 1))
  end

  @doc "Easter Sunday (Gregorian, anonymous algorithm)."
  def easter(year) do
    a = rem(year, 19)
    b = div(year, 100)
    c = rem(year, 100)
    d = div(b, 4)
    e = rem(b, 4)
    f = div(b + 8, 25)
    g = div(b - f + 1, 3)
    h = rem(19 * a + b - d - g + 15, 30)
    i = div(c, 4)
    k = rem(c, 4)
    l = rem(32 + 2 * e + 2 * i - h - k, 7)
    m = div(a + 11 * h + 22 * l, 451)
    month = div(h + l - 7 * m + 114, 31)
    day = rem(h + l - 7 * m + 114, 31) + 1
    Date.new!(year, month, day)
  end

  @doc "Adds `months` to a `{year, month}` tuple."
  def add_months({year, month}, months) do
    total = year * 12 + (month - 1) + months
    {div(total, 12), rem(total, 12) + 1}
  end

  @doc "Same day `months` later, clamped to the last day of the target month."
  def shift_date(%Date{} = date, months) do
    {y, m} = add_months({date.year, date.month}, months)
    day = min(date.day, Calendar.ISO.days_in_month(y, m))
    Date.new!(y, m, day)
  end
end
