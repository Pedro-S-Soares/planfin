/**
 * Pure aggregations behind the dashboard charts. Every function takes the
 * normalised facts plus explicit dates (never reads the clock) so the output
 * is deterministic for a given input.
 */
import { OTHER_CATEGORY_ID } from "./palette";
import type { CategoryInfo, DateWindow, Fact, PeriodBudget, RangeKey } from "./types";

// ─── Dates (ISO "YYYY-MM-DD", local calendar) ───────────────────────────────

function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const d = toDate(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function addMonths(iso: string, n: number): string {
  const d = toDate(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
}

/** Whole days from a to b (b - a) */
export function diffDays(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86_400_000);
}

export function weekday(iso: string): number {
  return toDate(iso).getDay();
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  return toDate(`${key}-01`)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
}

export function formatDay(iso: string, withWeekday = false): string {
  return toDate(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    ...(withWeekday ? { weekday: "long" } : {}),
  });
}

/** "1 de set. – 30 de set.", with years when the window crosses one */
export function formatWindow(w: DateWindow): string {
  const withYear = w.from.slice(0, 4) !== w.to.slice(0, 4);
  const fmt = (iso: string) =>
    toDate(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
  return `${fmt(w.from)} – ${fmt(w.to)}`;
}

const inWindow = (w: DateWindow) => (f: Fact) => f.date >= w.from && f.date <= w.to;

const sum = (facts: Fact[]) => facts.reduce((acc, f) => acc + f.amount, 0);

// ─── Windows ─────────────────────────────────────────────────────────────────

const RANGE_MONTHS: Record<Exclude<RangeKey, "period">, number> = { "3m": 3, "6m": 6, "12m": 12 };

/** The backend caps a range at 400 days; this is what the dashboard fetches. */
export function fetchWindow(today: string, period: PeriodBudget | null): DateWindow {
  const to = period && period.endDate > today ? period.endDate : today;
  return { from: addDays(to, -400), to };
}

export function windowFor(range: RangeKey, today: string, period: PeriodBudget | null): DateWindow {
  if (range === "period" && period) return { from: period.startDate, to: period.endDate };
  const months = range === "period" ? 1 : RANGE_MONTHS[range];
  return { from: addDays(addMonths(today, -months), 1), to: today };
}

/** Same-length window right before `w`, or null when it would fall outside the fetched data. */
export function previousWindow(w: DateWindow, fetched: DateWindow): DateWindow | null {
  const len = diffDays(w.from, w.to) + 1;
  const prev = { from: addDays(w.from, -len), to: addDays(w.from, -1) };
  return prev.from >= fetched.from ? prev : null;
}

// ─── Period pace ─────────────────────────────────────────────────────────────

export type PeriodPace = {
  totalDays: number;
  elapsedDays: number;
  /** Spend per day of the period, index 0 = start date */
  daily: { date: string; total: number }[];
  spent: number;
  budget: number;
  dailyLimit: number;
  avgPerDay: number;
  projection: number;
  idealToDate: number;
  extras: { total: number; count: number };
};

export function periodPace(facts: Fact[], period: PeriodBudget, today: string): PeriodPace {
  const totalDays = diffDays(period.startDate, period.endDate) + 1;
  const elapsedDays = Math.min(totalDays, Math.max(0, diffDays(period.startDate, today) + 1));
  const inPeriod = facts.filter(inWindow({ from: period.startDate, to: period.endDate }));

  const byDate = new Map<string, number>();
  inPeriod.forEach((f) => byDate.set(f.date, (byDate.get(f.date) ?? 0) + f.amount));
  const daily = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(period.startDate, i);
    return { date, total: byDate.get(date) ?? 0 };
  });

  const spent = sum(inPeriod);
  const avgPerDay = elapsedDays > 0 ? spent / elapsedDays : 0;
  const extras = inPeriod.filter((f) => f.isExtra);

  return {
    totalDays,
    elapsedDays,
    daily,
    spent,
    budget: period.totalBudget,
    dailyLimit: period.dailyLimit,
    avgPerDay,
    projection: spent + avgPerDay * (totalDays - elapsedDays),
    idealToDate: (period.totalBudget * elapsedDays) / totalDays,
    extras: { total: sum(extras), count: extras.length },
  };
}

