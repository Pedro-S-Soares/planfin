import { useMemo } from "react";
import {
  categoryFacts,
  formatWindow,
  monthlyTotals,
  previousWindow,
  subcategoryComparison,
  windowFor,
} from "./analytics";
import { useDashboardData } from "./use-dashboard-data";
import type { RangeKey } from "./types";

export function useCategoryDetailController(categoryId: string, range: RangeKey) {
  const data = useDashboardData();
  const ready = data.status === "ready" ? data : null;
  const facts = ready?.facts;
  const categories = ready?.categories;
  const fetched = ready?.fetched;
  const today = ready?.today;
  const period = ready?.period ?? null;

  const view = useMemo(() => {
    if (!facts || !categories || !fetched || !today) return null;
    const category = categories.get(categoryId);
    if (!category) return null;

    const window = windowFor(range, today, period);
    const prev = previousWindow(window, fetched);
    const all = categoryFacts(facts, categoryId);
    const current = categoryFacts(facts, categoryId, window);
    const total = current.reduce((a, f) => a + f.amount, 0);
    const windowTotal = facts
      .filter((f) => f.date >= window.from && f.date <= window.to)
      .reduce((a, f) => a + f.amount, 0);
    const previousTotal = prev
      ? categoryFacts(facts, categoryId, prev).reduce((a, f) => a + f.amount, 0)
      : null;
    const largest = current.reduce<(typeof current)[number] | null>(
      (best, f) => (!best || f.amount > best.amount ? f : best),
      null,
    );

    return {
      category,
      window,
      today,
      windowLabel: formatWindow(window),
      current,
      total,
      share: windowTotal > 0 ? total / windowTotal : 0,
      delta: previousTotal ? total / previousTotal - 1 : null,
      count: current.length,
      ticket: current.length > 0 ? total / current.length : 0,
      largest,
      monthly: monthlyTotals(all, today, 12),
      subcategories: subcategoryComparison(all, window, prev),
    };
  }, [facts, categories, fetched, today, period, categoryId, range]);

  return { data, view };
}
