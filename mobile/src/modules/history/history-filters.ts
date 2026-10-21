import type {
  ExpenseDayWithAuthors,
  ExpenseWithAuthor,
  HistoryTransfer,
} from "../../graphql/expenses";

/** Where the money left from / arrived at: every account, one account, or entries with no account. */
export type AccountFilter = { kind: "all" } | { kind: "account"; id: string } | { kind: "none" };
export type DirectionFilter = "all" | "in" | "out";
export type NatureFilter = "all" | "recurring" | "variable";

export type HistoryFilters = {
  account: AccountFilter;
  direction: DirectionFilter;
  nature: NatureFilter;
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  account: { kind: "all" },
  direction: "all",
  nature: "all",
};

/** Entries produced every month: fixed bills (paid or charged on the card), salary and benefit credits. */
const RECURRING_SOURCES = new Set(["bill", "salary", "benefit_credit"]);

export function isRecurringEntry(entry: Pick<ExpenseWithAuthor, "source">): boolean {
  return entry.source != null && RECURRING_SOURCES.has(entry.source);
}

/**
 * `signedAmount` is null for a transfer seen from every account at once: it moves
 * money between two of the group's accounts, so it neither adds nor removes.
 */
export type HistoryItem =
  | { kind: "entry"; entry: ExpenseWithAuthor; signedAmount: number }
  | { kind: "transfer"; transfer: HistoryTransfer; signedAmount: number | null };

export type HistoryDay = { date: string; total: number; items: HistoryItem[] };

export type HistorySummary = { incoming: number; outgoing: number; net: number; count: number };

function toNumber(value: string | null | undefined): number {
  const n = parseFloat(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

function entryItem(entry: ExpenseWithAuthor, filters: HistoryFilters): HistoryItem | null {
  const { account, direction, nature } = filters;

  if (account.kind === "account" && entry.account?.id !== account.id) return null;
  if (account.kind === "none" && entry.account) return null;

  const isIncoming = entry.type === "income";
  if (direction === "in" && !isIncoming) return null;
  if (direction === "out" && isIncoming) return null;

  const isRecurring = isRecurringEntry(entry);
  if (nature === "recurring" && !isRecurring) return null;
  if (nature === "variable" && isRecurring) return null;

  const amount = toNumber(entry.amount);
  return { kind: "entry", entry, signedAmount: isIncoming ? amount : -amount };
}

function transferItem(transfer: HistoryTransfer, filters: HistoryFilters): HistoryItem | null {
  const { account, direction, nature } = filters;

  // A transfer is neither a fixed bill nor a variable expense, and has no account-less side.
  if (nature !== "all" || account.kind === "none") return null;

  if (account.kind === "all") {
    return direction === "all" ? { kind: "transfer", transfer, signedAmount: null } : null;
  }

  const isIncoming = transfer.toAccount?.id === account.id;
  const isOutgoing = transfer.fromAccount?.id === account.id;
  if (!isIncoming && !isOutgoing) return null;
  if (direction === "in" && !isIncoming) return null;
  if (direction === "out" && !isOutgoing) return null;

  const amount = toNumber(transfer.amount);
  return { kind: "transfer", transfer, signedAmount: isIncoming ? amount : -amount };
}

/** Applies the filters to the history, recomputing each day's net total from what stays visible. */
export function filterHistory(days: ExpenseDayWithAuthors[], filters: HistoryFilters): HistoryDay[] {
  return days.flatMap((day) => {
    const items = [
      ...day.expenses.map((entry) => entryItem(entry, filters)),
      ...(day.transfers ?? []).map((transfer) => transferItem(transfer, filters)),
    ].filter((item): item is HistoryItem => item !== null);

    if (items.length === 0) return [];
    const total = items.reduce((sum, item) => sum + (item.signedAmount ?? 0), 0);
    return [{ date: day.date, total, items }];
  });
}

export function summarizeHistory(days: HistoryDay[]): HistorySummary {
  let incoming = 0;
  let outgoing = 0;
  let count = 0;

  for (const day of days) {
    for (const item of day.items) {
      count += 1;
      if (item.signedAmount === null) continue;
      if (item.signedAmount >= 0) incoming += item.signedAmount;
      else outgoing -= item.signedAmount;
    }
  }

  return { incoming, outgoing, net: incoming - outgoing, count };
}

export function hasActiveFilters(filters: HistoryFilters): boolean {
  return filters.account.kind !== "all" || filters.direction !== "all" || filters.nature !== "all";
}
