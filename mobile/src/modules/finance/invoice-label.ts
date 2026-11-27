/**
 * Invoices are keyed by their closing month ("2026-11": purchases until the
 * November closing). The bank names an invoice by the month it is due in: a
 * card that closes on the 25th and is due on the 5th calls that invoice
 * "dezembro". These helpers only change what is shown; keys, URLs and data keep
 * the closing month.
 */

const SHORT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type InvoiceCard = { closingDay?: number | null; dueDay?: number | null } | null | undefined;

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/** "2026-11" of a card closing on the 25th and due on the 5th → "2026-12". */
export function invoiceDueMonth(month: string, closingDay: number, dueDay: number): string {
  return dueDay > closingDay ? month : addMonths(month, 1);
}

/** The month an invoice is called by ("Dez/2026"); without the card's days, its key month. */
export function invoiceMonthLabel(month: string | null | undefined, card?: InvoiceCard): string {
  if (!month) return "—";
  const named = card?.closingDay && card.dueDay ? invoiceDueMonth(month, card.closingDay, card.dueDay) : month;
  const [y, m] = named.split("-");
  return `${SHORT_MONTHS[Number(m) - 1] ?? m}/${y}`;
}

