import { useMemo } from "react";
import { useCurrency } from "../../context/CurrencyContext";

export type MoneyFormat = {
  /** "R$ 1.480" */
  money: (value: number) => string;
  /** Axis labels: "R$ 1,5 mil" */
  compact: (value: number) => string;
};

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** "+12%" / "−8%" (typographic minus) */
export function signedPercent(value: number): string {
  const rounded = Math.round(value * 100);
  return `${rounded >= 0 ? "+" : "−"}${Math.abs(rounded)}%`;
}

export function useMoney(): MoneyFormat {
  const { currency } = useCurrency();
  return useMemo(() => {
    const money = (value: number) => `${currency.symbol} ${Math.round(value).toLocaleString("pt-BR")}`;
    const compact = (value: number) => {
      if (value === 0) return `${currency.symbol} 0`;
      if (Math.abs(value) >= 1000) {
        return `${currency.symbol} ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
      }
      return money(value);
    };
    return { money, compact };
  }, [currency.symbol]);
}
