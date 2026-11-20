import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Chip } from "../../../components/ui/Chip";
import { IconButton } from "../../../components/ui/IconButton";
import { useCurrency } from "../../../context/CurrencyContext";
import { toISODate } from "../../../lib/date";
import { space } from "../../../theme";
import { addMonths, formatMoney, formatMonth, invoiceDueDate } from "../format";
import { FormLabel } from "./FormLabel";

const COUNTS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24];

type InstallmentPlanProps = {
  count: number;
  onCountChange: (count: number) => void;
  /** Amount typed in the form. */
  amount: number;
  perInstallment: boolean;
  onPerInstallmentChange: (value: boolean) => void;
  /** Invoice of the 1st installment ("YYYY-MM"). */
  firstInvoice: string;
  /** Invoice the purchase date falls in. */
  defaultInvoice: string;
  onFirstInvoiceChange: (month: string) => void;
  closingDay: number;
  dueDay: number;
};

/** Installments of a card purchase: how many, which value, and which invoice gets the first one. */
export function InstallmentPlan({
  count,
  onCountChange,
  amount,
  perInstallment,
  onPerInstallmentChange,
  firstInvoice,
  defaultInvoice,
  onFirstInvoiceChange,
  closingDay,
  dueDay,
}: InstallmentPlanProps) {
  const { currency } = useCurrency();
  const money = (v: number) => formatMoney(v, currency.symbol);
  const parcel = count > 1 && !perInstallment ? amount / count : amount;
  const total = count > 1 && perInstallment ? amount * count : amount;
  const today = toISODate(new Date());

  // Installments on invoices already due are considered paid and are not created.
  const created = Array.from({ length: count }, (_, i) => i + 1).filter(
    (n) => invoiceDueDate(addMonths(firstInvoice, n - 1), closingDay, dueDay) >= today,
  );
  const firstCreated = created[0];
  const isRetroactive = firstInvoice !== defaultInvoice;

  return (
    <View style={styles.root}>
      <FormLabel>Parcelas</FormLabel>
      <View style={styles.chips}>
        {COUNTS.map((n) => (
          <Chip key={n} label={n === 1 ? "À vista" : `${n}x`} selected={count === n} onPress={() => onCountChange(n)} />
        ))}
      </View>

      {count > 1 ? (
        <>
          <View style={[styles.chips, styles.section]}>
            <Chip label="Valor total" selected={!perInstallment} onPress={() => onPerInstallmentChange(false)} />
            <Chip label="Valor da parcela" selected={perInstallment} onPress={() => onPerInstallmentChange(true)} />
          </View>

          <View style={styles.section}>
            <FormLabel>Fatura da 1ª parcela</FormLabel>
          </View>
          <View style={styles.monthRow}>
            <IconButton
              icon="chevron-left"
              accessibilityLabel="Fatura anterior"
              onPress={() => onFirstInvoiceChange(addMonths(firstInvoice, -1))}
            />
            <AppText variant="label" tone="accent" style={styles.month}>
              {formatMonth(firstInvoice)}
            </AppText>
            <IconButton
              icon="chevron-right"
              accessibilityLabel="Próxima fatura"
              onPress={() => onFirstInvoiceChange(addMonths(firstInvoice, 1))}
            />
            {isRetroactive ? (
              <Pressable accessibilityRole="button" onPress={() => onFirstInvoiceChange(defaultInvoice)} hitSlop={8}>
                <AppText variant="caption" tone="accent">Usar a atual</AppText>
              </Pressable>
            ) : null}
          </View>

          <AppText variant="caption" style={styles.section}>
            {count}x de {money(parcel)} · total {money(total)}.{" "}
            {firstCreated === undefined
              ? "Todas as parcelas já venceram; não há nada para lançar."
              : firstCreated === 1
                ? `Parcelas nas faturas de ${formatMonth(firstInvoice)} a ${formatMonth(addMonths(firstInvoice, count - 1))}.`
                : `Serão lançadas as parcelas ${firstCreated} a ${count} (${formatMonth(addMonths(firstInvoice, firstCreated - 1))} a ${formatMonth(addMonths(firstInvoice, count - 1))}). As parcelas 1 a ${firstCreated - 1} já venceram e ficam de fora.`}
          </AppText>
          <AppText variant="caption" style={styles.note}>
            {isRetroactive
              ? "Compra de outra fatura: nenhuma parcela entra no limite de hoje."
              : "Só a 1ª parcela entra no limite de hoje; as outras são descontadas dos próximos ciclos."}
          </AppText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: space.lg,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  section: {
    marginTop: space.md,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  month: {
    minWidth: 72,
    textAlign: "center",
  },
  note: {
    marginTop: space.xs,
  },
});