// ─── Categories ──────────────────────────────────────────────────────────────

export type CategoryTotal = CategoryInfo & {
  total: number;
  share: number;
  /** Relative change vs the previous window; null when there is nothing to compare */
  delta: number | null;
  subcategories: { name: string; total: number }[];
};

function byCategory(facts: Fact[]): Map<string, Fact[]> {
  const map = new Map<string, Fact[]>();
  facts.forEach((f) => {
    const list = map.get(f.categoryId);
    if (list) list.push(f);
    else map.set(f.categoryId, [f]);
  });
  return map;
}

function subTotals(facts: Fact[]): { name: string; total: number }[] {
  const map = new Map<string, number>();
  facts.forEach((f) => map.set(f.subcategoryName, (map.get(f.subcategoryName) ?? 0) + f.amount));
  return [...map.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

/** Largest first, with "Outros" always last. */
export function sortCategories<T extends { id: string; total: number }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      Number(a.id === OTHER_CATEGORY_ID) - Number(b.id === OTHER_CATEGORY_ID) || b.total - a.total,
  );
}

export function categoryTotals(
  facts: Fact[],
  window: DateWindow,
  prev: DateWindow | null,
  categories: Map<string, CategoryInfo>,
): CategoryTotal[] {
  const current = facts.filter(inWindow(window));
  const total = sum(current);
  const previous = prev ? byCategory(facts.filter(inWindow(prev))) : null;

  const list = [...byCategory(current).entries()].flatMap(([id, catFacts]) => {
    const info = categories.get(id);
    if (!info) return [];
    const catTotal = sum(catFacts);
    const prevTotal = previous ? sum(previous.get(id) ?? []) : 0;
    return [
      {
        ...info,
        total: catTotal,
        share: total > 0 ? catTotal / total : 0,
        delta: prevTotal > 0 ? catTotal / prevTotal - 1 : null,
        subcategories: subTotals(catFacts),
      },
    ];
  });

  return sortCategories(list);
}

// ─── Weekday ─────────────────────────────────────────────────────────────────

export type WeekdayAverage = { weekday: number; average: number; total: number };

/** Average spend per calendar day for each weekday (days without spend count as zero). */
export function weekdayAverages(facts: Fact[], window: DateWindow, today: string): WeekdayAverage[] {
  const to = window.to < today ? window.to : today;
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const days = [0, 0, 0, 0, 0, 0, 0];

  for (let d = window.from; d <= to; d = addDays(d, 1)) days[weekday(d)] += 1;
  facts.filter(inWindow({ from: window.from, to })).forEach((f) => {
    totals[weekday(f.date)] += f.amount;
  });

  return totals.map((total, i) => ({ weekday: i, total, average: days[i] > 0 ? total / days[i] : 0 }));
}

// ─── Monthly stack ───────────────────────────────────────────────────────────

export type MonthStack = {
  key: string;
  label: string;
  partial: boolean;
  total: number;
  values: Map<string, number>;
};

export function monthlyByCategory(
  facts: Fact[],
  today: string,
  months: number,
): { months: MonthStack[]; categoryIds: string[] } {
  const firstMonth = monthKey(addMonths(today, -(months - 1)));
  const keys = Array.from({ length: months }, (_, i) => monthKey(addMonths(`${firstMonth}-01`, i)));
  const stacks: MonthStack[] = keys.map((key) => ({
    key,
    label: monthLabel(key),
    partial: key === monthKey(today),
    total: 0,
    values: new Map(),
  }));
  const index = new Map(keys.map((k, i) => [k, i]));
  const overall = new Map<string, number>();

  facts.forEach((f) => {
    const i = index.get(monthKey(f.date));
    if (i === undefined || f.date > today) return;
    const s = stacks[i];
    s.total += f.amount;
    s.values.set(f.categoryId, (s.values.get(f.categoryId) ?? 0) + f.amount);
    overall.set(f.categoryId, (overall.get(f.categoryId) ?? 0) + f.amount);
  });

  const categoryIds = sortCategories([...overall.entries()].map(([id, total]) => ({ id, total }))).map(
    (c) => c.id,
  );
  return { months: stacks, categoryIds };
}

