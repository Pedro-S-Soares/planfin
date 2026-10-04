import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";

export type PlanLine = { label?: string | null; date?: string | null; amount?: string | null };

type PlanSectionProps = {
  sign: "+" | "−";
  title: string;
  items: PlanLine[];
  /** Shown instead of a sum when there are no items. */
  emptyText?: string;
};

/** One line of the plan; expands to show what makes it up. */
export function PlanSection({ sign, title, items, emptyText }: PlanSectionProps) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const total = items.reduce((acc, i) => acc + toNumber(i.amount), 0);
  const color = sign === "+" && total >= 0 ? Colors.successText : total < 0 && sign === "+" ? Colors.danger : Colors.text;

  return (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <TouchableOpacity
        disabled={items.length === 0}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ flex: 1, fontSize: 14, color: Colors.text }}>
          {title}
          {items.length > 0 ? <Text style={{ color: Colors.textTer }}>{open ? "  ▴" : `  (${items.length}) ▾`}</Text> : null}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "700", color }}>
          {items.length === 0 && emptyText
            ? emptyText
            : formatMoney(sign === "+" ? total : -total, currency.symbol, true).replace(/^-/, "− ")
                .replace(/^\+/, "+ ")}
        </Text>
      </TouchableOpacity>
      {open
        ? items.map((i, idx) => (
            <View key={`${i.label}-${i.date}-${idx}`} style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 4, paddingLeft: 10 }}>
              <Text style={{ fontSize: 12, color: Colors.textSec }}>
                {i.label} · {formatShortDate(i.date)}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSec }}>{formatMoney(i.amount, currency.symbol)}</Text>
            </View>
          ))
        : null}
    </View>
  );
}
