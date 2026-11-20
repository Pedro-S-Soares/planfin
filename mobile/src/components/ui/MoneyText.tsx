import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney, toNumber, type MoneySign } from "../../lib/money";
import type { PaletteColor } from "../../theme";
import { AppText, type AppTextProps } from "./AppText";

interface MoneyTextProps extends Omit<AppTextProps, "children" | "isTabular"> {
  amount: number | string | null | undefined;
  /** How the sign shows (see lib/money): "flow" for entries, "auto" for balances, "always" for differences. */
  sign?: MoneySign;
  /**
   * Color from the value instead of `tone`: an entry in is green (an expense stays ink),
   * a negative balance or difference is red, a positive difference green.
   */
  isColoredBySign?: boolean;
}

function signTone(value: number, sign: MoneySign): PaletteColor | undefined {
  if (sign === "flow") return value > 0 ? "income" : undefined;
  if (sign === "always") return value < 0 ? "danger" : "income";
  return value < 0 ? "danger" : undefined;
}

/** An amount in the user's currency, in tabular digits so a column of them lines up. */
export function MoneyText({
  amount,
  sign = "auto",
  isColoredBySign = false,
  variant = "label",
  tone,
  ...rest
}: MoneyTextProps) {
  const { currency } = useCurrency();
  const value = toNumber(amount);
  const color = (isColoredBySign ? signTone(value, sign) : undefined) ?? tone;

  return (
    <AppText variant={variant} tone={color} isTabular numberOfLines={1} {...rest}>
      {formatMoney(value, currency.symbol, { sign })}
    </AppText>
  );
}