// ─── Members ─────────────────────────────────────────────────────────────────

export type MemberShare = { authorId: string; name: string; total: number; share: number };

export type MembersSplit = {
  members: MemberShare[];
  /** Per category, each member's share in the same order as `members` */
  byCategory: { categoryId: string; shares: number[] }[];
};

export function membersSplit(facts: Fact[], window: DateWindow, categoryOrder: string[]): MembersSplit {
  const current = facts.filter(inWindow(window));
  const total = sum(current);
  const totals = new Map<string, { name: string; total: number }>();
  current.forEach((f) => {
    const m = totals.get(f.authorId);
    if (m) m.total += f.amount;
    else totals.set(f.authorId, { name: f.authorName, total: f.amount });
  });

  const members = [...totals.entries()]
    .map(([authorId, m]) => ({ authorId, name: m.name, total: m.total, share: total > 0 ? m.total / total : 0 }))
    .sort((a, b) => b.total - a.total);

  const grouped = byCategory(current);
  const split = categoryOrder
    .filter((id) => grouped.has(id))
    .map((categoryId) => {
      const catFacts = grouped.get(categoryId) ?? [];
      const catTotal = sum(catFacts);
      return {
        categoryId,
        shares: members.map((m) =>
          catTotal > 0 ? sum(catFacts.filter((f) => f.authorId === m.authorId)) / catTotal : 0,
        ),
      };
    });

  return { members, byCategory: split };
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export type CalendarCell = { date: string; value: number | null };

export type CalendarYear = {
  /** Column-major: week by week, Sunday → Saturday. `value` is null after today. */
  cells: CalendarCell[];
  weeks: number;
  overLimitDays: number;
  pastDays: number;
  longestStreakWithinLimit: number;
  maxDay: { date: string; value: number } | null;
};

export function calendarYear(facts: Fact[], today: string, dailyLimit: number, weeks = 53): CalendarYear {
  const start = addDays(today, -((weeks - 1) * 7 + weekday(today)));
  const byDate = new Map<string, number>();
  facts.forEach((f) => {
    if (f.date >= start && f.date <= today) byDate.set(f.date, (byDate.get(f.date) ?? 0) + f.amount);
  });

  const cells: CalendarCell[] = [];
  let overLimitDays = 0;
  let pastDays = 0;
  let streak = 0;
  let longest = 0;
  let maxDay: CalendarYear["maxDay"] = null;

  for (let i = 0; i < weeks * 7; i += 1) {
    const date = addDays(start, i);
    if (date > today) {
      cells.push({ date, value: null });
      continue;
    }
    const value = byDate.get(date) ?? 0;
    cells.push({ date, value });
    pastDays += 1;
    if (value > dailyLimit) {
      overLimitDays += 1;
      streak = 0;
    } else {
      streak += 1;
      longest = Math.max(longest, streak);
    }
    if (!maxDay || value > maxDay.value) maxDay = { date, value };
  }

  return { cells, weeks, overLimitDays, pastDays, longestStreakWithinLimit: longest, maxDay };
}

// ─── Category detail ─────────────────────────────────────────────────────────

export function categoryFacts(facts: Fact[], categoryId: string, window?: DateWindow): Fact[] {
  return facts.filter((f) => f.categoryId === categoryId && (!window || inWindow(window)(f)));
}

export function monthlyTotals(
  facts: Fact[],
  today: string,
  months: number,
): { key: string; label: string; total: number; partial: boolean }[] {
  const { months: stacks } = monthlyByCategory(facts, today, months);
  return stacks.map(({ key, label, total, partial }) => ({ key, label, total, partial }));
}

export type SubcategoryComparison = { name: string; current: number; previous: number | null };

export function subcategoryComparison(
  facts: Fact[],
  window: DateWindow,
  prev: DateWindow | null,
): SubcategoryComparison[] {
  const current = subTotals(facts.filter(inWindow(window)));
  const previous = prev ? new Map(subTotals(facts.filter(inWindow(prev))).map((s) => [s.name, s.total])) : null;
  return current.map((s) => ({
    name: s.name,
    current: s.total,
    previous: previous ? (previous.get(s.name) ?? 0) : null,
  }));
}
