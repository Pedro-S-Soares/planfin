import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { useSalaryProjectionQuery } from "../../../graphql/__generated__/hooks";
import { toISODate } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatMonth, formatShortDate, toNumber } from "../format";
import type { AppStackParamList } from "../../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

const SEGMENT_COLORS = { invoice: "#E5392B", cardBills: "#F59E0B", accountBills: "#6B6987", left: "#0EAD70" };

/** How much of the next salary is already taken by the card and the bills. */
export function NextSalaryCard() {
  const navigation = useNavigation<Navigation>();
  const { currency } = useCurrency();
  const { data, refetch } = useSalaryProjectionQuery({
    variables: { today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const p = data?.salaryProjection;
  if (!p) return null;

  const invoices = p.invoices?.filter((i) => i !== null) ?? [];
  const salary = toNumber(p.salary);
  const invoiceTotal = invoices.reduce((acc, i) => acc + toNumber(i.amount), 0);
  const cardBills = invoices.reduce((acc, i) => acc + toNumber(i.pendingBills), 0);
  const accountBills = toNumber(p.accountBills);
  const left = toNumber(p.left);
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const pct = (v: number) => `${Math.max(0, Math.min(100, salary > 0 ? (v / salary) * 100 : 0))}%` as const;

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>
          PRÓXIMO SALÁRIO · {formatShortDate(p.salaryDate)}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>{money(salary)}</Text>
      </View>

      <View style={{ flexDirection: "row", height: 10, borderRadius: Radius.full, overflow: "hidden", backgroundColor: Colors.bg, marginTop: 10 }}>
        <View style={{ width: pct(invoiceTotal), backgroundColor: SEGMENT_COLORS.invoice }} />
        <View style={{ width: pct(cardBills), backgroundColor: SEGMENT_COLORS.cardBills }} />
        <View style={{ width: pct(accountBills), backgroundColor: SEGMENT_COLORS.accountBills }} />
      </View>

      <View style={{ marginTop: 10, gap: 4 }}>
        {invoices.map((i) => (
          <TouchableOpacity
            key={`${i.cardId}-${i.month}`}
            onPress={() => i.cardId && i.month && navigation.navigate("Invoice", { cardId: i.cardId, month: i.month })}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 13, color: Colors.textSec }}>
              <Text style={{ color: SEGMENT_COLORS.invoice }}>● </Text>
              Fatura {i.cardName} {formatMonth(i.month)}
              {i.status === "open" ? " (ainda aberta)" : ""}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>{money(i.amount)}</Text>
          </TouchableOpacity>
        ))}
        {cardBills > 0 ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: Colors.textSec }}>
              <Text style={{ color: SEGMENT_COLORS.cardBills }}>● </Text>Fixas que ainda vão para a fatura
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>{money(cardBills)}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13, color: Colors.textSec }}>
            <Text style={{ color: SEGMENT_COLORS.accountBills }}>● </Text>Fixas na conta até {formatShortDate(p.cycleEndDate)}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>{money(accountBills)}</Text>
        </View>
      </View>

      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border }}>
        <Text style={{ fontSize: 12, color: Colors.textSec }}>
          {left < 0
            ? "O próximo salário já não cobre o que está comprometido."
            : "Se não comprar mais nada no cartão, sobra do próximo salário:"}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "800", color: left < 0 ? Colors.danger : SEGMENT_COLORS.left, marginTop: 2 }}>
          {money(left)}
        </Text>
      </View>
    </Card>
  );
}
