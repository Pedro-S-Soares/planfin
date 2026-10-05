import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Btn } from "../../../components/ui/Btn";
import { useSetInvoiceTotalMutation } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents } from "../../../lib/currency";
import { toISODate } from "../../../lib/date";
import { Colors } from "../../../theme/tokens";
import { toNumber } from "../format";

type AdjustInvoiceTotalProps = {
  cardId: string;
  month: string;
  currentTotal: string | null | undefined;
};

/** Set the invoice to the bank's number; the app records the difference as one adjustment. */
export function AdjustInvoiceTotal({ cardId, month, currentTotal }: AdjustInvoiceTotalProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("0,00");
  const [setTotal, { loading }] = useSetInvoiceTotalMutation({
    refetchQueries: ["Invoice", "Invoices", "FinancePanel", "MonthPlan", "ExpenseHistoryWithAuthors"],
    onCompleted: () => setEditing(false),
    onError: () => undefined, // o toast global avisa o erro
  });

  if (!editing) {
    return (
      <TouchableOpacity
        onPress={() => {
          setValue(formatCents(Math.round(toNumber(currentTotal) * 100)));
          setEditing(true);
        }}
        activeOpacity={0.7}
        style={{ marginTop: 12 }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>Ajustar valor da fatura ›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontSize: 13, color: Colors.textSec, marginBottom: 8, lineHeight: 18 }}>
        Informe o total que o banco mostra para esta fatura. A diferença para o que está no app vira um lançamento de
        ajuste, sem precisar registrar gasto por gasto. Ajustar de novo substitui o ajuste anterior.
      </Text>
      <CurrencyInput value={value} onChange={setValue} autoFocus />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Btn
            label="Salvar valor"
            size="sm"
            loading={loading}
            onPress={() => setTotal({ variables: { cardId, month, total: displayToAPI(value), today: toISODate(new Date()) } })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Btn label="Cancelar" size="sm" variant="ghost" onPress={() => setEditing(false)} />
        </View>
      </View>
    </View>
  );
}
