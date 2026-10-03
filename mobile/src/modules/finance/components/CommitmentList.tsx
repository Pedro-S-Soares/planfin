import { Text, TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors } from "../../../theme/tokens";
import { formatMoney, formatShortDate } from "../format";
import type { FinancePanelQuery } from "../../../graphql/__generated__/hooks";

type Commitment = NonNullable<NonNullable<NonNullable<FinancePanelQuery["financePanel"]>["commitments"]>[number]>;

type CommitmentListProps = {
  items: Commitment[];
  onOpenInvoice: (cardId: string, month: string) => void;
  onOpenBills: (month: string) => void;
};

const STATUS_NOTE: Record<string, string> = {
  overdue: "vencida",
  open: "ainda aberta",
  partial: "paga em parte",
};

export function CommitmentList({ items, onOpenInvoice, onOpenBills }: CommitmentListProps) {
  const { currency } = useCurrency();

  if (items.length === 0) {
    return <Text style={{ fontSize: 13, color: Colors.textSec, paddingVertical: 6 }}>Nada a pagar até o próximo dinheiro entrar.</Text>;
  }

  return (
    <View>
      {items.map((c) => {
        const note = c.status ? STATUS_NOTE[c.status] : undefined;
        const handlePress = () =>
          c.kind === "invoice" && c.cardId ? onOpenInvoice(c.cardId, c.month ?? "") : onOpenBills(c.month ?? "");
        return (
          <TouchableOpacity
            key={`${c.kind}-${c.cardId ?? c.billId}-${c.month}`}
            onPress={handlePress}
            activeOpacity={0.75}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.border }}
          >
            <Text style={{ fontSize: 16, marginRight: 10 }}>{c.kind === "invoice" ? "💳" : "🧾"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text }} numberOfLines={1}>{c.label}</Text>
              <Text style={{ fontSize: 12, color: c.status === "overdue" ? Colors.danger : Colors.textSec }}>
                Vence {formatShortDate(c.dueDate)}
                {note ? ` · ${note}` : ""}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text }}>{formatMoney(c.amount, currency.symbol)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
