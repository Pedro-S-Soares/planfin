import { StyleSheet, View } from "react-native";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney, toNumber } from "../../lib/money";
import { palette, space } from "../../theme";
import { AppText } from "./AppText";
import { BalanceCard, BalanceStat, BalanceStatDivider, BalanceStatRow } from "./BalanceCard";
import { MoneyText } from "./MoneyText";

interface DailyStatsProps {
  spent: string;
  dailyLimit: string;
  extraBudget: string;
  extraSpent: string;
}

/** Today's stats of the daily budget: spent today, the daily goal and the period's extra. */
export function DailyStats({ spent, dailyLimit, extraBudget, extraSpent }: DailyStatsProps) {
  const { currency } = useCurrency();
  const extraBudgetNum = toNumber(extraBudget);
  const extraSpentNum = toNumber(extraSpent);
  const hasExtra = extraBudgetNum > 0;
  const isExtraOver = extraSpentNum > extraBudgetNum;
  const extraProgress = hasExtra ? Math.min(1, Math.max(0, extraSpentNum / extraBudgetNum)) : 0;

  return (
    <>
      <BalanceStatRow>
        <BalanceStat label="Gasto hoje" value={spent} />
        <BalanceStatDivider />
        <BalanceStat label="Meta diária" value={dailyLimit} />
      </BalanceStatRow>

      {hasExtra ? (
        <View style={styles.extraBlock}>
          <View style={styles.extraHeader}>
            <AppText variant="body" tone="muted">Extra do período</AppText>
            <AppText variant="label" isTabular style={styles.extraValue} numberOfLines={1}>
              {formatMoney(extraSpentNum, currency.symbol)} de {formatMoney(extraBudgetNum, currency.symbol)}
            </AppText>
          </View>
          <View style={styles.extraTrack}>
            <View
              style={[
                styles.extraFill,
                { width: `${extraProgress * 100}%` },
                isExtraOver && styles.extraFillOver,
              ]}
            />
          </View>
        </View>
      ) : null}
    </>
  );
}

/** "Disponível hoje" as a secondary figure, inside another card. */
export function DailyAvailable({ available }: { available: string }) {
  return (
    <View style={styles.inline}>
      <AppText variant="label" tone="muted">Disponível hoje</AppText>
      <MoneyText amount={available} variant="amount" tone={toNumber(available) < 0 ? "danger" : "ink"} />
    </View>
  );
}

interface DailyBalanceCardProps extends DailyStatsProps {
  available: string;
}

/** Hero card of the daily budget, used when there is no invoice plan. */
export function DailyBalanceCard({ available, ...stats }: DailyBalanceCardProps) {
  return (
    <BalanceCard title="Disponível hoje" amount={available}>
      <DailyStats {...stats} />
    </BalanceCard>
  );
}

const styles = StyleSheet.create({
  inline: {
    marginBottom: space.md,
  },
  extraBlock: {
    marginTop: space.md,
  },
  extraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: space.sm,
    marginBottom: 6,
  },
  extraValue: {
    flexShrink: 1,
  },
  extraTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accentSoft,
    overflow: "hidden",
  },
  extraFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: palette.accent,
  },
  extraFillOver: {
    backgroundColor: palette.danger,
  },
});
