import { Text, View } from "react-native";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney } from "../../finance/format";
import type { HistoryTransfer } from "../../../graphql/expenses";

interface TransferRowProps {
  transfer: HistoryTransfer;
  /** Seen from one account: positive arrived, negative left. Null: between two of the group's accounts. */
  signedAmount: number | null;
  currencySymbol: string;
}

const KIND_LABEL: Record<string, string> = {
  card_payment: "Pagamento de fatura",
  allowance: "Mesada",
  reserve: "Reserva",
  other: "Transferência",
};

export function TransferRow({ transfer, signedAmount, currencySymbol }: TransferRowProps) {
  const title = transfer.note || KIND_LABEL[transfer.kind ?? "other"] || "Transferência";
  const route = `${transfer.fromAccount?.name ?? "?"} → ${transfer.toAccount?.name ?? "?"}`;
  const isIncoming = signedAmount !== null && signedAmount > 0;
  const amountColor = signedAmount === null ? Colors.textSec : isIncoming ? Colors.success : Colors.text;

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bg,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Text style={{ fontSize: 16, color: Colors.textSec }}>⇄</Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ flexShrink: 1, fontSize: 14, fontWeight: "600", color: Colors.text }} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ backgroundColor: Colors.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec }}>Transferência</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 1 }} numberOfLines={1}>
          {route}
        </Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: "700", color: amountColor, flexShrink: 0 }}>
        {signedAmount === null
          ? formatMoney(transfer.amount, currencySymbol)
          : formatMoney(signedAmount, currencySymbol, true)}
      </Text>
    </View>
  );
}
