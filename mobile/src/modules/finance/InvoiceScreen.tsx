import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { ExpenseRow } from "../../components/ui/ExpenseRow";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { useInvoiceQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { AdjustInvoiceTotal } from "./components/AdjustInvoiceTotal";
import { StatusPill } from "./components/StatusPill";
import { formatMoney, formatMonth, formatShortDate, isInvoiceStatus, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function InvoiceScreen() {
  usePageTitle("Planfin - Fatura");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "Invoice">>();
  const { currency } = useCurrency();
  const { data, loading, error, refetch } = useInvoiceQuery({
    variables: { cardId: params.cardId, month: params.month, today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />;
  if (error || !data?.invoice) {
    return (
      <View style={{ padding: 16 }}>
        <InlineError onRetry={() => refetch()} />
      </View>
    );
  }

  const invoice = data.invoice;
  const entries = invoice.entries?.filter((e) => e !== null) ?? [];
  const canPay = invoice.status !== "open" && invoice.status !== "upcoming" && toNumber(invoice.remaining) > 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Card padding={18} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>Fatura de {formatMonth(invoice.month)}</Text>
          {isInvoiceStatus(invoice.status) ? <StatusPill status={invoice.status} /> : null}
        </View>
        <Text style={{ fontSize: 30, fontWeight: "800", color: Colors.text, marginTop: 6 }}>
          {formatMoney(invoice.total, currency.symbol)}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 4 }}>
          Compras de {formatShortDate(invoice.startDate)} até a véspera de {formatShortDate(invoice.closingDate)} · vence{" "}
          {formatShortDate(invoice.dueDate)}
        </Text>
        {toNumber(invoice.paid) > 0 ? (
          <Text style={{ fontSize: 13, color: Colors.successText, marginTop: 8 }}>
            Pago {formatMoney(invoice.paid, currency.symbol)} · falta {formatMoney(invoice.remaining, currency.symbol)}
          </Text>
        ) : null}
        {invoice.status !== "paid" ? (
          <AdjustInvoiceTotal cardId={params.cardId} month={params.month} currentTotal={invoice.total} />
        ) : null}
        {canPay ? (
          <View style={{ marginTop: 14 }}>
            <Btn
              label="Pagar fatura"
              onPress={() =>
                navigation.navigate("PayInvoice", { cardId: params.cardId, month: params.month, remaining: invoice.remaining ?? "0" })
              }
            />
          </View>
        ) : null}
      </Card>

      <Card padding={16}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7, marginBottom: 4 }}>
          LANÇAMENTOS ({entries.length})
        </Text>
        {entries.length === 0 ? (
          <Text style={{ color: Colors.textTer, textAlign: "center", paddingVertical: 12 }}>Nenhum lançamento nesta fatura.</Text>
        ) : (
          entries.map((item) => (
            <ExpenseRow
              key={item.id ?? ""}
              item={{ ...item, id: item.id ?? "", amount: item.amount ?? "0" }}
              onPress={() =>
                navigation.navigate(item.type === "income" ? "EditIncome" : "EditExpense", {
                  id: item.id ?? "",
                  amount: item.amount ?? "0",
                  date: item.date ?? params.month,
                  note: item.note ?? undefined,
                  isExtra: item.isExtra ?? undefined,
                  subcategoryId: item.subcategory?.id ?? undefined,
                  categoryId: undefined,
                  accountId: item.account?.id ?? undefined,
                  countsInBudget: item.countsInBudget ?? undefined,
                  installmentCount: item.installmentCount ?? undefined,
                })
              }
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
}
