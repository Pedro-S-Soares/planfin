import { useState } from "react";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { FieldInput } from "../../components/ui/FieldInput";
import {
  useFinancialSettingsQuery,
  useUpdateFinancialSettingsMutation,
} from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { AccountPicker } from "./components/AccountPicker";
import { FormLabel } from "./components/FormLabel";
import { SalaryMonthRow, type SalaryMonth } from "./components/SalaryMonthRow";
import { toNumber } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";

type SalaryFormProps = {
  initialAmount: string | null | undefined;
  initialDay: number;
  initialAccountId: string | null | undefined;
};

function SalaryForm({ initialAmount, initialDay, initialAccountId }: SalaryFormProps) {
  const navigation = useNavigation();
  const { accounts, primary } = useFinancialAccounts();
  const [amount, setAmount] = useState(formatCents(Math.round(toNumber(initialAmount) * 100)));
  const [day, setDay] = useState(String(initialDay));
  const [accountId, setAccountId] = useState<string | null | undefined>(initialAccountId ?? undefined);
  const [error, setError] = useState<string | null>(null);
  const effectiveAccount = accountId === undefined ? primary?.id ?? null : accountId;

  const [save, { loading }] = useUpdateFinancialSettingsMutation({
    refetchQueries: ["FinancialSettings", "FinancePanel", "MonthPlan"],
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  const handleSave = () => {
    const businessDay = Number(day);
    if (parseCents(amount) === 0) return setError("Informe o salário líquido");
    if (!businessDay || businessDay < 1 || businessDay > 22) return setError("Dia útil entre 1 e 22");
    save({
      variables: {
        salaryAmount: displayToAPI(amount),
        salaryBusinessDay: businessDay,
        salaryAccountId: effectiveAccount,
        today: toISODate(new Date()),
      },
    });
  };

  return (
    <>
      <FormLabel>Salário líquido por mês</FormLabel>
      <CurrencyInput value={amount} onChange={setAmount} />
      <FieldInput
        label="Cai no dia útil nº"
        value={day}
        onChange={(v) => setDay(v.replace(/\D/g, "").slice(0, 2))}
        keyboardType="number-pad"
        hint="Sábado conta como dia útil; domingos e feriados nacionais não."
      />
      <AccountPicker label="Cai na conta" accounts={accounts} value={effectiveAccount} onChange={setAccountId} kinds={["checking"]} />
      {error ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Btn label="Salvar salário" onPress={handleSave} loading={loading} />
    </>
  );
}

export function SalarySettingsScreen() {
  usePageTitle("Planfin - Salário e ciclo");
  const { data, loading } = useFinancialSettingsQuery({
    variables: { today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });
  const settings = data?.financialSettings;
  const salaries: SalaryMonth[] = (settings?.upcomingSalaryDates ?? []).flatMap((d) =>
    d?.month && d.date
      ? [
          {
            month: d.month,
            date: d.date,
            isManual: d.isManual ?? false,
            amount: d.amount ?? null,
            paid: d.paid ?? false,
            paidAmount: d.paidAmount ?? null,
            paidOn: d.paidOn ?? null,
          },
        ]
      : [],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
      <Text style={{ fontSize: 14, color: Colors.textSec, lineHeight: 20, marginBottom: 18 }}>
        O ciclo vai do dia do salário até a véspera do próximo. Com o salário cadastrado, o app propõe o orçamento do
        ciclo e mostra quanto você pode gastar até o próximo pagamento.
      </Text>
      {loading && !data ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <SalaryForm
          key={settings?.salaryAmount ?? "new"}
          initialAmount={settings?.salaryAmount}
          initialDay={settings?.salaryBusinessDay ?? 10}
          initialAccountId={settings?.salaryAccountId}
        />
      )}
      {salaries.length > 0 ? (
        <Card padding={16} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>SALÁRIOS</Text>
          <Text style={{ fontSize: 12, color: Colors.textTer, marginTop: 2 }}>
            Quando cair, marque como pago com o valor e o dia reais. Antes disso, dá para ajustar a previsão do mês.
          </Text>
          {salaries.map((salary) => (
            <SalaryMonthRow key={`${salary.month}-${salary.paid}-${salary.date}-${salary.amount}`} salary={salary} />
          ))}
        </Card>
      ) : null}
      <Text style={{ fontSize: 12, color: Colors.textTer, marginTop: 16, lineHeight: 18 }}>
        Renda variável, que vai direto para a reserva, não entra no orçamento: lance como receita na conta Reserva.
      </Text>
    </ScrollView>
  );
}
