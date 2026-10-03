import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../../../components/ui/Card";
import { InlineError } from "../../../components/ui/InlineError";
import { useCurrency } from "../../../context/CurrencyContext";
import { useInvoicesQuery } from "../../../graphql/__generated__/hooks";
import { toISODate } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatMonth, formatShortDate, isInvoiceStatus, toNumber } from "../format";
import type { FinancialAccount } from "../use-financial-accounts";
import { StatusPill } from "./StatusPill";

type CardSummaryProps = {
  card: FinancialAccount;
  onOpen: () => void;
  onOpenInvoice: (month: string) => void;
  onPay: (month: string, remaining: string) => void;
};

export function CardSummary({ card, onOpen, onOpenInvoice, onPay }: CardSummaryProps) {
  const { currency } = useCurrency();
  const { data, loading, error, refetch } = useInvoicesQuery({
    variables: { cardId: card.id, today: toISODate(new Date()), past: 1 },
    fetchPolicy: "cache-and-network",
  });

  const invoices = data?.invoices?.filter((i) => i !== null) ?? [];
  const current = invoices.find((i) => i.status === "open") ?? null;
  const toPay = invoices.find((i) => i.status !== "open" && i.status !== "paid" && toNumber(i.remaining) > 0) ?? null;

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <TouchableOpacity onPress={onOpen} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ fontSize: 22 }}>💳</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{card.name}</Text>
          <Text style={{ fontSize: 12, color: Colors.textSec }}>
            Fecha dia {card.closingDay} · vence dia {card.dueDay}
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>Faturas ›</Text>
      </TouchableOpacity>

      {loading && !data ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 14 }} />
      ) : error ? (
        <View style={{ marginTop: 12 }}>
          <InlineError onRetry={() => refetch()} />
        </View>
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          {toPay ? (
            <View style={{ backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.textSec }}>
                  A PAGAR · {formatMonth(toPay.month)}
                </Text>
                {isInvoiceStatus(toPay.status) ? <StatusPill status={toPay.status} /> : null}
              </View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, marginTop: 4 }}>
                {formatMoney(toPay.remaining, currency.symbol)}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <Text style={{ fontSize: 12, color: Colors.textSec }}>Vence {formatShortDate(toPay.dueDate)}</Text>
                <TouchableOpacity
                  onPress={() => onPay(toPay.month ?? "", toPay.remaining ?? "0")}
                  activeOpacity={0.8}
                  style={{ backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Pagar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {current ? (
            <TouchableOpacity onPress={() => onOpenInvoice(current.month ?? "")} activeOpacity={0.8}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.textSec }}>
                FATURA ABERTA · {formatMonth(current.month)}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.text, marginTop: 2 }}>
                {formatMoney(current.total, currency.symbol)}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
                Fecha {formatShortDate(current.closingDate)} · vence {formatShortDate(current.dueDate)} · paga com o
                próximo salário
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </Card>
  );
}
