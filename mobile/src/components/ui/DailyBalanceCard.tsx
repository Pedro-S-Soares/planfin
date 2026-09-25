import { StyleSheet, Text, View } from "react-native";
import { useCurrency } from "../../context/CurrencyContext";
import {
  BalanceCard,
  BalanceStat,
  BalanceStatDivider,
  BalanceStatRow,
  formatAmount,
} from "./BalanceCard";

interface DailyBalanceCardProps {
  available: string;
  spent: string;
  dailyLimit: string;
  extraBudget: string;
  extraSpent: string;
}

export function DailyBalanceCard({
  available,
  spent,
  dailyLimit,
  extraBudget,
  extraSpent,
}: DailyBalanceCardProps) {
  const { currency } = useCurrency();
  const extraBudgetNum = parseFloat(extraBudget || "0");
  const extraSpentNum = parseFloat(extraSpent || "0");
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

      {hasExtra ? (
        <View style={styles.extraBlock}>
          <View style={styles.extraHeader}>
            <Text style={styles.extraLabel}>Extra do período</Text>
            <Text style={styles.extraValue} numberOfLines={1}>
              {currency.symbol} {formatAmount(extraSpentNum)} usado de {currency.symbol}{" "}
              {formatAmount(extraBudgetNum)}
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
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  extraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  extraLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  extraValue: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  extraTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  extraFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  extraFillOver: {
    backgroundColor: "#FFD2CE",
  },
});
