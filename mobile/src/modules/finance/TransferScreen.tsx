import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { DatePickerField } from "../../components/DatePickerField";
import { Btn } from "../../components/ui/Btn";
import { FieldInput } from "../../components/ui/FieldInput";
import { useCreateTransferMutation } from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { AccountPicker } from "./components/AccountPicker";
import { FormLabel } from "./components/FormLabel";
import { toNumber } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

const MONEY_KINDS = ["checking", "allowance", "reserve"] as const;

export function TransferScreen() {
  usePageTitle("Planfin - Transferir");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "Transfer">>();
  const { accounts, primary } = useFinancialAccounts();
  const [fromId, setFromId] = useState<string | null | undefined>(params.fromAccountId);
  const [toId, setToId] = useState<string | null | undefined>(params.toAccountId);
  const [amount, setAmount] = useState(formatCents(Math.round(toNumber(params.amount) * 100)));
  const [date, setDate] = useState(toISODate(new Date()));
  const [note, setNote] = useState(params.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const from = fromId === undefined ? primary?.id ?? null : fromId;
  const to = toId ?? null;

  const [createTransfer, { loading }] = useCreateTransferMutation({
    refetchQueries: ["FinancialAccounts", "AccountMovements", "FinancePanel"],
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  const handleSave = () => {
    if (!from || !to) return setError("Escolha a conta de origem e a de destino");
    if (from === to) return setError("Origem e destino precisam ser diferentes");
    if (parseCents(amount) === 0) return setError("Informe um valor");
    createTransfer({
      variables: {
        fromAccountId: from,
        toAccountId: to,
        amount: displayToAPI(amount),
        date,
        kind: params.kind ?? "other",
        note: note.trim() || null,
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
      <FormLabel>Valor</FormLabel>
      <CurrencyInput value={amount} onChange={setAmount} autoFocus />
      <AccountPicker label="De" accounts={accounts} value={from} onChange={setFromId} kinds={[...MONEY_KINDS]} />
      <AccountPicker label="Para" accounts={accounts} value={to} onChange={setToId} kinds={[...MONEY_KINDS]} />
      <FormLabel>Data</FormLabel>
      <DatePickerField value={date} onChange={setDate} />
      <FieldInput label="Nota (opcional)" value={note} onChange={setNote} placeholder="Ex: guardar na reserva" />
      {error ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Btn label="Transferir" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}
