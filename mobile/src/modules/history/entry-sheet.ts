import type { AppStackParamList, EntryFormParams } from "../../../App";
import type { AccountFilter } from "./history-filters";

export type EntryType = "expense" | "income";

type EditEntryParams = AppStackParamList["EditExpense"];

/** What the sheet over the history shows: nothing, a new entry, or an existing one. */
export type EntrySheetState =
  | { mode: "closed" }
  | { mode: "create"; type: EntryType; params: EntryFormParams }
  | { mode: "edit"; type: EntryType; entry: EditEntryParams };

export const CLOSED_SHEET: EntrySheetState = { mode: "closed" };

/**
 * A new entry starts where the user is looking: on the day they tapped, paid with
 * the account the history is filtered by ("Sem conta" means no account at all).
 */
export function createEntryState(date: string, account: AccountFilter, type: EntryType = "expense"): EntrySheetState {
  const accountId = account.kind === "account" ? account.id : account.kind === "none" ? null : undefined;
  return { mode: "create", type, params: { date, accountId } };
}

/** The fields of a history or invoice entry that the edit form needs. */
type EditableEntry = {
  id: string;
  amount: string;
  type?: string | null;
  date?: string | null;
  note?: string | null;
  isExtra?: boolean | null;
  countsInBudget?: boolean | null;
  installmentCount?: number | null;
  subcategory?: { id?: string | null } | null;
  account?: { id?: string | null } | null;
};

export function editEntryState(entry: EditableEntry, dayDate: string): EntrySheetState {
  return {
    mode: "edit",
    type: entry.type === "income" ? "income" : "expense",
    entry: {
      id: entry.id,
      amount: entry.amount,
      date: entry.date ?? dayDate,
      note: entry.note ?? undefined,
      isExtra: entry.isExtra ?? undefined,
      subcategoryId: entry.subcategory?.id ?? undefined,
      accountId: entry.account?.id ?? undefined,
      countsInBudget: entry.countsInBudget ?? undefined,
      installmentCount: entry.installmentCount ?? undefined,
    },
  };
}
