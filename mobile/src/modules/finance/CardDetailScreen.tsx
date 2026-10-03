import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DatePickerField } from "../../components/DatePickerField";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { usePeriod } from "../../context/PeriodContext";
import { useAssignEntriesToAccountMutation, useInvoicesQuery } from "../../graphql/__generated__/hooks";
import { alertWeb } from "../../lib/alert";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { InvoiceRow } from "./components/InvoiceRow";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function CardDetailScreen() {
  usePageTitle("Planfin - Cartão");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "CardDetail">>();
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
    onCompleted: (d) => alertWeb("Pronto", `${d.assignEntriesToAccount ?? 0} lançamentos foram para o cartão.`),
    onError: (e) => alertWeb("Erro", e.message),
  });

  const invoices = [...(data?.invoices?.filter((i) => i !== null) ?? [])].reverse();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {card ? (
        <Text style={{ fontSize: 13, color: Colors.textSec, marginBottom: 10 }}>
          {card.name} · fecha dia {card.closingDay} · vence dia {card.dueDay}
        </Text>
      ) : null}

      <Card padding={16} style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>FATURAS</Text>
        {loading && !data ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
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
      </Card>

      <Btn
        label="Lançar compra antiga ou ajuste na fatura"
        variant="ghost"
        onPress={() => navigation.navigate("AddExpense", { accountId: params.cardId, outsideBudget: true })}
      />

      <Card padding={16} style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>Trazer gastos já lançados</Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4, marginBottom: 12, lineHeight: 18 }}>
          Os gastos registrados antes de você cadastrar o cartão estão sem conta. Escolha a partir de quando eles foram
          no cartão e o app coloca todos na fatura certa.
        </Text>
        <DatePickerField value={fromDate} onChange={setFromDate} />
        <Btn
          label="Mover para este cartão"
          size="sm"
          variant="secondary"
          loading={assigning}
          onPress={() => assignEntries({ variables: { accountId: params.cardId, fromDate } })}
        />
      </Card>

      <View style={{ marginTop: 12 }}>
        <Btn label="Editar cartão" size="sm" variant="ghost" onPress={() => navigation.navigate("AccountForm", { accountId: params.cardId })} />
      </View>
    </ScrollView>
  );
}
