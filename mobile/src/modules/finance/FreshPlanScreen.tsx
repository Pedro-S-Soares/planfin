import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { usePeriod } from "../../context/PeriodContext";
import { useFreshPlanQuery, useStartFreshPlanMutation } from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { displayToAPI, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors, Radius } from "../../theme/tokens";
import { FormLabel } from "./components/FormLabel";
import { PlanSection } from "./components/PlanSection";
import { formatMoney, formatShortDate, toNumber } from "./format";

/** Cash plan from today: what is in the account, what comes in, what must go out, and the daily limit left. */
export function FreshPlanScreen() {
  usePageTitle("Planfin - Planejar a partir de hoje");
  const navigation = useNavigation();
  const { currency } = useCurrency();
  const { refetch: refetchPeriod, setSelectedPeriod } = usePeriod();
  const today = toISODate(new Date());
  const { data, loading, error, refetch } = useFreshPlanQuery({ variables: { today }, fetchPolicy: "network-only" });
  const [gordura, setGordura] = useState("0,00");
  const [start, { loading: starting }] = useStartFreshPlanMutation({
    refetchQueries: ["GroupPeriods", "FinancePanel", "AllowancePlan", "SalaryProjection"],
    onCompleted: async (d) => {
      const id = d.startFreshPlan?.id;
      if (id) await setSelectedPeriod(id);
      refetchPeriod();
      if (navigation.canGoBack()) navigation.goBack();
    },
    onError: () => undefined, // o toast global avisa o erro
  });

  if (loading && !data) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />;
  if (error || !data?.freshPlan) {
    return (
      <View style={{ padding: 16 }}>
        <InlineError onRetry={() => refetch()} />
      </View>
    );
  }

  const plan = data.freshPlan;
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const variableCents = Math.round(toNumber(plan.variable) * 100);
  const days = plan.days ?? 1;
  const dailyCents = Math.floor((variableCents - parseCents(gordura)) / days);
  const isValid = dailyCents > 0;
  const cards = plan.cards?.filter((i) => i !== null) ?? [];
  const accountBills = plan.accountBills?.filter((i) => i !== null) ?? [];
  const cardBills = plan.cardBills?.filter((i) => i !== null) ?? [];

  const handleStart = () =>
    confirm(
      {
        title: "Planejar a partir de hoje",
        message: `O planejamento atual termina ontem. Um novo vai de hoje até ${formatShortDate(plan.endDate)} (${days} dias), com limite de ${money(dailyCents / 100)} por dia.`,
        confirmLabel: "Começar",
      },
      () => start({ variables: { gordura: displayToAPI(gordura), today } }),
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ fontSize: 13, color: Colors.textSec, lineHeight: 19, marginBottom: 12 }}>
        Sem olhar para trás: o dinheiro de hoje até {formatShortDate(plan.endDate)} ({days} dias). Se a fatura no app não
        bate com o banco, ajuste o valor na tela da fatura antes.
      </Text>

      <Card padding={16} style={{ marginBottom: 12 }}>
        <PlanSection sign="+" title="Saldo na conta hoje" items={[{ label: "Conta principal", date: today, amount: plan.balance }]} />
        {plan.salaryAmount ? (
          <PlanSection sign="+" title={`Salário de ${formatShortDate(plan.salaryDate)}`} items={[{ label: "Salário", date: plan.salaryDate, amount: plan.salaryAmount }]} />
        ) : null}
        <PlanSection sign="−" title="Faturas do cartão" items={cards} emptyText="—" />
        <PlanSection sign="−" title="Fixas na conta (boletos)" items={accountBills} emptyText="—" />
        <PlanSection sign="−" title="Fixas no cartão a entrar" items={cardBills} emptyText="—" />
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>Sobra para gastos variáveis</Text>
          <Text style={{ fontSize: 15, fontWeight: "800", color: variableCents < 0 ? Colors.danger : Colors.successText }}>
            {money(plan.variable)}
          </Text>
        </View>
      </Card>

      {!plan.hasPrimary ? (
        <Text style={{ fontSize: 12, color: Colors.danger, marginBottom: 12 }}>
          Cadastre a conta principal na aba Contas para o saldo entrar na conta.
        </Text>
      ) : null}

      <Card padding={16}>
        <FormLabel>Gordura (extra para queimar)</FormLabel>
        <CurrencyInput value={gordura} onChange={setGordura} />
        <View style={{ backgroundColor: isValid ? Colors.successLight : Colors.dangerLight, borderRadius: Radius.md, padding: 12, marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: isValid ? Colors.successText : Colors.danger, letterSpacing: 0.6 }}>
            LIMITE DIÁRIO
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: isValid ? Colors.successText : Colors.danger }}>
            {isValid ? money(dailyCents / 100) : "—"}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
            {isValid
              ? `(${money(plan.variable)} − gordura) ÷ ${days} dias`
              : "Não sobra dinheiro para gastos variáveis. Reveja a gordura, as faturas e as fixas."}
          </Text>
        </View>
        <Btn label="Começar a planejar a partir de hoje" onPress={handleStart} loading={starting} disabled={!isValid} />
      </Card>
    </ScrollView>
  );
}
