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
import { Colors } from "../../theme/tokens";
import { BillRow } from "./components/BillRow";
import { addMonths, formatMoney, formatMonth, monthOf, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;


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
            const bill = o.bill;
            if (!bill?.id) return null;
            const billId = bill.id;
            const isCard = bill.account?.kind === "credit_card";
            return (
              <BillRow
                key={billId}
                occurrence={o}
                onEdit={() => navigation.navigate("BillForm", { billId })}
                onPay={() =>
                  navigation.navigate("PayBill", { billId, month, amount: o.amount ?? "0", name: bill.name ?? "", isCard })
                }
                onUndo={() =>
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
                  )
                }
              />
            );
          })
        )}
      </Card>

      <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 12, lineHeight: 17 }}>
        Toque no nome para editar ou excluir. As despesas no cartão entram sozinhas na fatura no dia; as da conta
        você marca como pagas.
      </Text>
      <Btn label="+ Nova despesa fixa" onPress={() => navigation.navigate("BillForm", {})} />
    </ScrollView>
  );
}
