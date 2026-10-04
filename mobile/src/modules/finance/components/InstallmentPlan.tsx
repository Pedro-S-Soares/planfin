import { Text, TouchableOpacity, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { useCurrency } from "../../../context/CurrencyContext";
import { toISODate } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
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
    <View style={{ marginBottom: 16 }}>
      <FormLabel>Parcelas</FormLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
        {COUNTS.map((n) => (
          <Chip key={n} label={n === 1 ? "À vista" : `${n}x`} selected={count === n} onPress={() => onCountChange(n)} />
        ))}
      </View>

      {count > 1 ? (
        <>
          <View style={{ flexDirection: "row", gap: 7, marginTop: 12 }}>
            <Chip label="Valor total" selected={!perInstallment} onPress={() => onPerInstallmentChange(false)} />
            <Chip label="Valor da parcela" selected={perInstallment} onPress={() => onPerInstallmentChange(true)} />
          </View>

          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, marginTop: 14, marginBottom: 6 }}>
            FATURA DA 1ª PARCELA
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={() => onFirstInvoiceChange(addMonths(firstInvoice, -1))} hitSlop={10}>
              <Text style={{ fontSize: 22, color: Colors.primary }}>‹</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.primaryText }}>{formatMonth(firstInvoice)}</Text>
            </View>
            <TouchableOpacity onPress={() => onFirstInvoiceChange(addMonths(firstInvoice, 1))} hitSlop={10}>
              <Text style={{ fontSize: 22, color: Colors.primary }}>›</Text>
            </TouchableOpacity>
            {isRetroactive ? (
              <TouchableOpacity onPress={() => onFirstInvoiceChange(defaultInvoice)}>
                <Text style={{ fontSize: 12, color: Colors.textSec, textDecorationLine: "underline" }}>usar a atual</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 10, lineHeight: 17 }}>
            {count}x de {money(parcel)} · total {money(total)}.{" "}
            {firstCreated === undefined
              ? "Todas as parcelas já venceram; não há nada para lançar."
              : firstCreated === 1
                ? `Parcelas nas faturas de ${formatMonth(firstInvoice)} a ${formatMonth(addMonths(firstInvoice, count - 1))}.`
                : `Serão lançadas as parcelas ${firstCreated} a ${count} (${formatMonth(addMonths(firstInvoice, firstCreated - 1))} a ${formatMonth(addMonths(firstInvoice, count - 1))}). As parcelas 1 a ${firstCreated - 1} já venceram e ficam de fora.`}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 4 }}>
            {isRetroactive
              ? "Compra de outra fatura: nenhuma parcela entra no limite de hoje."
              : "Só a 1ª parcela entra no limite de hoje; as outras são descontadas dos próximos ciclos."}
          </Text>
        </>
      ) : null}
    </View>
  );
}
