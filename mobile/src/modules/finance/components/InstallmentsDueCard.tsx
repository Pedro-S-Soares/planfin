import { ActivityIndicator, View } from "react-native";
import { Block } from "../../../components/ui/Block";
import { InlineError } from "../../../components/ui/InlineError";
import { useCurrency } from "../../../context/CurrencyContext";
import { subcategoryLabel } from "../../../lib/category-label";
import { formatMoney, formatShortDate } from "../format";
import type { InstallmentInvoice } from "../use-installments-due";
import { palette } from "../../../theme";
import { Text } from "../../../components/ui/Text";

type InstallmentsDueCardProps = {
  invoices: InstallmentInvoice[];
  cardNames: Map<string, string>;
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
};

/** Installments landing on the card invoices due in the month, grouped by invoice. */
export function InstallmentsDueCard({ invoices, cardNames, loading, hasError, onRetry }: InstallmentsDueCardProps) {
  const { currency } = useCurrency();
  const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <Block padding={16} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: "800", color: palette.ink, marginBottom: 4 }}>Parcelados</Text>
      {loading ? (
        <ActivityIndicator color={palette.accent} />
      ) : hasError ? (
        <InlineError onRetry={onRetry} />
      ) : invoices.length === 0 ? (
        <Text style={{ color: palette.muted, paddingVertical: 8 }}>Nenhuma parcela nas faturas deste mês.</Text>
      ) : (
        invoices.map((invoice) => (
          <View key={`${invoice.cardId}-${invoice.month}`} style={{ marginTop: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>
                {cardNames.get(invoice.cardId) ?? "Cartão"} · vence {formatShortDate(invoice.dueDate)}
                {invoice.isPaid ? " · fatura paga" : ""}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>
                {formatMoney(invoice.total, currency.symbol)}
              </Text>
            </View>
            {invoice.entries.map((entry) => (
              <View
                key={entry.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 9,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.rule,
                }}
              >
                <Text style={{ flex: 1, fontSize: 14, color: palette.ink }} numberOfLines={1}>
                  {entry.note || subcategoryLabel(entry.subcategory)}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>
                  {entry.installmentNumber}/{entry.installmentCount}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: palette.ink, minWidth: 90, textAlign: "right" }}>
                  {formatMoney(entry.amount, currency.symbol)}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}
      {invoices.length > 0 ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: palette.muted }}>Total das parcelas</Text>
          <Text style={{ fontSize: 15, fontWeight: "800", color: palette.ink }}>{formatMoney(total, currency.symbol)}</Text>
        </View>
      ) : null}
    </Block>
  );
}
