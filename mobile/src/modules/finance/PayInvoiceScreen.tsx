import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { DatePickerField } from "../../components/DatePickerField";
import { Btn } from "../../components/ui/Btn";
import { usePayInvoiceMutation } from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { AccountPicker } from "./components/AccountPicker";
import { FormLabel } from "./components/FormLabel";
import { formatMonth, toNumber } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

export function PayInvoiceScreen() {
  usePageTitle("Planfin - Pagar fatura");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "PayInvoice">>();
  const { accounts, primary } = useFinancialAccounts();
  const [amount, setAmount] = useState(formatCents(Math.round(toNumber(params.remaining) * 100)));
  const [chosenFrom, setFrom] = useState<string | null | undefined>(undefined);
  const [date, setDate] = useState(toISODate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const from = chosenFrom === undefined ? primary?.id ?? null : chosenFrom;

  const [payInvoice, { loading }] = usePayInvoiceMutation({
    refetchQueries: ["Invoices", "Invoice", "FinancialAccounts", "AccountMovements", "FinancePanel"],
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  const handlePay = () => {
    if (!from) return setError("Escolha a conta que paga a fatura");
    if (parseCents(amount) === 0) return setError("Informe um valor");
    payInvoice({
      variables: { cardId: params.cardId, month: params.month, fromAccountId: from, amount: displayToAPI(amount), date },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 14, color: Colors.textSec, marginBottom: 16 }}>Fatura de {formatMonth(params.month)}</Text>
      <FormLabel>Valor pago</FormLabel>
      <CurrencyInput value={amount} onChange={setAmount} autoFocus />
      <AccountPicker label="Pago com" accounts={accounts} value={from} onChange={setFrom} kinds={["checking", "allowance", "reserve"]} />
      <FormLabel>Data do pagamento</FormLabel>
      <DatePickerField value={date} onChange={setDate} />
      {error ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Btn label="Registrar pagamento" onPress={handlePay} loading={loading} />
    </ScrollView>
  );
}
