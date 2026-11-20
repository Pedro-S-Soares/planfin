import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Block } from "../../../components/ui/Block";
import { MoneyText } from "../../../components/ui/MoneyText";
import { palette, space } from "../../../theme";
import type { FinancialAccount } from "../../finance/use-financial-accounts";
import type { HistorySummary } from "../history-filters";

interface HistorySummaryCardProps {
  summary: HistorySummary;
  /** The account being filtered, to compare its balance in the app with the bank. */
  account: FinancialAccount | null;
}

/** One line of the summary, like a statement's totals: label at the left, amount at the right. */
function SummaryLine({ label, isTotal = false, children }: { label: string; isTotal?: boolean; children: ReactNode }) {
  return (
    <View style={[styles.line, isTotal ? styles.totalLine : null]}>
      <AppText variant={isTotal ? "label" : "body"} tone={isTotal ? "ink" : "muted"}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

/** Totals of what the filters leave visible: in, out, result. */
export function HistorySummaryCard({ summary, account }: HistorySummaryCardProps) {
  const hasBalance = account !== null && account.kind !== "credit_card" && account.balance != null;

  return (
    <Block style={styles.block}>
      <SummaryLine label="Entradas">
        <MoneyText amount={summary.incoming} variant="label" tone="income" />
      </SummaryLine>
      <SummaryLine label="Saídas">
        <MoneyText amount={summary.outgoing} variant="label" />
      </SummaryLine>
      <SummaryLine label="Resultado" isTotal>
        <MoneyText amount={summary.net} sign="always" variant="value" isColoredBySign />
      </SummaryLine>
      <AppText variant="caption" style={styles.note}>
        {summary.count} {summary.count === 1 ? "lançamento" : "lançamentos"} no período com estes filtros
      </AppText>
      {hasBalance ? (
        <View style={styles.balance}>
          <AppText variant="body" tone="muted" style={styles.balanceLabel} numberOfLines={1}>
            Saldo de {account.name} no app hoje
          </AppText>
          <MoneyText amount={account.balance} variant="label" />
        </View>
      ) : null}
    </Block>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: space.xl,
  },
  line: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    paddingVertical: 2,
  },
  totalLine: {
    marginTop: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: palette.rule,
  },
  note: {
    marginTop: space.sm,
  },
  balance: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: palette.rule,
  },
  balanceLabel: {
    flexShrink: 1,
  },
});
