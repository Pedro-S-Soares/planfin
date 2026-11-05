import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../../components/ui/Card";
import { Btn } from "../../../components/ui/Btn";
import { useCurrency } from "../../../context/CurrencyContext";
import { usePeriod } from "../../../context/PeriodContext";
import { useCyclePlanQuery } from "../../../graphql/__generated__/hooks";
import { toISODate } from "../../../lib/date";
import { Colors } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";
import type { AppStackParamList } from "../../../../App";

/** Home summary of the plan: the current invoice and the next one's free money. */
export function MonthPlanCard() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { currency } = useCurrency();
  const { period } = usePeriod();
  const { data, refetch } = useCyclePlanQuery({ variables: { today: toISODate(new Date()) }, fetchPolicy: "cache-and-network" });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const plan = data?.cyclePlan;
  if (!plan?.current || !plan.next) return null;
  const current = toNumber(plan.current.result);
  const next = toNumber(plan.next.result);
  const isOpen = plan.current.status === "open";
  const money = (v: number) => formatMoney(v, currency.symbol);
  // The invoice closed and no daily goal covers the open one yet: time to start the new cycle.
  const shouldStartCycle = !isOpen && (period?.endDate ?? "") < (plan.next.lastPurchaseDate ?? "");
  const openPlan = () => navigation.navigate("MonthPlan");

  if (shouldStartCycle) {
    return (
      <Card padding={16} style={{ marginBottom: 12, borderWidth: 1.5, borderColor: Colors.primary }}>
        <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.primaryText, letterSpacing: 0.6 }}>
          NOVO CICLO · {formatShortDate(plan.next.purchaseStart)} A {formatShortDate(plan.next.lastPurchaseDate)}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text, marginTop: 4 }}>
          A fatura do {plan.cardName ?? "cartão"} fechou. Planeje o próximo ciclo.
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4, marginBottom: 12, lineHeight: 18 }}>
          {money(next)} livres para gastos variáveis, contando o salário de {formatShortDate(plan.next.salaryDate)}. Revise as
          entradas e os gastos avulsos e defina a meta diária.
        </Text>
        <Btn label="Começar o ciclo" size="sm" onPress={openPlan} />
        <TouchableOpacity onPress={openPlan} style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 12, color: Colors.textSec }}>
            Fatura fechada (vence {formatShortDate(plan.current.dueDate)}):{" "}
            {current >= 0 ? `sobra ${money(current)}` : `faltam ${money(-current)}`} até o salário
          </Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <TouchableOpacity onPress={openPlan} activeOpacity={0.85}>
      <Card padding={16} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.6 }}>
              {isOpen
                ? `FATURA ATUAL · ATÉ ${formatShortDate(plan.current.lastPurchaseDate)}`
                : `FATURA FECHADA · ${formatShortDate(plan.current.dueDate)}`}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: current >= 0 ? Colors.successText : Colors.danger, marginTop: 2 }}>
              {money(current)}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSec }}>{isOpen ? "ainda dá para gastar" : "sobra até o salário"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.6 }}>
              PRÓXIMA · DESDE {formatShortDate(plan.next.purchaseStart)}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: next >= 0 ? Colors.text : Colors.danger, marginTop: 2 }}>
              {money(next)}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSec }}>para gastos variáveis</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText, marginTop: 10 }}>Ver planejamento e meta diária ›</Text>
      </Card>
    </TouchableOpacity>
  );
}
