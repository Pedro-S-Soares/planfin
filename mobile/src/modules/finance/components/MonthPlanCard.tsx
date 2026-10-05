import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { useMonthPlanQuery } from "../../../graphql/__generated__/hooks";
import { toISODate } from "../../../lib/date";
import { Colors } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";
import type { AppStackParamList } from "../../../../App";

/** Home summary of the month plan: this month's closing and next month's variable money. */
export function MonthPlanCard() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { currency } = useCurrency();
  const { data, refetch } = useMonthPlanQuery({ variables: { today: toISODate(new Date()) }, fetchPolicy: "cache-and-network" });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const plan = data?.monthPlan;
  if (!plan?.current || !plan.next) return null;
  const leftover = toNumber(plan.current.leftover);
  const remaining = toNumber(plan.next.remaining);
  const money = (v: number) => formatMoney(v, currency.symbol);

  return (
    <TouchableOpacity onPress={() => navigation.navigate("MonthPlan")} activeOpacity={0.85}>
      <Card padding={16} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.6 }}>
              ESTE MÊS · ATÉ {formatShortDate(plan.current.endDate)}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: leftover >= 0 ? Colors.successText : Colors.danger, marginTop: 2 }}>
              {money(leftover)}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSec }}>{leftover >= 1 ? "sobra para mesada" : "sobra do mês"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.6 }}>
              PRÓXIMO MÊS · {formatShortDate(plan.next.startDate)}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: remaining >= 0 ? Colors.text : Colors.danger, marginTop: 2 }}>
              {money(remaining)}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSec }}>para gastos variáveis</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText, marginTop: 10 }}>Ver planejamento e meta diária ›</Text>
      </Card>
    </TouchableOpacity>
  );
}
