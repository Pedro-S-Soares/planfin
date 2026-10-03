import { Text, View } from "react-native";
import { Colors, Radius } from "../../../theme/tokens";
import { INVOICE_STATUS_LABEL, type InvoiceStatus } from "../format";

const TONE: Record<InvoiceStatus, { bg: string; fg: string }> = {
  open: { bg: Colors.primaryLight, fg: Colors.primaryText },
  closed: { bg: "#FFF4E5", fg: "#B25E00" },
  partial: { bg: "#FFF4E5", fg: "#B25E00" },
  paid: { bg: Colors.successLight, fg: Colors.successText },
  overdue: { bg: Colors.dangerLight, fg: Colors.danger },
};

export function StatusPill({ status }: { status: InvoiceStatus }) {
  const tone = TONE[status];
  return (
    <View style={{ backgroundColor: tone.bg, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: tone.fg }}>{INVOICE_STATUS_LABEL[status]}</Text>
    </View>
  );
}
