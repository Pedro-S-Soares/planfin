import { Text, TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors } from "../../../theme/tokens";
import { formatMoney, formatMonth, formatShortDate, isInvoiceStatus } from "../format";
import { StatusPill } from "./StatusPill";

type InvoiceRowProps = {
  month: string;
  total: string | null | undefined;
  dueDate: string | null | undefined;
  status: string | null | undefined;
  onPress: () => void;
};

export function InvoiceRow({ month, total, dueDate, status, onPress }: InvoiceRowProps) {
  const { currency } = useCurrency();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{formatMonth(month)}</Text>
        <Text style={{ fontSize: 12, color: Colors.textSec }}>Vence {formatShortDate(dueDate)}</Text>
      </View>
      {isInvoiceStatus(status) ? <StatusPill status={status} /> : null}
      <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text, minWidth: 96, textAlign: "right" }}>
        {formatMoney(total, currency.symbol)}
      </Text>
    </TouchableOpacity>
  );
}
