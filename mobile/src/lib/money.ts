/**
 * How a value's sign is shown:
 * - "auto": "-" only on negatives (balances, which can go below zero).
 * - "flow": money moving in or out, like a bank statement — "+" marks income,
 *   expenses (the rule) carry no sign.
 * - "always": "+" and "-" (differences and plan arithmetic).
 */
export type MoneySign = "auto" | "flow" | "always";

type FormatMoneyOptions = {
  sign?: MoneySign;
  /** 2 by default; 0 rounds to whole units (chart labels, KPIs). */
  decimals?: 0 | 2;
};

export function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

const EPSILON = 0.004;

/** The only currency formatter of the app: "R$ 1.234,56", with thousands separator. */
export function formatMoney(
  value: number | string | null | undefined,
  symbol: string,
  { sign = "auto", decimals = 2 }: FormatMoneyOptions = {},
): string {
  const n = toNumber(value);
  const abs = Math.abs(n).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const isNegative = n < -EPSILON;
  const isPositive = n > EPSILON;
  const prefix =
    isNegative && sign !== "flow" ? "-" : isPositive && sign !== "auto" ? "+" : "";
  return `${prefix}${symbol} ${abs}`;
}
