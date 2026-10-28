import { useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { useCyclePlanQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { CycleBlockCard } from "./components/CycleBlockCard";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

/** The plan around the main card's invoice: the current one and the next one. */
export function MonthPlanScreen() {
  usePageTitle("Planfin - Planejamento");
  const navigation = useNavigation<Navigation>();
  const today = toISODate(new Date());
  const { data, loading, error, refetch } = useCyclePlanQuery({ variables: { today }, fetchPolicy: "cache-and-network" });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (loading && !data) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />;
  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <InlineError onRetry={() => refetch()} />
      </View>
    );
  }

  const plan = data?.cyclePlan;
  if (!plan?.current || !plan.next) {
    return (
      <View style={{ padding: 16 }}>
        <Card padding={18}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>Cadastre o salário e o cartão</Text>
          <Text style={{ fontSize: 13, color: Colors.textSec, marginVertical: 8 }}>
            O planejamento acompanha a fatura do cartão principal e o salário que paga cada fatura.
          </Text>
          <Btn label="Salário e ciclo" size="sm" onPress={() => navigation.navigate("SalarySettings")} />
        </Card>
      </View>
    );
  }

  const cardName = plan.cardName ?? "Cartão";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <CycleBlockCard
        block={plan.current}
        cardName={cardName}
        today={today}
        footer={
          <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate("BillForm", { direction: "expense", once: true })}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>+ Gasto avulso</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("BillForm", { direction: "income", once: true })}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>+ Entrada prevista</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <CycleBlockCard block={plan.next} cardName={cardName} today={today} />
      <Text style={{ fontSize: 12, color: Colors.textTer, lineHeight: 17 }}>
        O ciclo segue o fechamento do {cardName}: o que você compra até a véspera do fechamento é pago com o salário do mês
        em que a fatura vence. Troque o cartão do ciclo em Salário e ciclo.
      </Text>
    </ScrollView>
  );
}
