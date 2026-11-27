import { useState } from "react";
import { ScrollView } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { DatePickerField } from "../../components/DatePickerField";
import { Button } from "../../components/ui/Button";
import { usePayInvoiceMutation } from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AccountPicker } from "./components/AccountPicker";
import { FormLabel } from "./components/FormLabel";
import { toNumber } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";
import { invoiceMonthLabel } from "./invoice-label";
import type { AppStackParamList } from "../../../App";
import { palette } from "../../theme";
import { Text } from "../../components/ui/Text";
import { MONEY_QUERIES } from "../../lib/money-queries";

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
    refetchQueries: MONEY_QUERIES,
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
    <ScrollView style={{ flex: 1, backgroundColor: palette.sheet }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 14, color: palette.muted, marginBottom: 16 }}>Fatura de {invoiceMonthLabel(params.month, accounts.find((a) => a.id === params.cardId))}</Text>
      <FormLabel>Valor pago</FormLabel>
      <CurrencyInput value={amount} onChange={setAmount} autoFocus />
      <AccountPicker label="Pago com" accounts={accounts} value={from} onChange={setFrom} kinds={["checking", "allowance", "reserve"]} />
      <FormLabel>Data do pagamento</FormLabel>
      <DatePickerField value={date} onChange={setDate} />
      {error ? <Text style={{ color: palette.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Button label="Registrar pagamento" onPress={handlePay} isLoading={loading} />
    </ScrollView>
  );
}
