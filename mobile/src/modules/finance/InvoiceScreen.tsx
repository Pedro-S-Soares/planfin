import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { ExpenseRow } from "../../components/ui/ExpenseRow";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { useInvoiceQuery } from "../../graphql/__generated__/hooks";
import { formatWeekdayDate, toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { AdjustInvoiceTotal } from "./components/AdjustInvoiceTotal";
import { StatusPill } from "./components/StatusPill";
import { groupInvoiceByDay } from "./invoice-days";
import { EntrySheet } from "../history/components/EntrySheet";
import { CLOSED_SHEET, createEntryState, editEntryState, type EntrySheetState } from "../history/entry-sheet";
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
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);

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
  const days = groupInvoiceByDay(entries, invoice.startDate ?? params.month);
  const openCreate = (date: string) => setSheet(createEntryState(date, { kind: "account", id: params.cardId }));
  const canPay = toNumber(invoice.remaining) > 0;
  const isEarly = invoice.status === "open" || invoice.status === "upcoming";

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
            {isEarly ? (
              <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 8, lineHeight: 17 }}>
                A fatura ainda está aberta. Pague o que já tem nela; compras feitas depois continuam entrando e
                ficam como saldo a pagar.
              </Text>
            ) : null}
            <Btn
              label={isEarly ? "Pagar antecipado" : "Pagar fatura"}
              onPress={() =>
                navigation.navigate("PayInvoice", { cardId: params.cardId, month: params.month, remaining: invoice.remaining ?? "0" })
              }
            />
          </View>
        ) : null}
      </Card>

      <Card padding={16}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>
            LANÇAMENTOS ({entries.length})
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => openCreate(toISODate(new Date()))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>+ Lançar</Text>
          </TouchableOpacity>
        </View>
        {entries.length === 0 ? (
          <Text style={{ color: Colors.textTer, textAlign: "center", paddingVertical: 12 }}>Nenhum lançamento nesta fatura.</Text>
        ) : (
          days.map((day) => (
            <View key={day.date}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  paddingBottom: 2,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>{formatWeekdayDate(day.date)}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  {day.entries.length > 1 ? (
                    <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.textSec }}>
                      {formatMoney(day.total, currency.symbol)}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Lançar neste dia"
                    onPress={() => openCreate(day.date)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.primaryText }}>+ Lançar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {day.entries.map((item) => (
                <ExpenseRow
                  key={item.id ?? ""}
                  item={{ ...item, id: item.id ?? "", amount: item.amount ?? "0" }}
                  onPress={() =>
                    setSheet(editEntryState({ ...item, id: item.id ?? "", amount: item.amount ?? "0" }, day.date))
                  }
                />
              ))}
            </View>
          ))
        )}
      </Card>
      <EntrySheet
        state={sheet}
        onClose={() => setSheet(CLOSED_SHEET)}
        onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
      />
    </ScrollView>
  );
}
