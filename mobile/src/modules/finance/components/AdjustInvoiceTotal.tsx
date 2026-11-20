import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { AppText } from "../../../components/ui/AppText";
import { Button } from "../../../components/ui/Button";
import { useSetInvoiceTotalMutation } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents } from "../../../lib/currency";
import { toISODate } from "../../../lib/date";
import { space } from "../../../theme";
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
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setValue(formatCents(Math.round(toNumber(currentTotal) * 100)));
          setEditing(true);
        }}
        hitSlop={8}
        style={styles.link}
      >
        <AppText variant="label" tone="accent">Ajustar valor da fatura</AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.editor}>
      <AppText variant="caption" style={styles.help}>
        Informe o total que o banco mostra para esta fatura. A diferença para o que está no app vira um lançamento de
        ajuste, sem precisar registrar gasto por gasto. Ajustar de novo substitui o ajuste anterior.
      </AppText>
      <CurrencyInput value={value} onChange={setValue} autoFocus />
      <View style={styles.actions}>
        <Button
          label="Salvar valor"
          size="sm"
          isLoading={loading}
          style={styles.action}
          onPress={() => setTotal({ variables: { cardId, month, total: displayToAPI(value), today: toISODate(new Date()) } })}
        />
        <Button label="Cancelar" size="sm" variant="secondary" style={styles.action} onPress={() => setEditing(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: "flex-start",
    marginTop: space.md,
  },
  editor: {
    marginTop: space.md,
  },
  help: {
    marginBottom: space.sm,
  },
  actions: {
    flexDirection: "row",
    gap: space.sm,
  },
  action: {
    flex: 1,
  },
});
