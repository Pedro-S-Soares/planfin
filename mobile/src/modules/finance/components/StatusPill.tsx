import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { font, palette, radius, space } from "../../../theme";
import { INVOICE_STATUS_LABEL, type InvoiceStatus } from "../format";

const TONE: Record<InvoiceStatus, { bg: string; fg: string }> = {
  upcoming: { bg: palette.paper, fg: palette.muted },
  empty: { bg: palette.paper, fg: palette.muted },
  open: { bg: palette.accentSoft, fg: palette.accent },
  closed: { bg: palette.warningSoft, fg: palette.warning },
  partial: { bg: palette.warningSoft, fg: palette.warning },
  paid: { bg: palette.incomeSoft, fg: palette.income },
  overdue: { bg: palette.dangerSoft, fg: palette.danger },
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
