import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Button } from "../../../components/ui/Button";
import { Block } from "../../../components/ui/Block";
import { useCurrency } from "../../../context/CurrencyContext";
import { useSetInvoiceGoalMutation } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { formatMoney, toNumber } from "../format";
import { invoiceMonthLabel, type InvoiceCard } from "../invoice-label";
import { palette, radius } from "../../../theme";
import { Text } from "../../../components/ui/Text";

type HistoryInvoice = { month: string; total: number; status: string };

type InvoiceHistoryProps = {
  cardId: string;
  /** The card's closing and due days, to name invoices by their due month. */
  card?: InvoiceCard;
  goal: string | null | undefined;
  /** Oldest first, up to the current (open) invoice. */
  invoices: HistoryInvoice[];
};

const CHART_HEIGHT = 120;

/** Invoice totals month by month against the optional goal. */
export function InvoiceHistory({ cardId, card, goal, invoices }: InvoiceHistoryProps) {
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
    <Block padding={16} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>Evolução da fatura</Text>
      {last ? (
        <Text style={{ fontSize: 13, color: palette.muted, marginTop: 4 }}>
          Última fechada: {formatMoney(last.total, currency.symbol)}
          {delta !== null ? ` · ${delta <= 0 ? "▼" : "▲"} ${Math.abs(Math.round(delta * 100))}% vs ${invoiceMonthLabel(previous?.month, card)}` : ""}
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
              borderColor: palette.income,
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
                  borderTopLeftRadius: radius.control,
                  borderTopRightRadius: radius.control,
                  backgroundColor: i.status === "open" ? palette.accentSoft : overGoal ? palette.danger : palette.accent,
                  borderWidth: i.status === "open" ? 1.5 : 0,
                  borderColor: palette.accent,
                  borderStyle: "dashed",
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
        {invoices.map((i) => (
          <Text key={i.month} style={{ flex: 1, textAlign: "center", fontSize: 12, color: palette.muted }}>
            {invoiceMonthLabel(i.month, card).slice(0, 3)}
          </Text>
        ))}
      </View>

      {editingGoal ? (
        <View style={{ marginTop: 14 }}>
          <CurrencyInput value={goalDraft} onChange={setGoalDraft} autoFocus />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Salvar meta"
                size="sm"
                isLoading={loading}
                onPress={() =>
                  setInvoiceGoal({ variables: { id: cardId, invoiceGoal: parseCents(goalDraft) > 0 ? displayToAPI(goalDraft) : null } })
                }
              />
            </View>
            {goalValue !== null ? (
              <View style={{ flex: 1 }}>
                <Button label="Remover" size="sm" variant="secondary" onPress={() => setInvoiceGoal({ variables: { id: cardId, invoiceGoal: null } })} />
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditingGoal(true)} activeOpacity={0.7} style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: palette.accent }}>
            {goalValue !== null
              ? `Meta: fatura até ${formatMoney(goalValue, currency.symbol)} · alterar`
              : "Definir meta para reduzir a fatura"}
          </Text>
        </TouchableOpacity>
      )}
    </Block>
  );
}
