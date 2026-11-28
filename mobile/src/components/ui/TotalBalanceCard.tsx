import { StyleSheet, View } from "react-native";
import { toNumber } from "../../lib/money";
import { space } from "../../theme";
import { AppText } from "./AppText";
import { BalanceCard, BalanceStat, BalanceStatDivider, BalanceStatRow } from "./BalanceCard";
import { MoneyText } from "./MoneyText";

interface TotalStatsProps {
  remainingTotal: string;
  extraRemaining: string;
}

/** What is left of the period, split into the daily part and the extra. */
export function TotalStats({ remainingTotal, extraRemaining }: TotalStatsProps) {
  const dailyRemaining = String(toNumber(remainingTotal) - toNumber(extraRemaining));

  return (
    <BalanceStatRow>
      <BalanceStat label="Diário restante" value={dailyRemaining} />
      <BalanceStatDivider />
      <BalanceStat label="Extra restante" value={extraRemaining} isFlexible />
    </BalanceStatRow>
  );
}

/** "Disponível no período" as a secondary figure, inside another card. */
export function TotalAvailable({ remainingTotal }: { remainingTotal: string }) {
  return (
    <View style={styles.inline}>
      <AppText variant="label" tone="muted">Disponível no período</AppText>
      <MoneyText amount={remainingTotal} variant="amount" tone={toNumber(remainingTotal) < 0 ? "danger" : "ink"} />
    </View>
  );
}

/** Hero card of the period budget, used when there is no invoice plan. */
export function TotalBalanceCard(props: TotalStatsProps) {
  return (
    <BalanceCard title="Disponível no período" amount={props.remainingTotal}>
      <TotalStats {...props} />
    </BalanceCard>
  );
}

const styles = StyleSheet.create({
  inline: {
    marginBottom: space.md,
  },
});
