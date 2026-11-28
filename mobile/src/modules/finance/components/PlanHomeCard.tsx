import { useCallback, type ReactNode } from "react";
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
import { parseISODate, toISODate } from "../../../lib/date";
import { palette, radius, space } from "../../../theme";
import { formatMoney, formatShortDate, toNumber } from "../format";
import type { AppStackParamList } from "../../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

interface PlanHomeCardProps {
  /** Today's figures of the daily budget (Disponível, gasto, meta), shown inside the card. */
  today: ReactNode;
  /** Daily goal of the active period, compared with what the plan allows per day. */
  dailyLimit: string | null | undefined;
  /** Rendered instead when there is no invoice plan (no salary or no card yet). */
  fallback: ReactNode;
}

/** What the plan allows per purchase day; null when there are no days or nothing is free. */
function perDay(result: number, days: number | null | undefined): number | null {
  return days && days > 0 && result > 0 ? result / days : null;
}

function nextDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = parseISODate(iso);
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

/**
 * The Home's one card: what the invoice plan leaves free (the main number), today's daily
 * budget inside it, and the next invoice below. While the invoice is open the main number
 * is what can still be spent until the closing; once it closed, the left over until the
 * salary after the one that pays it.
 */
export function PlanHomeCard({ today, dailyLimit, fallback }: PlanHomeCardProps) {
  const navigation = useNavigation<Navigation>();
  const { currency } = useCurrency();
  const { period } = usePeriod();
  const { data, refetch } = useCyclePlanQuery({ variables: { today: toISODate(new Date()) }, fetchPolicy: "cache-and-network" });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const plan = data?.cyclePlan;
  if (!plan?.current || !plan.next) return <>{fallback}</>;

  const money = (v: number) => formatMoney(v, currency.symbol);
  const openPlan = () => navigation.navigate("MonthPlan");
  const isOpen = plan.current.status === "open";
  const current = toNumber(plan.current.result);
  const next = toNumber(plan.next.result);
  const currentPerDay = isOpen ? perDay(current, plan.current.days) : null;
  const nextPerDay = perDay(next, plan.next.days);
  // The daily goal is spent on the invoice taking purchases: the current one while open, the next once closed.
  const planPerDay = isOpen ? currentPerDay : nextPerDay;
  const goal = toNumber(dailyLimit);
  const planResult = isOpen ? current : next;
  const isPlanShort = planResult <= 0;
  const isGoalOverPlan = goal > 0 && (isPlanShort || (planPerDay !== null && goal > planPerDay + 0.005));
  // The invoice closed and no daily goal covers the open one yet: time to start the new cycle.
  const shouldStartCycle = !isOpen && (period?.endDate ?? "") < (plan.next.lastPurchaseDate ?? "");

  const heroLabel = isOpen
    ? `Livre até o fechamento (${formatShortDate(plan.current.lastPurchaseDate)})`
    : `Sobra até o salário de ${formatShortDate(nextDay(plan.current.windowEnd))}`;

  return (
    <Block style={styles.spaced}>
      <AppText variant="label" tone="muted">
        {heroLabel}
      </AppText>
      <MoneyText
        amount={current}
        variant="hero"
        tone={current < 0 ? "danger" : "ink"}
        adjustsFontSizeToFit
        accessibilityRole="header"
        style={styles.hero}
      />
      {isOpen && current < 0 ? (
        <AppText variant="caption" tone="danger">
          O que já está na fatura e os compromissos até o salário passam do dinheiro previsto.
        </AppText>
      ) : currentPerDay !== null ? (
        <AppText variant="caption">
          ~{money(currentPerDay)}/dia · {plan.current.days} {plan.current.days === 1 ? "dia" : "dias"} de compras
        </AppText>
      ) : (
        <AppText variant="caption">
          Fatura do {plan.cardName ?? "cartão"} fechada, vence {formatShortDate(plan.current.dueDate)}
        </AppText>
      )}

      {shouldStartCycle ? (
        <View style={styles.newCycle}>
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
        </View>
      ) : null}

      <View style={styles.section}>
        <AppText variant="caption" style={styles.sectionTitle}>
          HOJE
        </AppText>
        {today}
        {isGoalOverPlan ? (
          <View style={styles.warning}>
            <AppText variant="body" tone="warning">
              {planPerDay !== null
                ? `Sua meta (${money(goal)}/dia) passa do plano (${money(planPerDay)}/dia).`
                : `Sua meta é de ${money(goal)}/dia, mas o plano não tem sobra para gastos variáveis.`}
            </AppText>
            <Button label="Ajustar meta" variant="secondary" size="sm" onPress={openPlan} />
          </View>
        ) : null}
      </View>

      <Pressable accessibilityRole="button" onPress={openPlan} style={styles.section}>
        <View style={styles.nextRow}>
          <View style={styles.nextText}>
            <AppText variant="caption">
              {isOpen ? "Próxima fatura" : "Fatura em aberto"} ({formatShortDate(plan.next.purchaseStart)} a{" "}
              {formatShortDate(plan.next.lastPurchaseDate)})
            </AppText>
            {nextPerDay !== null ? <AppText variant="caption">~{money(nextPerDay)}/dia para gastos variáveis</AppText> : null}
          </View>
          <MoneyText amount={next} variant="value" tone={next >= 0 ? "ink" : "danger"} />
        </View>
        <AppText variant="label" tone="accent" style={styles.link}>
          Ver planejamento ›
        </AppText>
      </Pressable>
    </Block>
  );
}

const styles = StyleSheet.create({
  spaced: {
    marginBottom: space.lg,
  },
  hero: {
    marginTop: 2,
  },
  gapTop: {
    marginTop: space.sm,
  },
  paragraph: {
    marginTop: space.xs,
    marginBottom: space.md,
  },
  newCycle: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: palette.accent,
  },
  section: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: palette.rule,
  },
  sectionTitle: {
    marginBottom: space.sm,
    letterSpacing: 0.6,
  },
  warning: {
    marginTop: space.md,
    padding: space.md,
    gap: space.sm,
    borderRadius: radius.control,
    backgroundColor: palette.warningSoft,
    alignItems: "flex-start",
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  nextText: {
    flexShrink: 1,
  },
  link: {
    marginTop: space.sm,
  },
});
