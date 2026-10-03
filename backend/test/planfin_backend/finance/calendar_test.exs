defmodule PlanfinBackend.Finance.CalendarTest do
  use ExUnit.Case, async: true

  alias PlanfinBackend.Finance.Calendar

  test "easter dates" do
    assert Calendar.easter(2026) == ~D[2026-04-05]
    assert Calendar.easter(2027) == ~D[2027-03-28]
  end

  test "saturday is a labor business day, sunday and holidays are not" do
    assert Calendar.labor_business_day?(~D[2026-10-03])
    refute Calendar.labor_business_day?(~D[2026-10-04])
    refute Calendar.labor_business_day?(~D[2026-10-12])
    # Carnaval is not a national holiday
    assert Calendar.labor_business_day?(~D[2027-02-08])
  end

  test "bank calendar skips weekends, holidays and carnaval" do
    refute Calendar.bank_business_day?(~D[2026-10-03])
    refute Calendar.bank_business_day?(~D[2027-02-09])
    assert Calendar.next_bank_business_day(~D[2026-11-15]) == ~D[2026-11-16]
    assert Calendar.next_bank_business_day(~D[2026-10-15]) == ~D[2026-10-15]
  end

  test "10th labor business day matches the salary simulation" do
    expected = [
      {2026, 10, ~D[2026-10-13]},
      {2026, 11, ~D[2026-11-13]},
      {2026, 12, ~D[2026-12-11]},
      {2027, 1, ~D[2027-01-13]},
      {2027, 2, ~D[2027-02-11]}
    ]

    for {y, m, date} <- expected do
      assert Calendar.nth_labor_business_day(y, m, 10) == date
    end
  end

  test "shift_date clamps to the end of month" do
    assert Calendar.shift_date(~D[2026-01-31], 1) == ~D[2026-02-28]
    assert Calendar.shift_date(~D[2026-11-20], 2) == ~D[2027-01-20]
  end
end
