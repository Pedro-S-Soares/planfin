import { ActivePeriodDocument } from "../graphql/__generated__/hooks";

/**
 * Every query that lists or totals money: entries, bills, invoices, balances, plans.
 *
 * A mutation that creates, edits or deletes an entry or a bill refetches all of them,
 * so each screen still mounted (the tabs stay mounted, a sheet keeps the list under it)
 * shows the change at once. Refetch by name only reaches the queries in use; the lists
 * not mounted fetch again on open (cache-and-network or network-only).
 * Picking a subset per form is what let the fixas list keep an old value.
 */
export const MONEY_QUERIES = [
  "ExpenseHistory",
  "ExpenseHistoryWithAuthors",
  "FinancialAccounts",
  "AccountMovements",
  "Invoices",
  "Invoice",
  "Installments",
  "InstallmentsDue",
  "RecurringBills",
  "BillOccurrences",
  "FinancePanel",
  "MonthPlan",
  "CyclePlan",
  "AllowancePlan",
  "ReserveStatus",
  "DashboardData",
];

/** MONEY_QUERIES plus the active period (daily balance), for entries that can count in the budget. */
export const ENTRY_REFETCH_QUERIES = [{ query: ActivePeriodDocument }, ...MONEY_QUERIES];
