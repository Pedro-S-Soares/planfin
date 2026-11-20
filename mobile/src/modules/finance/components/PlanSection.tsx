import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { palette } from "../../../theme";
import { Text } from "../../../components/ui/Text";
import { Icon } from "../../../components/ui/Icon";

export type PlanLine = { label?: string | null; date?: string | null; amount?: string | null };

type PlanSectionProps = {
  sign: "+" | "−";
  title: string;
  items: PlanLine[];
  /** Shown instead of a sum when there are no items. */
  emptyText?: string;
  /** Single-item line: no "(1) ▾" and no expansion. */
  hideCount?: boolean;
};

/** One line of the plan; expands to show what makes it up. */
export function PlanSection({ sign, title, items, emptyText, hideCount }: PlanSectionProps) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const total = items.reduce((acc, i) => acc + toNumber(i.amount), 0);
  const color = sign === "+" && total >= 0 ? palette.income : total < 0 && sign === "+" ? palette.danger : palette.ink;

  return (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.rule }}>
      <TouchableOpacity
        disabled={items.length === 0 || hideCount}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ flex: 1, fontSize: 14, color: palette.ink }}>
          {title}
          {items.length > 0 && !hideCount ? (
            <Text style={{ color: palette.muted }}>{open ? "" : `  (${items.length})`}</Text>
          ) : null}
        </Text>
        {items.length > 0 && !hideCount ? <Icon name={open ? "chevron-up" : "chevron-down"} size={18} /> : null}
        <Text style={{ fontSize: 14, fontWeight: "700", color }}>
          {items.length === 0 && emptyText
            ? emptyText
            : formatMoney(sign === "+" ? total : -total, currency.symbol, { sign: "always" }).replace(/^-/, "− ")
                .replace(/^\+/, "+ ")}
        </Text>
      </TouchableOpacity>
      {open
        ? items.map((i, idx) => (
            <View key={`${i.label}-${i.date}-${idx}`} style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 4, paddingLeft: 10 }}>
              <Text style={{ fontSize: 12, color: palette.muted }}>
                {i.label} · {formatShortDate(i.date)}
              </Text>
              <Text style={{ fontSize: 12, color: palette.muted }}>{formatMoney(i.amount, currency.symbol)}</Text>
            </View>
          ))
        : null}
    </View>
  );
}
