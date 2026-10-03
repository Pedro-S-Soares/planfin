import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Btn } from "../../../components/ui/Btn";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { useSetInvoiceGoalMutation } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatMonth, toNumber } from "../format";

type HistoryInvoice = { month: string; total: number; status: string };

type InvoiceHistoryProps = {
  cardId: string;
  goal: string | null | undefined;
  /** Oldest first, up to the current (open) invoice. */
  invoices: HistoryInvoice[];
};

const CHART_HEIGHT = 120;

/** Invoice totals month by month against the optional goal. */
export function InvoiceHistory({ cardId, goal, invoices }: InvoiceHistoryProps) {
  const { currency } = useCurrency();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(formatCents(Math.round(toNumber(goal) * 100)));
  const [setInvoiceGoal, { loading }] = useSetInvoiceGoalMutation({
    refetchQueries: ["FinancialAccounts"],
    onCompleted: () => setEditingGoal(false),
  });

  const goalValue = goal ? toNumber(goal) : null;
  const max = Math.max(1, goalValue ?? 0, ...invoices.map((i) => i.total));
  const closed = invoices.filter((i) => i.status !== "open");
  const last = closed[closed.length - 1];
  const previous = closed[closed.length - 2];
  const delta = last && previous && previous.total > 0 ? (last.total - previous.total) / previous.total : null;

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>EVOLUÇÃO DA FATURA</Text>
      {last ? (
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4 }}>
          Última fechada: {formatMoney(last.total, currency.symbol)}
          {delta !== null ? ` · ${delta <= 0 ? "▼" : "▲"} ${Math.abs(Math.round(delta * 100))}% vs ${formatMonth(previous?.month)}` : ""}
        </Text>
      ) : null}

      <View style={{ height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 14 }}>
        {goalValue !== null ? (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: (goalValue / max) * CHART_HEIGHT,
              borderTopWidth: 1.5,
              borderStyle: "dashed",
              borderColor: Colors.success,
            }}
          />
        ) : null}
        {invoices.map((i) => {
          const overGoal = goalValue !== null && i.total > goalValue;
          return (
            <View key={i.month} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  width: "100%",
                  height: Math.max(2, (i.total / max) * CHART_HEIGHT),
                  borderTopLeftRadius: Radius.xs,
                  borderTopRightRadius: Radius.xs,
                  backgroundColor: i.status === "open" ? Colors.primaryLight : overGoal ? Colors.danger : Colors.primary,
                  borderWidth: i.status === "open" ? 1.5 : 0,
                  borderColor: Colors.primary,
                  borderStyle: "dashed",
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
        {invoices.map((i) => (
          <Text key={i.month} style={{ flex: 1, textAlign: "center", fontSize: 10, color: Colors.textSec }}>
            {formatMonth(i.month).slice(0, 3)}
          </Text>
        ))}
      </View>

      {editingGoal ? (
        <View style={{ marginTop: 14 }}>
          <CurrencyInput value={goalDraft} onChange={setGoalDraft} autoFocus />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Btn
                label="Salvar meta"
                size="sm"
                loading={loading}
                onPress={() =>
                  setInvoiceGoal({ variables: { id: cardId, invoiceGoal: parseCents(goalDraft) > 0 ? displayToAPI(goalDraft) : null } })
                }
              />
            </View>
            {goalValue !== null ? (
              <View style={{ flex: 1 }}>
                <Btn label="Remover" size="sm" variant="ghost" onPress={() => setInvoiceGoal({ variables: { id: cardId, invoiceGoal: null } })} />
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditingGoal(true)} activeOpacity={0.7} style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>
            {goalValue !== null
              ? `Meta: fatura até ${formatMoney(goalValue, currency.symbol)} · alterar`
              : "Definir meta para reduzir a fatura"}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
