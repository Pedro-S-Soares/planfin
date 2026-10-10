import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { DatePickerField } from "../../../components/DatePickerField";
import { Btn } from "../../../components/ui/Btn";
import { useCurrency } from "../../../context/CurrencyContext";
import {
  useRegisterSalaryMutation,
  useResetSalaryDateMutation,
  useSetSalaryDateMutation,
  useUnregisterSalaryMutation,
} from "../../../graphql/__generated__/hooks";
import { confirm } from "../../../lib/alert";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { formatDateBR, toISODate } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatMonth, toNumber } from "../format";
import { FormLabel } from "./FormLabel";

export type SalaryMonth = {
  month: string;
  date: string;
  isManual: boolean;
  amount: string | null;
  paid: boolean;
  paidAmount: string | null;
  paidOn: string | null;
};

const REFETCH = ["FinancialSettings", "FinancePanel", "MonthPlan", "FinancialAccounts", "AllowancePlan", "AccountMovements"];
const toDisplay = (value: string | null) => formatCents(Math.round(toNumber(value) * 100));

function Pill({ label, onPress, strong }: { label: string; onPress: () => void; strong?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ backgroundColor: strong ? Colors.primary : Colors.bg, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: strong ? "#fff" : Colors.primaryText }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** One month's salary: expected date and amount, and marking it as paid with the real ones. */
export function SalaryMonthRow({ salary }: { salary: SalaryMonth }) {
  const { currency } = useCurrency();
  const money = (v: string | null) => formatMoney(v, currency.symbol);
  const [mode, setMode] = useState<"edit" | "pay" | null>(null);
  const [date, setDate] = useState(salary.date);
  const [amount, setAmount] = useState(toDisplay(salary.amount));
  const close = () => setMode(null);
  const options = { refetchQueries: REFETCH, onCompleted: close, onError: () => undefined };
  const [setExpected, { loading: saving }] = useSetSalaryDateMutation(options);
  const [resetDate] = useResetSalaryDateMutation(options);
  const [register, { loading: paying }] = useRegisterSalaryMutation(options);
  const [unregister] = useUnregisterSalaryMutation(options);

  const open = (next: "edit" | "pay") => {
    setAmount(toDisplay(salary.amount));
    // Paying defaults to today (the money usually arrives a bit before the expected day).
    setDate(next === "pay" && toISODate(new Date()) < salary.date ? toISODate(new Date()) : salary.date);
    setMode(next);
  };

  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text }}>{formatMonth(salary.month)}</Text>
      {salary.paid ? (
        <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.successText, marginTop: 2 }}>
          ✓ Pago em {salary.paidOn ? formatDateBR(salary.paidOn) : "—"} · {money(salary.paidAmount)}
        </Text>
      ) : (
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 2 }}>
          Previsto para {formatDateBR(salary.date)}
          {salary.isManual ? " (data ajustada)" : ""} · {money(salary.amount)}
        </Text>
      )}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
        {salary.paid ? (
          <Pill
            label="Desfazer pagamento"
            onPress={() =>
              confirm(
                {
                  title: "Desfazer pagamento",
                  message: "O lançamento do salário é apagado e a data volta a ser a prevista.",
                  confirmLabel: "Desfazer",
                  destructive: true,
                },
                () => unregister({ variables: { month: salary.month } }),
              )
            }
          />
        ) : (
          <>
            <Pill label="Marcar como pago" strong onPress={() => open("pay")} />
            <Pill label="Alterar previsão" onPress={() => open("edit")} />
          </>
        )}
      </View>

      {mode ? (
        <View style={{ marginTop: 12, backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 12 }}>
          <FormLabel>{mode === "pay" ? "Valor que caiu" : "Valor previsto"}</FormLabel>
          <CurrencyInput value={amount} onChange={setAmount} />
          <FormLabel>{mode === "pay" ? "Dia em que caiu" : "Data prevista"}</FormLabel>
          <DatePickerField value={date} onChange={setDate} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              {mode === "pay" ? (
                <Btn
                  label="Confirmar pagamento"
                  size="sm"
                  loading={paying}
                  disabled={parseCents(amount) === 0}
                  onPress={() => register({ variables: { month: salary.month, amount: displayToAPI(amount), date } })}
                />
              ) : (
                <Btn
                  label="Salvar previsão"
                  size="sm"
                  loading={saving}
                  disabled={parseCents(amount) === 0}
                  onPress={() => setExpected({ variables: { month: salary.month, date, amount: displayToAPI(amount) } })}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Btn label="Cancelar" size="sm" variant="ghost" onPress={close} />
            </View>
          </View>
          {mode === "edit" && salary.isManual ? (
            <TouchableOpacity onPress={() => resetDate({ variables: { month: salary.month } })} style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 12, color: Colors.textSec, textDecorationLine: "underline" }}>Voltar à data automática</Text>
            </TouchableOpacity>
          ) : null}
          {mode === "pay" ? (
            <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 10, lineHeight: 17 }}>
              O valor entra no saldo da conta do salário e o ciclo passa a começar nesse dia.
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
