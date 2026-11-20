import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney, toNumber } from "../../lib/money";
import { Ledger, TABULAR_NUMS } from "../../theme/tokens";

interface BalanceCardProps {
  title: string;
  amount: string;
  children?: ReactNode;
}

/** The one big number of the Home: label + amount in tabular digits, red when negative. */
export function BalanceCard({ title, amount, children }: BalanceCardProps) {
  const { currency } = useCurrency();
  const isNegative = toNumber(amount) < 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text
        style={[styles.amount, isNegative && styles.amountNegative]}
        numberOfLines={1}
        adjustsFontSizeToFit
        accessibilityRole="header"
      >
        {formatMoney(amount, currency.symbol)}
      </Text>
      {children}
    </View>
  );
}

interface BalanceStatProps {
  label: string;
  value: string;
  isFlexible?: boolean;
}

export function BalanceStat({ label, value, isFlexible = false }: BalanceStatProps) {
  const { currency } = useCurrency();

  return (
    <View style={isFlexible ? styles.statFlex : undefined}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {formatMoney(value, currency.symbol)}
      </Text>
    </View>
  );
}

export function BalanceStatRow({ children }: { children: ReactNode }) {
  return <View style={styles.statRow}>{children}</View>;
}

export function BalanceStatDivider() {
  return <View style={styles.statDivider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Ledger.sheet,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Ledger.rule,
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Ledger.muted,
  },
  amount: {
    fontSize: 44,
    fontWeight: "800",
    color: Ledger.ink,
    letterSpacing: -1,
    lineHeight: 52,
    marginTop: 2,
    marginBottom: 12,
    ...TABULAR_NUMS,
  },
  amountNegative: {
    color: Ledger.danger,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Ledger.rule,
    paddingTop: 12,
  },
  statFlex: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Ledger.muted,
    fontWeight: "500",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Ledger.ink,
    ...TABULAR_NUMS,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Ledger.rule,
  },
});
