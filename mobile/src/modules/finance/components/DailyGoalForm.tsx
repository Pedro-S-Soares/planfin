import { useState } from "react";
import { Text, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Btn } from "../../../components/ui/Btn";
import { useCurrency } from "../../../context/CurrencyContext";
import { usePeriod } from "../../../context/PeriodContext";
import { useApplyDailyGoalMutation } from "../../../graphql/__generated__/hooks";
import { confirm } from "../../../lib/alert";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatShortDate } from "../format";
import { FormLabel } from "./FormLabel";

type DailyGoalFormProps = {
  /** Money for variable spending over the goal's days. */
  available: number;
  days: number;
  /** First and last day of the period the goal creates (ISO). */
  startDate: string;
  endDate: string;
  today: string;
};

/** Daily goal of a cycle: suggestion, what is left for the allowance and the button that applies it. */
export function DailyGoalForm({ available, days, startDate, endDate, today }: DailyGoalFormProps) {
  const { currency } = useCurrency();
  const money = (v: number) => formatMoney(v, currency.symbol);
  const { refetch: refetchPeriod, setSelectedPeriod, period } = usePeriod();
  const suggested = Math.max(0, Math.floor(available / days));
  const [goal, setGoal] = useState<string | null>(null);
  const goalValue = goal ?? formatCents(suggested * 100);
  const goalCents = parseCents(goalValue);
  const expectedSpending = (goalCents / 100) * days;
  const leftover = available - expectedSpending;
  const isScheduled = startDate > today;
  const currentGoal = period?.dailyLimit ? Number(period.dailyLimit) : null;

  const [applyGoal, { loading }] = useApplyDailyGoalMutation({
    refetchQueries: ["GroupPeriods", "FinancePanel", "AllowancePlan", "CyclePlan"],
    onCompleted: async (data) => {
      const applied = data.applyDailyGoal;
      if (applied?.id && applied.status === "active") await setSelectedPeriod(applied.id);
      refetchPeriod();
    },
    onError: () => undefined, // o toast global avisa o erro
  });

  const handleApply = () =>
    confirm(
      {
        title: isScheduled ? "Agendar meta diária" : "Usar meta diária",
        message: isScheduled
          ? `A partir de ${formatShortDate(startDate)} o limite passa a ser ${money(goalCents / 100)} por dia, até ${formatShortDate(endDate)}. O período atual termina na véspera.`
          : `O limite passa a ser ${money(goalCents / 100)} por dia, de hoje até ${formatShortDate(endDate)}. O planejamento atual termina ontem.`,
        confirmLabel: isScheduled ? "Agendar" : "Usar",
      },
      () =>
        applyGoal({
          variables: {
            daily: displayToAPI(goalValue),
            startDate: isScheduled ? startDate : null,
            endDate,
            today,
          },
        }),
    );

  return (
    <View style={{ marginTop: 12 }}>
      <FormLabel>Meta diária</FormLabel>
      <CurrencyInput value={goalValue} onChange={setGoal} />
      <View style={{ backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 12, marginBottom: 12, gap: 4 }}>
        <Text style={{ fontSize: 13, color: Colors.textSec }}>
          {money(goalCents / 100)} × {days} {days === 1 ? "dia" : "dias"} ({formatShortDate(startDate)} a {formatShortDate(endDate)}) = {money(expectedSpending)}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "800", color: leftover >= 0 ? Colors.successText : Colors.danger }}>
          {leftover >= 0
            ? `Sobra prevista: ${money(leftover)} (${money(leftover / 2)} de mesada para cada)`
            : `Passa ${money(-leftover)} do que dá para gastar`}
        </Text>
        {currentGoal !== null ? (
          <Text style={{ fontSize: 12, color: Colors.textTer }}>Limite em uso hoje: {money(currentGoal)}/dia</Text>
        ) : null}
      </View>
      <Btn
        label={
          isScheduled
            ? `Agendar ${money(goalCents / 100)}/dia a partir de ${formatShortDate(startDate)}`
            : `Usar ${money(goalCents / 100)}/dia até ${formatShortDate(endDate)}`
        }
        onPress={handleApply}
        loading={loading}
        disabled={goalCents <= 0}
      />
    </View>
  );
}
