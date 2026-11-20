import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney, toNumber } from "../../lib/money";
import { palette, space } from "../../theme";
import { AppText } from "./AppText";
import { BalanceCard, BalanceStat, BalanceStatDivider, BalanceStatRow } from "./BalanceCard";

interface DailyBalanceCardProps {
  available: string;
  spent: string;
  dailyLimit: string;
  extraBudget: string;
  extraSpent: string;
  /** Secondary lines under the stats (e.g. "Posso gastar"). */
  footer?: ReactNode;
}

export function DailyBalanceCard({
  available,
  spent,
  dailyLimit,
  extraBudget,
  extraSpent,
  footer,
}: DailyBalanceCardProps) {
  const { currency } = useCurrency();
  const extraBudgetNum = toNumber(extraBudget);
  const extraSpentNum = toNumber(extraSpent);
  const hasExtra = extraBudgetNum > 0;
  const isExtraOver = extraSpentNum > extraBudgetNum;
  const extraProgress = hasExtra ? Math.min(1, Math.max(0, extraSpentNum / extraBudgetNum)) : 0;

  return (
    <BalanceCard title="Disponível hoje" amount={available}>
      <BalanceStatRow>
        <BalanceStat label="Gasto hoje" value={spent} />
        <BalanceStatDivider />
        <BalanceStat label="Limite diário" value={dailyLimit} />
      </BalanceStatRow>

      {footer}

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
    </BalanceCard>
  );
}

const styles = StyleSheet.create({
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
