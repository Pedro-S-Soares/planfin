import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { font, radius, space } from "../../../theme";
import { Colors } from "../../../theme/tokens";
import { INVOICE_STATUS_LABEL, type InvoiceStatus } from "../format";

const TONE: Record<InvoiceStatus, { bg: string; fg: string }> = {
  upcoming: { bg: Colors.bg, fg: Colors.textSec },
  empty: { bg: Colors.bg, fg: Colors.textSec },
  open: { bg: Colors.primaryLight, fg: Colors.primaryText },
  closed: { bg: "#FFF4E5", fg: "#9A5200" },
  partial: { bg: "#FFF4E5", fg: "#9A5200" },
  paid: { bg: Colors.successLight, fg: Colors.successText },
  overdue: { bg: Colors.dangerLight, fg: "#B3271C" },
};

/** Invoice status (Aberta, Fechada, Paga…) as a small tinted label. */
export function StatusPill({ status }: { status: InvoiceStatus }) {
  const tone = TONE[status];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <AppText variant="caption" style={[styles.label, { color: tone.fg }]}>
        {INVOICE_STATUS_LABEL[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 2,
  },
  label: {
    ...font("semibold"),
  },
});
