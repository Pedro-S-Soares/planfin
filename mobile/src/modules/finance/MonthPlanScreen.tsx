import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { usePeriod } from "../../context/PeriodContext";
import { useApplyDailyGoalMutation, useMonthPlanQuery } from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors, Radius } from "../../theme/tokens";
import { FormLabel } from "./components/FormLabel";
import { PlanSection, type PlanLine } from "./components/PlanSection";
import { PlanTotal } from "./components/PlanTotal";
import { formatMoney, formatShortDate, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

const lines = (items: (PlanLine | null)[] | null | undefined): PlanLine[] => (items ?? []).filter((i): i is PlanLine => i !== null);

/** The paper plan: this month's closing and next month's variable money with the daily goal. */
export function MonthPlanScreen() {
  usePageTitle("Planfin - Planejamento");
  const navigation = useNavigation<Navigation>();
  const { currency } = useCurrency();
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const { refetch: refetchPeriod, setSelectedPeriod, period } = usePeriod();
  const today = toISODate(new Date());
  const { data, loading, error, refetch } = useMonthPlanQuery({ variables: { today }, fetchPolicy: "cache-and-network" });
  const [goal, setGoal] = useState<string | null>(null);
  const [applyGoal, { loading: applying }] = useApplyDailyGoalMutation({
    refetchQueries: ["GroupPeriods", "FinancePanel", "AllowancePlan", "MonthPlan"],
    onCompleted: async (d) => {
      const id = d.applyDailyGoal?.id;
      if (id) await setSelectedPeriod(id);
      refetchPeriod();
    },
    onError: () => undefined, // o toast global avisa o erro
  });

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

  const plan = data?.monthPlan;
  if (!plan?.current || !plan.next) {
    return (
      <View style={{ padding: 16 }}>
        <Card padding={18}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>Cadastre o salário</Text>
          <Text style={{ fontSize: 13, color: Colors.textSec, marginVertical: 8 }}>
            O planejamento parte do salário e do dia em que ele cai.
          </Text>
          <Btn label="Salário e ciclo" size="sm" onPress={() => navigation.navigate("SalarySettings")} />
        </Card>
      </View>
    );
  }

  const c = plan.current;
  const n = plan.next;
  // Inflows up to the invoice due date pay the invoice; later ones only count for the month's leftover.
  const cutoff = c.invoiceDueDate ?? null;
  const beforeDue = (items: PlanLine[]) => items.filter((i) => !cutoff || (i.date ?? "") <= cutoff);
  const afterDue = (items: PlanLine[]) => items.filter((i) => !!cutoff && (i.date ?? "") > cutoff);
  const salariesBefore = beforeDue(lines(c.salaries));
  const salariesAfter = afterDue(lines(c.salaries));
  const incomesBefore = beforeDue(lines(c.incomes));
  const incomesAfter = afterDue(lines(c.incomes));
  const dueLabel = cutoff ? formatShortDate(cutoff) : null;
  const leftover = toNumber(c.leftover);
  const remaining = toNumber(n.remaining);
  const days = n.days ?? 30;
  const suggested = Math.max(0, Math.floor(remaining / days));
  const goalValue = goal ?? formatCents(suggested * 100);
  const goalCents = parseCents(goalValue);
  const expectedSpending = (goalCents / 100) * days;
  const expectedAllowance = remaining - expectedSpending;
  const currentGoal = period?.dailyLimit ? toNumber(period.dailyLimit) : null;

  const handleApply = () =>
    confirm(
      {
        title: "Usar meta diária",
        message: `O limite passa a ser ${money(goalCents / 100)} por dia, de hoje até ${formatShortDate(c.endDate)}. O planejamento atual termina ontem.`,
        confirmLabel: "Usar",
      },
      () => applyGoal({ variables: { daily: displayToAPI(goalValue), today } }),
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card padding={16} style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>
          ESTE MÊS · ATÉ {formatShortDate(c.endDate)}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textTer, marginBottom: 6 }}>Até a véspera do salário do mês que vem</Text>
        <PlanSection sign="+" title="Saldo na conta" items={[{ label: "Conta principal", date: today, amount: c.balance }]} />
        {salariesBefore.length > 0 ? <PlanSection sign="+" title="Salário a receber" items={salariesBefore} /> : null}
        {dueLabel && incomesBefore.length > 0 ? (
          <PlanSection sign="+" title={`Entradas até ${dueLabel}`} items={incomesBefore} />
        ) : null}
        <PlanSection sign="−" title={dueLabel ? `Fatura do cartão · vence ${dueLabel}` : "Fatura do cartão"} items={lines(c.invoices)} emptyText="—" />
        <PlanTotal label={dueLabel ? `Resto após pagar a fatura em ${dueLabel}` : "Resto após pagar a fatura"} value={money(c.afterInvoices)} />
        <PlanSection sign="−" title="Fixas no boleto" items={lines(c.fixedBills)} emptyText="—" />
        <PlanSection sign="−" title="Gastos avulsos no boleto" items={lines(c.oneOffBills)} emptyText="—" />
        {salariesAfter.length > 0 ? <PlanSection sign="+" title={`Salário depois de ${dueLabel}`} items={salariesAfter} /> : null}
        <PlanSection
          sign="+"
          title={dueLabel ? `Entradas depois de ${dueLabel}` : "Entradas previstas"}
          items={dueLabel ? incomesAfter : incomesBefore}
          emptyText="—"
        />
        <View style={{ marginTop: 10, borderRadius: Radius.md, padding: 12, backgroundColor: leftover >= 0 ? Colors.successLight : Colors.dangerLight }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: leftover >= 0 ? Colors.successText : Colors.danger, letterSpacing: 0.6 }}>
            SOBRA DO MÊS
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: leftover >= 0 ? Colors.successText : Colors.danger }}>{money(leftover)}</Text>
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
            {leftover >= 1
              ? `Mesada do mês: ${money(leftover / 2)} para cada um.`
              : leftover > -50
                ? "Fica zerado: sem mesada neste mês."
                : `Faltam ${money(-leftover)} para pagar tudo até ${formatShortDate(c.endDate)}.`}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate("BillForm", { direction: "expense", once: true })}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>+ Gasto avulso</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("BillForm", { direction: "income", once: true })}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>+ Entrada prevista</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card padding={16}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>
          PRÓXIMO MÊS · SALÁRIO DE {formatShortDate(n.startDate)}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textTer, marginBottom: 6 }}>
          {formatShortDate(n.startDate)} a {formatShortDate(n.endDate)} · {days} dias
        </Text>
        <PlanSection sign="+" title="Salário" items={n.salary ? [n.salary] : []} />
        <PlanSection sign="+" title="Vale alimentação" items={lines(n.benefits)} emptyText="—" />
        <PlanSection sign="−" title="Despesas fixas" items={lines(n.fixedBills)} emptyText="—" />
        {lines(n.installments).length > 0 ? <PlanSection sign="−" title="Parcelas" items={lines(n.installments)} /> : null}
        <PlanTotal label="Resto para gastos variáveis" value={money(remaining)} tone={remaining >= 0 ? Colors.successText : Colors.danger} strong />

        <View style={{ marginTop: 12 }}>
          <FormLabel>Meta diária</FormLabel>
          <CurrencyInput value={goalValue} onChange={setGoal} />
          <View style={{ backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 12, marginBottom: 12, gap: 4 }}>
            <Text style={{ fontSize: 13, color: Colors.textSec }}>
              Gasto previsto: {money(goalCents / 100)} × {days} dias = {money(expectedSpending)}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: expectedAllowance >= 0 ? Colors.successText : Colors.danger }}>
              {expectedAllowance >= 0
                ? `Mesada prevista: ${money(expectedAllowance)} (${money(expectedAllowance / 2)} cada)`
                : `Passa ${money(-expectedAllowance)} do que sobra`}
            </Text>
            {currentGoal !== null ? (
              <Text style={{ fontSize: 12, color: Colors.textTer }}>Limite em uso hoje: {money(currentGoal)}/dia</Text>
            ) : null}
          </View>
          <Btn label={`Usar ${money(goalCents / 100)}/dia a partir de hoje`} onPress={handleApply} loading={applying} disabled={goalCents <= 0} />
        </View>
      </Card>
    </ScrollView>
  );
}
