import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { toNumber } from "../../lib/money";
import { palette, space } from "../../theme";
import { AppText } from "./AppText";
import { Block } from "./Block";
import { MoneyText } from "./MoneyText";

interface BalanceCardProps {
  title: string;
  amount: string;
  children?: ReactNode;
}

/** The one big number of the Home: label + amount in tabular digits, red when negative. */
export function BalanceCard({ title, amount, children }: BalanceCardProps) {
  return (
    <Block>
      <AppText variant="label" tone="muted">
        {title}
      </AppText>
      <MoneyText
        amount={amount}
        variant="hero"
        tone={toNumber(amount) < 0 ? "danger" : "ink"}
        adjustsFontSizeToFit
        accessibilityRole="header"
        style={styles.amount}
      />
      {children}
    </Block>
  );
}

interface BalanceStatProps {
  label: string;
  value: string;
  isFlexible?: boolean;
}

export function BalanceStat({ label, value, isFlexible = false }: BalanceStatProps) {
  return (
    <View style={isFlexible ? styles.statFlex : undefined}>
      <AppText variant="caption">{label}</AppText>
      <MoneyText amount={value} variant="label" />
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
  amount: {
    marginTop: 2,
    marginBottom: space.md,
  },
  statRow: {
    flexDirection: "row",
    gap: space.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: palette.rule,
    paddingTop: space.md,
  },
  statFlex: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: palette.rule,
  },
});
