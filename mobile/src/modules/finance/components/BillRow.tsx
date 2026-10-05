import { Text, TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import type { BillOccurrencesQuery } from "../../../graphql/__generated__/hooks";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatMonth, formatShortDate } from "../format";

export type BillOccurrence = NonNullable<NonNullable<BillOccurrencesQuery["billOccurrences"]>[number]>;

type BillRowProps = {
  occurrence: BillOccurrence;
  onEdit: () => void;
  onPay: () => void;
  onUndo: () => void;
};

/** One fixed bill: its day, whether this month is settled and what comes next. */
export function BillRow({ occurrence: o, onEdit, onPay, onUndo }: BillRowProps) {
  const { currency } = useCurrency();
  const isCard = o.bill?.account?.kind === "credit_card";
  const isPaid = o.status === "paid";
  const isSkipped = o.status === "skipped";
  const isOverdue = o.status === "overdue";
  const isIncome = o.bill?.direction === "income";
  const recurrence = o.bill?.onceMonth ? `só em ${formatMonth(o.bill.onceMonth)}` : `todo dia ${o.bill?.dueDay}`;

  const next = o.bill?.onceMonth ? "" : ` · próxima ${formatShortDate(o.nextDueDate)}`;
  const statusText = isIncome
    ? isPaid
      ? `✓ Recebida em ${formatShortDate(o.paidOn)}${next}`
      : `A receber em ${formatShortDate(o.dueDate)}`
    : isPaid
    ? `${isCard ? "✓ Na fatura" : "✓ Paga"} em ${formatShortDate(o.paidOn)}${next}`
    : isSkipped
      ? `Fora da fatura deste mês · próxima ${formatShortDate(o.nextDueDate)}`
      : isOverdue
        ? `${isCard ? "Não lançada" : "Não paga"} · venceu ${formatShortDate(o.dueDate)}`
        : isCard
          ? `Entra na fatura em ${formatShortDate(o.dueDate)}`
          : `A pagar até ${formatShortDate(o.dueDate)}`;

  const statusColor = isPaid ? Colors.successText : isOverdue ? Colors.danger : Colors.textSec;
  const actionLabel = isPaid ? (isCard ? "Tirar" : "Desfazer") : isIncome ? "Receber" : isCard ? "Lançar" : "Pagar";

  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{o.bill?.name}</Text>
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 1 }}>
            {isIncome ? "⬇️" : isCard ? "💳" : "🏦"} {o.bill?.account?.name} · {recurrence}
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: "700", color: isIncome ? Colors.successText : Colors.text }}>
          {isIncome ? "+" : ""}
          {formatMoney(o.amount, currency.symbol)}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 10 }}>
        <Text style={{ flex: 1, fontSize: 12, fontWeight: "600", color: statusColor }}>{statusText}</Text>
        <TouchableOpacity
          onPress={isPaid ? onUndo : onPay}
          activeOpacity={0.75}
          style={{
            borderRadius: Radius.full,
            paddingHorizontal: 14,
            paddingVertical: 6,
            backgroundColor: isPaid ? Colors.bg : Colors.primary,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: isPaid ? Colors.textSec : "#fff" }}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
