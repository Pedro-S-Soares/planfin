import { formatDateBR } from "../../lib/date";

export type AccountKind = "checking" | "credit_card" | "allowance" | "reserve";
export type InvoiceStatus = "upcoming" | "open" | "closed" | "partial" | "paid" | "overdue" | "empty";

export const ACCOUNT_KIND_LABEL: Record<AccountKind, string> = {
  checking: "Conta corrente",
  credit_card: "Cartão de crédito",
  allowance: "Mesada",
  reserve: "Reserva",
};

export const ACCOUNT_KIND_ICON: Record<AccountKind, string> = {
  checking: "🏦",
  credit_card: "💳",
  allowance: "👛",
  reserve: "🛟",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  upcoming: "Futura",
  open: "Aberta",
  empty: "Sem compras",
  closed: "Fechada",
  partial: "Paga em parte",
  paid: "Paga",
  overdue: "Vencida",
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function isAccountKind(value: string | null | undefined): value is AccountKind {
  return value === "checking" || value === "credit_card" || value === "allowance" || value === "reserve";
}

export function isInvoiceStatus(value: string | null | undefined): value is InvoiceStatus {
  return (
    value === "upcoming" ||
    value === "empty" ||
    value === "open" ||
    value === "closed" ||
    value === "partial" ||
    value === "paid" ||
    value === "overdue"
  );
}

export function toNumber(value: string | null | undefined): number {
  const n = parseFloat(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

/** "R$ 1.234,56" — `signed` adds "+" to positive values; negatives always get "-". */
export function formatMoney(value: number | string | null | undefined, symbol: string, signed = false): string {
  const n = typeof value === "number" ? value : toNumber(value);
  const abs = Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = n < -0.004 ? "-" : signed && n > 0.004 ? "+" : "";
  return `${sign}${symbol} ${abs}`;
}

/** "2026-10" → "Out/2026" */
export function formatMonth(month: string | null | undefined): string {
  if (!month) return "—";
  const [y, m] = month.split("-");
  const idx = Number(m) - 1;
  return `${MONTHS[idx] ?? m}/${y}`;
}

/** "2026-10-15" → "15/10" */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return formatDateBR(iso).slice(0, 5);
}

/** Cents of a CurrencyInput display value, as API string; negative when `negative`. */
export function signedApiAmount(apiAmount: string, negative: boolean): string {
  return negative && toNumber(apiAmount) > 0 ? `-${apiAmount}` : apiAmount;
}

/** "2026-10" + 1 → "2026-11" */
export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/** Month ("YYYY-MM") of a Date. */
export function monthOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
