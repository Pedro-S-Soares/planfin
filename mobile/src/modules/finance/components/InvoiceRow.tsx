import { TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { formatMoney, formatShortDate, isInvoiceStatus } from "../format";
import { invoiceMonthLabel, type InvoiceCard } from "../invoice-label";
import { StatusPill } from "./StatusPill";
import { palette } from "../../../theme";
import { Text } from "../../../components/ui/Text";

type InvoiceRowProps = {
  month: string;
  total: string | null | undefined;
  dueDate: string | null | undefined;
  status: string | null | undefined;
  onPress: () => void;
  /** The card's closing and due days, to name the invoice by its due month. */
  card?: InvoiceCard;
};

export function InvoiceRow({ month, total, dueDate, status, onPress, card }: InvoiceRowProps) {
  const { currency } = useCurrency();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: palette.rule, gap: 10 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: palette.ink }}>{invoiceMonthLabel(month, card)}</Text>
        <Text style={{ fontSize: 12, color: palette.muted }}>Vence {formatShortDate(dueDate)}</Text>
      </View>
      {isInvoiceStatus(status) ? <StatusPill status={status} /> : null}
      <Text style={{ fontSize: 15, fontWeight: "700", color: palette.ink, minWidth: 96, textAlign: "right" }}>
        {formatMoney(total, currency.symbol)}
      </Text>
    </TouchableOpacity>
  );
}
