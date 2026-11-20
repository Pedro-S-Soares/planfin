type DatedEntry = { date?: string | null; amount?: string | null; type?: string | null };

export type InvoiceDay<T> = { date: string; total: number; entries: T[] };

/**
 * Groups the invoice entries by purchase date, newest first, like a bank statement.
 * The day total is what the day adds to the invoice: purchases minus refunds.
 * Entries without a date (never expected) fall back to `fallbackDate`.
 */
export function groupInvoiceByDay<T extends DatedEntry>(entries: T[], fallbackDate: string): InvoiceDay<T>[] {
  const byDate = new Map<string, T[]>();
  for (const entry of entries) {
    const date = entry.date ?? fallbackDate;
    byDate.set(date, [...(byDate.get(date) ?? []), entry]);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, dayEntries]) => ({
      date,
      entries: dayEntries,
      total: dayEntries.reduce((sum, e) => {
        const amount = parseFloat(e.amount ?? "0") || 0;
        return sum + (e.type === "income" ? -amount : amount);
      }, 0),
    }));
}
