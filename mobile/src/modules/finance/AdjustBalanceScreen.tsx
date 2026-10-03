import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Btn } from "../../components/ui/Btn";
import { useCurrency } from "../../context/CurrencyContext";
import { useSetAccountBalanceMutation } from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { FormLabel } from "./components/FormLabel";
import { ToggleRow } from "./components/ToggleRow";
import { formatMoney, signedApiAmount, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

export function AdjustBalanceScreen() {
  usePageTitle("Planfin - Ajustar saldo");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "AdjustBalance">>();
  const { currency } = useCurrency();
  const current = toNumber(params.balance);
  const [value, setValue] = useState(formatCents(Math.round(Math.abs(current) * 100)));
  const [isNegative, setIsNegative] = useState(current < 0);
  const [error, setError] = useState<string | null>(null);

  const [setBalance, { loading }] = useSetAccountBalanceMutation({
    refetchQueries: ["FinancialAccounts", "AccountMovements"],
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  const handleSave = () => {
    setBalance({
      variables: {
        id: params.accountId,
        balance: signedApiAmount(displayToAPI(value), isNegative),
        today: toISODate(new Date()),
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 14, color: Colors.textSec, lineHeight: 20, marginBottom: 18 }}>
        Abra o app do banco e informe o saldo de agora. O app passa a contar a partir dele, sem mexer no histórico.
        Saldo calculado hoje: {formatMoney(current, currency.symbol)}.
      </Text>
      <FormLabel>Saldo no banco agora</FormLabel>
      <CurrencyInput value={value} onChange={setValue} autoFocus />
      <ToggleRow title="Saldo negativo" description="Ative se a conta está no cheque especial" value={isNegative} onChange={setIsNegative} />
      {error ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Btn label="Salvar saldo" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}
