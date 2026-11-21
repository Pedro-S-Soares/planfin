/** Optional presets when opening the new expense/income form. */
export type EntryFormParams =
  | {
      /** null = no account (the history filtered by "Sem conta"). */
      accountId?: string | null;
      /** Start with "counts in budget" off (old purchases, salary, bills). */
      outsideBudget?: boolean;
      date?: string;
      categoryId?: string;
      subcategoryId?: string;
    }
  | undefined;

/** An existing entry, as the edit form receives it. */
export type EntryEditParams = {
  id: string;
  amount: string;
  date: string;
  note?: string;
  isExtra?: boolean;
  subcategoryId?: string;
  categoryId?: string;
  accountId?: string;
  countsInBudget?: boolean;
  installmentCount?: number;
};
