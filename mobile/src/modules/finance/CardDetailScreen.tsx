import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DatePickerField } from "../../components/DatePickerField";
import { Button } from "../../components/ui/Button";
import { Block } from "../../components/ui/Block";
import { InlineError } from "../../components/ui/InlineError";
import { usePeriod } from "../../context/PeriodContext";
import { useAssignEntriesToAccountMutation, useInvoicesQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { InvoiceHistory } from "./components/InvoiceHistory";
import { InvoiceRow } from "./components/InvoiceRow";
import { toNumber } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";
import { palette } from "../../theme";
import { Text } from "../../components/ui/Text";
import { EntrySheet } from "../history/components/EntrySheet";
import { CLOSED_SHEET, createEntryStateWith, type EntrySheetState } from "../history/entry-sheet";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function CardDetailScreen() {
  usePageTitle("Planfin - Cartão");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "CardDetail">>();
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);
  const { cards } = useFinancialAccounts();
  const card = cards.find((c) => c.id === params.cardId) ?? null;
  const { period } = usePeriod();
  const [fromDate, setFromDate] = useState(period?.startDate ?? toISODate(new Date()));

  const { data, loading, error, refetch } = useInvoicesQuery({
    variables: { cardId: params.cardId, today: toISODate(new Date()), past: 6 },
    fetchPolicy: "cache-and-network",
  });
  const [assignEntries, { loading: assigning }] = useAssignEntriesToAccountMutation({
    refetchQueries: ["Invoices", "Invoice", "FinancialAccounts"],
    onError: () => undefined, // o toast global avisa o erro
  });

  // Months before the card had any purchase only add noise.
  const fetched = data?.invoices?.filter((i) => i !== null) ?? [];
  const firstUsed = fetched.findIndex((i) => i.status !== "empty");
  const allInvoices = firstUsed === -1 ? [] : fetched.slice(firstUsed);
  const invoices = [...allInvoices].reverse();
  const openIndex = allInvoices.findIndex((i) => i.status === "open");
  const history = allInvoices
    .slice(0, openIndex === -1 ? allInvoices.length : openIndex + 1)
    .map((i) => ({ month: i.month ?? "", total: toNumber(i.total), status: i.status ?? "" }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.paper }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {card ? (
        <Text style={{ fontSize: 13, color: palette.muted, marginBottom: 10 }}>
          {card.name} · fecha dia {card.closingDay} · vence dia {card.dueDay}
        </Text>
      ) : null}

      {history.length > 0 ? <InvoiceHistory cardId={params.cardId} goal={card?.invoiceGoal} invoices={history} /> : null}

      <Block padding={16} style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>Faturas</Text>
        {loading && !data ? (
          <ActivityIndicator color={palette.accent} style={{ marginVertical: 16 }} />
        ) : error ? (
          <InlineError onRetry={() => refetch()} />
        ) : (
          invoices.map((inv) => (
            <InvoiceRow
              key={inv.month ?? ""}
              month={inv.month ?? ""}
              total={inv.total}
              dueDate={inv.dueDate}
              status={inv.status}
              onPress={() => navigation.navigate("Invoice", { cardId: params.cardId, month: inv.month ?? "" })}
            />
          ))
        )}
      </Block>

      <Button
        label="Lançar compra antiga ou ajuste na fatura"
        variant="secondary"
        onPress={() => setSheet(createEntryStateWith({ accountId: params.cardId, outsideBudget: true }))}
      />

      <Block padding={16} style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: palette.ink }}>Trazer gastos já lançados</Text>
        <Text style={{ fontSize: 13, color: palette.muted, marginTop: 4, marginBottom: 12, lineHeight: 18 }}>
          Os gastos registrados antes de você cadastrar o cartão estão sem conta. Escolha a partir de quando eles foram
          no cartão e o app coloca todos na fatura certa.
        </Text>
        <DatePickerField value={fromDate} onChange={setFromDate} />
        <Button
          label="Mover para este cartão"
          size="sm"
          variant="secondary"
          isLoading={assigning}
          onPress={() => assignEntries({ variables: { accountId: params.cardId, fromDate } })}
        />
      </Block>

      <View style={{ marginTop: 12 }}>
        <Button label="Editar cartão" size="sm" variant="secondary" onPress={() => navigation.navigate("AccountForm", { accountId: params.cardId })} />
      </View>
      <EntrySheet
        state={sheet}
        onClose={() => setSheet(CLOSED_SHEET)}
        onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
      />
    </ScrollView>
  );
}
