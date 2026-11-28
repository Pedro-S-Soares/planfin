import { formatMoney, toNumber } from "../../lib/money";
import { formatDateBR, parseISODate, toISODate } from "../../lib/date";

/** The parts of the allowance math the API sends (`allowancePlan`). */
export interface AllowanceMath {
  invoiceStatus?: string | null;
  planResult?: string | null;
  planUntil?: string | null;
  goalDays?: number | null;
  goalDaily?: string | null;
  goalAmount?: string | null;
  free?: string | null;
  cash?: string | null;
  cashUntil?: string | null;
  capped?: boolean | null;
}

export interface BreakdownRow {
  label: string;
  /** Signed value, as it enters the sum. */
  amount: number;
}

export interface AllowanceBreakdown {
  /** The lines above the rule; empty when the result alone tells it (closed invoice). */
  rows: BreakdownRow[];
  /** The line below the rule: what is left for the allowance, or what is missing. */
  total: BreakdownRow;
  /** True when a daily goal line is shown (the place to adjust it). */
  hasGoal: boolean;
  /** "Limitado ao dinheiro livre na conta até dd/mm: R$ Y", only when the cash caps the allowance. */
  capNote: string | null;
}

function nextDayISO(iso: string): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

function shortDate(iso: string | null | undefined): string {
  return iso ? formatDateBR(iso).slice(0, 5) : "—";
}

/**
 * The allowance as an extract, with the backend's own numbers:
 *
 *   open invoice:   Livre no plano até dd/mm   (plan result)
 *                 − Meta até lá (N dias × R$ d)
 *                 = Sobra para a mesada | Falta
 *   closed invoice: Sobra (or Falta) até o salário de dd/mm = the plan result
 *
 * Null without an invoice plan (no card or salary yet).
 */
export function allowanceBreakdown(plan: AllowanceMath, symbol: string): AllowanceBreakdown | null {
  if (plan.invoiceStatus !== "open" && plan.invoiceStatus !== "closed") return null;

  const free = toNumber(plan.free);
  const capNote = plan.capped
    ? `Limitado ao dinheiro livre na conta até ${shortDate(plan.cashUntil)}: ${formatMoney(plan.cash, symbol)}`
    : null;

  if (plan.invoiceStatus === "closed") {
    const salary = shortDate(plan.planUntil ? nextDayISO(plan.planUntil) : null);
    return {
      rows: [],
      total: { label: `${free < 0 ? "Falta" : "Sobra"} até o salário de ${salary}`, amount: free },
      hasGoal: false,
      capNote,
    };
  }

  const days = plan.goalDays ?? 0;
  const goal = toNumber(plan.goalAmount);
  const rows: BreakdownRow[] = [{ label: `Livre no plano até ${shortDate(plan.planUntil)}`, amount: toNumber(plan.planResult) }];
  const hasGoal = days > 0 && goal > 0;
  if (hasGoal) {
    rows.push({
      label: `Meta até lá (${days} ${days === 1 ? "dia" : "dias"} × ${formatMoney(plan.goalDaily, symbol)})`,
      amount: -goal,
    });
  }

  return {
    rows,
    total: { label: free < 0 ? "Falta" : "Sobra para a mesada", amount: free },
    hasGoal,
    capNote,
  };
}
