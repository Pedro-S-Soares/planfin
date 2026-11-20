import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney, toNumber } from "../../lib/money";
import { Ledger, TABULAR_NUMS } from "../../theme/tokens";
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
            <Text style={styles.extraLabel}>Extra do período</Text>
            <Text style={styles.extraValue} numberOfLines={1}>
              {formatMoney(extraSpentNum, currency.symbol)} de {formatMoney(extraBudgetNum, currency.symbol)}
            </Text>
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
    marginTop: 12,
  },
  extraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 6,
  },
  extraLabel: {
    fontSize: 14,
    color: Ledger.muted,
  },
  extraValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "700",
    color: Ledger.ink,
    ...TABULAR_NUMS,
  },
  extraTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Ledger.accentSoft,
    overflow: "hidden",
  },
  extraFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Ledger.accent,
  },
  extraFillOver: {
    backgroundColor: Ledger.danger,
  },
});
