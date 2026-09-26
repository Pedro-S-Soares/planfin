import { useMemo, useState } from "react";
import {
  calendarYear,
  categoryTotals,
  formatWindow,
  membersSplit,
  monthlyByCategory,
  periodPace,
  previousWindow,
  weekdayAverages,
  windowFor,
} from "./analytics";
import { useDashboardData } from "./use-dashboard-data";
import type { RangeKey } from "./types";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "period", label: "Período atual" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "12m", label: "12 meses" },
];

export function useDashboardController() {
  const data = useDashboardData();
  const [range, setRange] = useState<RangeKey>("period");

  const ready = data.status === "ready" ? data : null;
  const facts = ready?.facts;
  const categories = ready?.categories;
  const fetched = ready?.fetched;
  const today = ready?.today;
  const period = ready?.period ?? null;

  const view = useMemo(() => {
    if (!facts || !categories || !fetched || !today) return null;
    const window = windowFor(range, today, period);
    const prev = previousWindow(window, fetched);
    const ranked = categoryTotals(facts, window, prev, categories);
    const dailyLimit = period?.dailyLimit ?? 0;

    return {
      window,
      windowLabel: formatWindow(window),
      comparedToPrevious: prev !== null,
      pace: period ? periodPace(facts, period, today) : null,
      ranked,
      total: ranked.reduce((a, c) => a + c.total, 0),
      weekday: weekdayAverages(facts, window, today),
      monthly: monthlyByCategory(facts, today, 6),
      members: membersSplit(facts, window, ranked.map((c) => c.id)),
      calendar: calendarYear(facts, today, dailyLimit),
      dailyLimit,
    };
  }, [facts, categories, fetched, today, period, range]);

  return { data, range, setRange, view, categories };
}
