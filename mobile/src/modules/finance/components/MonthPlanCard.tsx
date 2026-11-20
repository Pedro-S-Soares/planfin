import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "../../../components/ui/AppText";
import { Block } from "../../../components/ui/Block";
import { Button } from "../../../components/ui/Button";
import { MoneyText } from "../../../components/ui/MoneyText";
import { useCurrency } from "../../../context/CurrencyContext";
import { usePeriod } from "../../../context/PeriodContext";
import { useCyclePlanQuery } from "../../../graphql/__generated__/hooks";
import { toISODate } from "../../../lib/date";
import { palette, space } from "../../../theme";
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
      <Block style={[styles.spaced, styles.highlight]}>
        <AppText variant="caption" tone="accent">
          Novo ciclo · {formatShortDate(plan.next.purchaseStart)} a {formatShortDate(plan.next.lastPurchaseDate)}
        </AppText>
        <AppText variant="baseStrong" style={styles.gapTop}>
          A fatura do {plan.cardName ?? "cartão"} fechou. Planeje o próximo ciclo.
        </AppText>
        <AppText variant="body" tone="muted" style={styles.paragraph}>
          {money(next)} livres para gastos variáveis, contando o salário de {formatShortDate(plan.next.salaryDate)}. Revise as
          entradas e os gastos avulsos e defina a meta diária.
        </AppText>
        <Button label="Começar o ciclo" onPress={openPlan} />
        <Pressable accessibilityRole="button" onPress={openPlan} style={styles.gapTop}>
          <AppText variant="caption">
            Fatura fechada (vence {formatShortDate(plan.current.dueDate)}):{" "}
            {current >= 0 ? `sobra ${money(current)}` : `faltam ${money(-current)}`} até o salário
          </AppText>
        </Pressable>
      </Block>
    );
  }

  return (
    <Pressable accessibilityRole="button" onPress={openPlan}>
      <Block style={styles.spaced}>
        <View style={styles.columns}>
          <View style={styles.column}>
            <AppText variant="caption">
              {isOpen
                ? `Fatura atual · até ${formatShortDate(plan.current.lastPurchaseDate)}`
                : `Fatura fechada · ${formatShortDate(plan.current.dueDate)}`}
            </AppText>
            <MoneyText amount={current} variant="value" tone={current >= 0 ? "income" : "danger"} />
            <AppText variant="caption">{isOpen ? "ainda dá para gastar" : "sobra até o salário"}</AppText>
          </View>
          <View style={styles.column}>
            <AppText variant="caption">Próxima · desde {formatShortDate(plan.next.purchaseStart)}</AppText>
            <MoneyText amount={next} variant="value" tone={next >= 0 ? "ink" : "danger"} />
            <AppText variant="caption">para gastos variáveis</AppText>
          </View>
        </View>
        <AppText variant="label" tone="accent" style={styles.link}>
          Ver planejamento e meta diária
        </AppText>
      </Block>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spaced: {
    marginBottom: space.lg,
  },
  highlight: {
    borderColor: palette.accent,
  },
  gapTop: {
    marginTop: space.sm,
  },
  paragraph: {
    marginTop: space.xs,
    marginBottom: space.md,
  },
  columns: {
    flexDirection: "row",
    gap: space.md,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  link: {
    marginTop: space.md,
  },
});
