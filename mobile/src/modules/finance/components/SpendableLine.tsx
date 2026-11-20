import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { MoneyText } from "../../../components/ui/MoneyText";
import { space } from "../../../theme";
import { formatShortDate, toNumber } from "../format";
import { useFinancePanel } from "../use-finance-panel";

/**
 * "Posso gastar" as a secondary line under the Home's hero number: the money left in the
 * account after what is due before the next salary. Hidden until accounts exist (the
 * finance panel below invites the user to register them).
 */
export function SpendableLine() {
  const { panel } = useFinancePanel();

  if (!panel?.hasAccounts || panel.free == null) return null;

  const free = toNumber(panel.free);
  const isShort = free < 0;
  const horizon = panel.salary?.configured
    ? `até o salário de ${formatShortDate(panel.salary.nextSalaryDate)}`
    : `até ${formatShortDate(panel.horizonDate)}`;

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <AppText variant="body" tone="muted" style={styles.label} numberOfLines={1}>
          Posso gastar {horizon}
        </AppText>
        <MoneyText amount={free} variant="label" tone={isShort ? "danger" : "income"} />
      </View>
      {isShort ? (
        <AppText variant="caption" tone="danger">
          Falta dinheiro para cobrir o que vence antes do próximo salário.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
  },
  label: {
    flexShrink: 1,
  },
});
