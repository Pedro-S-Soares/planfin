import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { DatePickerField } from "../../components/DatePickerField";
import { Btn } from "../../components/ui/Btn";
import { usePayBillMutation } from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { FormLabel } from "./components/FormLabel";
import { formatMonth, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

export function PayBillScreen() {
  usePageTitle("Planfin - Pagar despesa fixa");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "PayBill">>();
  const [amount, setAmount] = useState(formatCents(Math.round(toNumber(params.amount) * 100)));
  const [date, setDate] = useState(toISODate(new Date()));
  const [error, setError] = useState<string | null>(null);

  const [payBill, { loading }] = usePayBillMutation({
    refetchQueries: ["BillOccurrences", "FinancePanel", "FinancialAccounts", "Invoices", "Invoice", "AccountMovements"],
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  const handlePay = () => {
    if (parseCents(amount) === 0) return setError("Informe o valor");
    payBill({ variables: { billId: params.billId, month: params.month, amount: displayToAPI(amount), date } });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{params.name}</Text>
      <Text style={{ fontSize: 13, color: Colors.textSec, marginBottom: 18 }}>
        {formatMonth(params.month)} ·{" "}
        {params.isCard ? "vai para a fatura do cartão" : "sai do saldo da conta"} · não mexe no limite diário
      </Text>
      <FormLabel>Valor real</FormLabel>
      <CurrencyInput value={amount} onChange={setAmount} autoFocus />
      <FormLabel>{params.isCard ? "Data da cobrança" : "Data do pagamento"}</FormLabel>
      <DatePickerField value={date} onChange={setDate} />
      {error ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Btn label={params.isCard ? "Lançar na fatura agora" : "Registrar pagamento"} onPress={handlePay} loading={loading} />
    </ScrollView>
  );
}
