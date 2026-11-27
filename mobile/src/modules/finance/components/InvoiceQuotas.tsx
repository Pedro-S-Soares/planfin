import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Block } from "../../../components/ui/Block";
import { MoneyText } from "../../../components/ui/MoneyText";
import { SectionHeader } from "../../../components/ui/DayHeader";
import { palette, radius, space } from "../../../theme";
import { toNumber } from "../format";
import { useCurrency } from "../../../context/CurrencyContext";
import { formatMoney } from "../../../lib/money";

type InvoiceQuota = {
  quotaId?: string | null;
  name?: string | null;
  planned?: string | null;
  spent?: string | null;
  remaining?: string | null;
  excess?: string | null;
};

/** The invoice's spending quotas: planned, spent and what is left, with a bar. */
export function InvoiceQuotas({ quotas }: { quotas: (InvoiceQuota | null)[] }) {
  const { currency } = useCurrency();
  const fmt = (n: number) => formatMoney(n, currency.symbol);
  const list = quotas.filter((q): q is InvoiceQuota => !!q?.quotaId);
  if (list.length === 0) return null;

  return (
    <View style={styles.root}>
      <SectionHeader title="Cotas desta fatura" />
      <Block style={styles.block}>
        {list.map((q, index) => {
          const planned = toNumber(q.planned);
          const spent = toNumber(q.spent);
          const excess = toNumber(q.excess);
          const ratio = planned > 0 ? Math.min(spent / planned, 1) : 0;
          return (
            <View key={q.quotaId} style={[styles.row, index > 0 ? styles.rowDivider : null]}>
              <View style={styles.line}>
                <AppText variant="baseStrong" numberOfLines={1} style={styles.name}>
                  {q.name}
                </AppText>
                <MoneyText amount={q.remaining} variant="label" tone={excess > 0 ? "danger" : "income"} />
              </View>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${ratio * 100}%` }, excess > 0 ? styles.fillOver : null]}
                />
              </View>
              <AppText variant="caption">
                {excess > 0
                  ? `Gasto ${fmt(spent)} de ${fmt(planned)} · passou ${fmt(excess)}, que saiu do limite diário`
                  : `Gasto ${fmt(spent)} de ${fmt(planned)} · resta ${fmt(toNumber(q.remaining))}`}
              </AppText>
            </View>
          );
        })}
      </Block>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: space.lg,
  },
  block: {
    gap: 0,
  },
  row: {
    paddingVertical: space.sm,
    gap: space.xs,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: palette.rule,
  },
  line: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
  },
  name: {
    flexShrink: 1,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: palette.paper,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: palette.accent,
  },
  fillOver: {
    backgroundColor: palette.danger,
  },
});
