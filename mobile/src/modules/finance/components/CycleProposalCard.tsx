import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Btn } from "../../../components/ui/Btn";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { useCycleProposalQuery } from "../../../graphql/__generated__/hooks";
import { parseCents } from "../../../lib/currency";
import { toISODate } from "../../../lib/date";
import { Colors } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";

export type ProposalValues = {
  startDate: string;
  endDate: string;
  /** cents */
  dailyLimitCents: number;
  /** cents */
  totalBudgetCents: number;
};

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ fontSize: 13, color: strong ? Colors.text : Colors.textSec, fontWeight: strong ? "700" : "400" }}>{label}</Text>
      <Text style={{ fontSize: 13, color: Colors.text, fontWeight: strong ? "800" : "600" }}>{value}</Text>
    </View>
  );
}

/** Builds the period from the salary cycle: salary − bills − installments − gordura, split by days. */
export function CycleProposalCard({ onUse }: { onUse: (values: ProposalValues) => void }) {
  const { currency } = useCurrency();
  const { data, loading } = useCycleProposalQuery({
    variables: { today: toISODate(new Date()) },
    fetchPolicy: "network-only",
  });
  const [gordura, setGordura] = useState("0,00");

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginBottom: 16 }} />;
  const p = data?.cycleProposal;
  if (!p?.startDate || !p.endDate || !p.days) return null;

  const availableCents = Math.round(toNumber(p.available) * 100);
  const gorduraCents = parseCents(gordura);
  const dailyCents = Math.floor((availableCents - gorduraCents) / p.days);
  const isValid = dailyCents > 0;
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);

  return (
    <Card padding={16} style={{ marginBottom: 20, borderWidth: 1.5, borderColor: Colors.primary }}>
      <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>Proposta pelo salário</Text>
      <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 10 }}>
        Ciclo de {formatShortDate(p.startDate)} a {formatShortDate(p.endDate)} · {p.days} dias
      </Text>
      <Line label="Salário" value={money(p.salary)} />
      <Line label="Fixas na conta" value={`− ${money(p.accountBills)}`} />
      <Line label="Fixas no cartão" value={`− ${money(p.cardBills)}`} />
      <Line label="Parcelas de compras anteriores" value={`− ${money(p.installments)}`} />
      <Line label="Sobra para o ciclo" value={money(p.available)} strong />
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7, marginTop: 12, marginBottom: 6 }}>
        GORDURA (EXTRA PARA QUEIMAR)
      </Text>
      <CurrencyInput value={gordura} onChange={setGordura} />
      <Line label="Limite diário" value={isValid ? money(dailyCents / 100) : "—"} strong />
      {!isValid ? (
        <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 4 }}>
          O salário não cobre as fixas, as parcelas e a gordura deste ciclo.
        </Text>
      ) : null}
      <View style={{ marginTop: 12 }}>
        <Btn
          label="Usar esta proposta"
          size="sm"
          disabled={!isValid}
          onPress={() =>
            onUse({
              startDate: p.startDate ?? "",
              endDate: p.endDate ?? "",
              dailyLimitCents: dailyCents,
              totalBudgetCents: availableCents,
            })
          }
        />
      </View>
    </Card>
  );
}
