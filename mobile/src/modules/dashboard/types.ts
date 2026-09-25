/** One expense, normalised for aggregation. Amounts are plain numbers (analytics only). */
export type Fact = {
  id: string;
  amount: number;
  /** ISO "YYYY-MM-DD" */
  date: string;
  isExtra: boolean;
  /** Category the colour/legend follows — OTHER_CATEGORY_ID when folded or uncategorised */
  categoryId: string;
  subcategoryName: string;
  authorId: string;
  authorName: string;
};

export type CategoryInfo = {
  id: string;
  name: string;
  color: string;
};

/** Inclusive date window, ISO strings */
export type DateWindow = { from: string; to: string };

export type RangeKey = "period" | "3m" | "6m" | "12m";

export type PeriodBudget = {
  startDate: string;
  endDate: string;
  totalBudget: number;
  dailyLimit: number;
};
