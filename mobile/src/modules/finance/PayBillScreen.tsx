import { useState } from "react";
import { ScrollView } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { DatePickerField } from "../../components/DatePickerField";
import { Button } from "../../components/ui/Button";
import { usePayBillMutation } from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { FormLabel } from "./components/FormLabel";
import { formatMonth, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";
import { palette } from "../../theme";
import { Text } from "../../components/ui/Text";
import { MONEY_QUERIES } from "../../lib/money-queries";

export function PayBillScreen() {
  usePageTitle("Planfin - Pagar despesa fixa");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "PayBill">>();
  const [amount, setAmount] = useState(formatCents(Math.round(toNumber(params.amount) * 100)));
  const [date, setDate] = useState(toISODate(new Date()));
  const [error, setError] = useState<string | null>(null);

  const [payBill, { loading }] = usePayBillMutation({
    refetchQueries: MONEY_QUERIES,
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  const handlePay = () => {
    if (parseCents(amount) === 0) return setError("Informe o valor");
    payBill({ variables: { billId: params.billId, month: params.month, amount: displayToAPI(amount), date } });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.sheet }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: palette.ink }}>{params.name}</Text>
      <Text style={{ fontSize: 13, color: palette.muted, marginBottom: 18 }}>
        {formatMonth(params.month)} ·{" "}
        {params.isIncome ? "entra no saldo da conta" : params.isCard ? "vai para a fatura do cartão" : "sai do saldo da conta"} · não
        mexe no limite diário
      </Text>
      <FormLabel>Valor real</FormLabel>
      <CurrencyInput value={amount} onChange={setAmount} autoFocus />
      <FormLabel>
        {params.isIncome
          ? "Data em que entrou"
          : params.isPlanned && params.isCard
            ? "Data da compra"
            : params.isCard
              ? "Data da cobrança"
              : "Data do pagamento"}
      </FormLabel>
      <DatePickerField value={date} onChange={setDate} />
      {error ? <Text style={{ color: palette.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Button
        label={
          params.isIncome
            ? "Registrar recebimento"
            : params.isPlanned && params.isCard
              ? "Lançar compra"
              : params.isCard
                ? "Lançar na fatura agora"
                : "Registrar pagamento"
        }
        onPress={handlePay}
        isLoading={loading}
      />
    </ScrollView>
  );
}
