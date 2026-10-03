import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { useBillOccurrencesQuery, useUnpayBillMutation } from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors, Radius } from "../../theme/tokens";
import { addMonths, formatMoney, formatMonth, formatShortDate, monthOf, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

const STATUS: Record<string, { label: string; color: string }> = {
  paid: { label: "Paga", color: Colors.successText },
  pending: { label: "A pagar", color: Colors.textSec },
  overdue: { label: "Vencida", color: Colors.danger },
  skipped: { label: "Pulada", color: Colors.textTer },
};

export function BillsScreen() {
  usePageTitle("Planfin - Despesas fixas");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "Bills">>();
  const { currency } = useCurrency();
  const [month, setMonth] = useState(params?.month || monthOf(new Date()));

  const { data, loading, error, refetch } = useBillOccurrencesQuery({
    variables: { month, today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });
  const [unpayBill] = useUnpayBillMutation({ refetchQueries: ["BillOccurrences", "FinancePanel", "FinancialAccounts"] });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const items = data?.billOccurrences?.filter((o) => o !== null) ?? [];
  const active = items.filter((o) => o.status !== "skipped");
  const total = active.reduce((acc, o) => acc + toNumber(o.amount), 0);
  const paid = active.filter((o) => o.status === "paid").reduce((acc, o) => acc + toNumber(o.amount), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setMonth((m) => addMonths(m, -1))} hitSlop={12}>
          <Text style={{ fontSize: 22, color: Colors.primary }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "800", color: Colors.text }}>{formatMonth(month)}</Text>
        <TouchableOpacity onPress={() => setMonth((m) => addMonths(m, 1))} hitSlop={12}>
          <Text style={{ fontSize: 22, color: Colors.primary }}>›</Text>
        </TouchableOpacity>
      </View>

      <Card padding={16} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec }}>TOTAL DO MÊS</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.text }}>{formatMoney(total, currency.symbol)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec }}>FALTA PAGAR</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.text }}>{formatMoney(total - paid, currency.symbol)}</Text>
          </View>
        </View>
      </Card>

      <Card padding={16} style={{ marginBottom: 12 }}>
        {loading && !data ? (
          <ActivityIndicator color={Colors.primary} />
        ) : error ? (
          <InlineError onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <Text style={{ color: Colors.textTer, textAlign: "center", paddingVertical: 12 }}>
            Nenhuma despesa fixa ainda. Cadastre aluguel, contas e assinaturas.
          </Text>
        ) : (
          items.map((o) => {
            const status = STATUS[o.status ?? "pending"] ?? STATUS.pending;
            const isCard = o.bill?.account?.kind === "credit_card";
            const handlePress = () => {
              if (!o.bill?.id) return;
              const billId = o.bill.id;
              if (o.status === "paid") {
                confirm(
                  isCard
                    ? {
                        title: "Tirar da fatura",
                        message: `A cobrança de ${formatMonth(month)} sai da fatura e não volta sozinha neste mês.`,
                        confirmLabel: "Tirar",
                        destructive: true,
                      }
                    : {
                        title: "Desfazer pagamento",
                        message: "O lançamento criado no pagamento será apagado.",
                        confirmLabel: "Desfazer",
                        destructive: true,
                      },
                  () => unpayBill({ variables: { billId, month } }),
                );
              } else {
                navigation.navigate("PayBill", { billId, month, amount: o.amount ?? "0", name: o.bill.name ?? "", isCard });
              }
            };
            const actionLabel =
              o.status === "paid"
                ? isCard
                  ? "✓ Na fatura"
                  : "✓ Paga"
                : o.status === "skipped"
                  ? "Pulada · lançar"
                  : isCard
                    ? `Entra em ${formatShortDate(o.dueDate)}`
                    : o.status === "overdue"
                      ? "Pagar · vencida"
                      : "Pagar";
            return (
              <View key={o.bill?.id ?? ""} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 }}>
                <TouchableOpacity onPress={() => o.bill?.id && navigation.navigate("BillForm", { billId: o.bill.id })} style={{ flex: 1 }} activeOpacity={0.7}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text }}>{o.bill?.name}</Text>
                  <Text style={{ fontSize: 12, color: Colors.textSec }}>
                    {isCard ? "💳" : "🏦"} {o.bill?.account?.name} · vence {formatShortDate(o.dueDate)}
                  </Text>
                </TouchableOpacity>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text }}>{formatMoney(o.amount, currency.symbol)}</Text>
                  <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={0.75}
                    style={{ marginTop: 4, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: o.status === "paid" ? Colors.successLight : Colors.primaryLight }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: o.status === "paid" ? status.color : Colors.primaryText }}>
                      {actionLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 12, lineHeight: 17 }}>
        As despesas no cartão entram sozinhas na fatura no dia do vencimento. As da conta você marca como pagas.
      </Text>
      <Btn label="+ Nova despesa fixa" onPress={() => navigation.navigate("BillForm", {})} />
    </ScrollView>
  );
}
