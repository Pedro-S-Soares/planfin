import { Text, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { Ledger, TABULAR_NUMS } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { useFinancePanel } from "../use-finance-panel";

/**
 * "Posso gastar" as a secondary line under the Home's hero number: the money left in the
 * account after what is due before the next salary. Hidden until accounts exist (the
 * finance panel below invites the user to register them).
 */
export function SpendableLine() {
  const { currency } = useCurrency();
  const { panel } = useFinancePanel();

  if (!panel?.hasAccounts || panel.free == null) return null;

  const free = toNumber(panel.free);
  const isShort = free < 0;
  const horizon = panel.salary?.configured
    ? `até o salário de ${formatShortDate(panel.salary.nextSalaryDate)}`
    : `até ${formatShortDate(panel.horizonDate)}`;

  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <Text style={{ flexShrink: 1, fontSize: 14, color: Ledger.muted }} numberOfLines={1}>
          Posso gastar {horizon}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "700", color: isShort ? Ledger.danger : Ledger.income, ...TABULAR_NUMS }}>
          {formatMoney(free, currency.symbol)}
        </Text>
      </View>
      {isShort ? (
        <Text style={{ fontSize: 12, color: Ledger.danger, marginTop: 2 }}>
          Falta dinheiro para cobrir o que vence antes do próximo salário.
        </Text>
      ) : null}
    </View>
  );
}
