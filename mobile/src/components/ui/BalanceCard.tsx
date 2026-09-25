import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius } from "../../theme/tokens";
import { useCurrency } from "../../context/CurrencyContext";

export function formatAmount(value: string | number): string {
  const num = typeof value === "number" ? value : parseFloat(value || "0");
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface BalanceCardProps {
  title: string;
  amount: string;
  children?: ReactNode;
}

/** Gradient card shell: title + big amount, turning red when the amount is negative. */
export function BalanceCard({ title, amount, children }: BalanceCardProps) {
  const { currency } = useCurrency();
  const amountNum = parseFloat(amount || "0");
  const isPositive = amountNum >= 0;

  const gradColors = isPositive
    ? ([Colors.gradStart, Colors.gradEnd] as const)
    : ([Colors.dangerGradStart, Colors.dangerGradEnd] as const);

  return (
    <LinearGradient
      colors={gradColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { shadowColor: isPositive ? Colors.fabShadow : "rgba(229,57,43,0.35)" }]}
    >
      <Text style={styles.title}>{title}</Text>

      <View style={styles.amountRow}>
        <Text style={styles.currency}>
          {!isPositive ? "- " : ""}{currency.symbol}
        </Text>
        <Text style={styles.amount}>{formatAmount(Math.abs(amountNum))}</Text>
      </View>

      {children}
    </LinearGradient>
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
        {currency.symbol} {formatAmount(value)}
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
    borderRadius: Radius.xl,
    padding: 22,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
    overflow: "hidden",
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 2,
    marginBottom: 14,
  },
  currency: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    paddingTop: 6,
    marginRight: 2,
  },
  amount: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  statFlex: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
