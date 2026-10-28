import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { useBillOccurrencesQuery, useUnpayBillMutation, useUnskipBillMutation } from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { BillRow } from "./components/BillRow";
import { InstallmentsDueCard } from "./components/InstallmentsDueCard";
import { useFinancialAccounts } from "./use-financial-accounts";
import { useInstallmentsDue } from "./use-installments-due";
import { addMonths, formatMoney, formatMonth, monthOf, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;
type Occurrence = NonNullable<NonNullable<ReturnType<typeof useBillOccurrencesQuery>["data"]>["billOccurrences"]>[number];

/** Occurrences that no longer need any action this month. */
const SETTLED = ["paid", "before_start"];

/** A running quota is planned at its full value, or at what was spent when it went over. */
function plannedAmount(o: NonNullable<Occurrence>) {
  if (o.bill?.kind !== "quota") return toNumber(o.amount);
  if (o.status === "paid") return toNumber(o.amount);
  return Math.max(toNumber(o.bill.amount), toNumber(o.quotaSpent));
}

function settledAmount(o: NonNullable<Occurrence>) {
  if (o.bill?.kind === "quota") return toNumber(o.quotaSpent);
  return SETTLED.includes(o.status ?? "") ? toNumber(o.amount) : 0;
}

type AccountOption = { id: string; name: string; kind: string };

/** Accounts with a bill this month, plus the cards with installments due in it. */
function uniqueAccounts(items: NonNullable<Occurrence>[], installmentCards: AccountOption[]) {
  const byId = new Map<string, AccountOption>();
  for (const o of items) {
    const a = o.bill?.account;
    if (a?.id && !byId.has(a.id)) byId.set(a.id, { id: a.id, name: a.name ?? "", kind: a.kind ?? "" });
  }
  for (const card of installmentCards) {
    if (!byId.has(card.id)) byId.set(card.id, card);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}


export function BillsScreen() {
  usePageTitle("Planfin - Fixas, avulsas e entradas");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "Bills">>();
  const { currency } = useCurrency();
  const [month, setMonth] = useState(params?.month || monthOf(new Date()));
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const { cards } = useFinancialAccounts();
  const installments = useInstallmentsDue(month);
  const refetchInstallments = installments.refetch;

  const { data, loading, error, refetch } = useBillOccurrencesQuery({
    variables: { month, today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });
  const [unpayBill] = useUnpayBillMutation({ refetchQueries: ["BillOccurrences", "FinancePanel", "FinancialAccounts"] });
  const [unskipBill] = useUnskipBillMutation({ refetchQueries: ["BillOccurrences", "FinancePanel", "MonthPlan", "AllowancePlan"] });

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchInstallments();
    }, [refetch, refetchInstallments]),
  );

  const allItems = data?.billOccurrences?.filter((o) => o !== null) ?? [];
  const cardNames = new Map(cards.map((c) => [c.id, c.name]));
  const installmentCards = installments.invoices.map((invoice) => ({
    id: invoice.cardId,
    name: cardNames.get(invoice.cardId) ?? "Cartão",
    kind: "credit_card",
  }));
  const accounts = uniqueAccounts(allItems, installmentCards);
  const items = accountFilter ? allItems.filter((o) => o.bill?.account?.id === accountFilter) : allItems;
  const installmentInvoices = accountFilter
    ? installments.invoices.filter((invoice) => invoice.cardId === accountFilter)
    : installments.invoices;
  const active = items.filter((o) => o.status !== "skipped" && o.bill?.direction !== "income");
  const billsTotal = active.reduce((acc, o) => acc + plannedAmount(o), 0);
  const installmentsTotal = installmentInvoices.reduce((acc, invoice) => acc + invoice.total, 0);
  // Installments are settled when their invoice is paid.
  const installmentsPaid = installmentInvoices.reduce((acc, invoice) => acc + (invoice.isPaid ? invoice.total : 0), 0);
  const total = billsTotal + installmentsTotal;
  const paid = active.reduce((acc, o) => acc + settledAmount(o), 0) + installmentsPaid;
  const filterName = accounts.find((a) => a.id === accountFilter)?.name;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setMonth((m) => addMonths(m, -1))} hitSlop={12}>
          <Text style={{ fontSize: 22, color: Colors.primary }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "800", color: Colors.text }}>{formatMonth(month)}</Text>
        <TouchableOpacity onPress={() => setMonth((m) => addMonths(m, 1))} hitSlop={12}>
          <Text style={{ fontSize: 22, color: Colors.primary }}>›</Text>
        </TouchableOpacity>
      </View>

      <Card padding={16} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec }}>TOTAL DO MÊS</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.text }}>{formatMoney(total, currency.symbol)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec }}>FALTA PAGAR</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.text }}>{formatMoney(total - paid, currency.symbol)}</Text>
          </View>
        </View>
      </Card>

      {accounts.length > 1 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <Chip label="Todas" selected={accountFilter === null} onPress={() => setAccountFilter(null)} />
          {accounts.map((a) => (
            <Chip
              key={a.id}
              label={`${a.kind === "credit_card" ? "💳" : "🏦"} ${a.name}`}
              selected={accountFilter === a.id}
              onPress={() => setAccountFilter(accountFilter === a.id ? null : a.id)}
            />
          ))}
        </View>
      ) : null}

      <Card padding={16} style={{ marginBottom: 12 }}>
        {loading && !data ? (
          <ActivityIndicator color={Colors.primary} />
        ) : error ? (
          <InlineError onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <Text style={{ color: Colors.textTer, textAlign: "center", paddingVertical: 12 }}>
            {accountFilter
              ? `Nenhuma despesa fixa em ${filterName ?? "esta conta"}.`
              : "Nenhuma despesa fixa ainda. Cadastre aluguel, contas e assinaturas."}
          </Text>
        ) : (
          items.map((o) => {
            const bill = o.bill;
            if (!bill?.id) return null;
            const billId = bill.id;
            const isCard = bill.account?.kind === "credit_card";
            return (
              <BillRow
                key={billId}
                occurrence={o}
                onEdit={() => navigation.navigate("BillForm", { billId })}
                onPay={() =>
                  navigation.navigate("PayBill", {
                    billId,
                    month,
                    amount: o.amount ?? "0",
                    name: bill.name ?? "",
                    isCard,
                    isIncome: bill.direction === "income",
                  })
                }
                onAddPurchase={() =>
                  navigation.navigate("AddExpense", {
                    accountId: bill.account?.id ?? undefined,
                    categoryId: bill.subcategory?.categoryId ?? undefined,
                    subcategoryId: bill.subcategory?.id ?? undefined,
                  })
                }
                onSkip={() => navigation.navigate("SkipBill", { billId, month, name: bill.name ?? "", isCard })}
                onUnskip={() => unskipBill({ variables: { billId, month } })}
                onUndo={() =>
                  confirm(
                    isCard
                      ? {
                          title: "Tirar da fatura",
                          message: `A cobrança de ${formatMonth(month)} sai da fatura e o mês fica pulado. Toque em Voltar para cobrar de novo.`,
                          confirmLabel: "Tirar",
                          destructive: true,
                        }
                      : {
                          title: "Desfazer pagamento",
                          message: "O lançamento criado no pagamento será apagado.",
                          confirmLabel: "Desfazer",
                          destructive: true,
                        },
                    () => unpayBill({ variables: { billId, month } }),
                  )
                }
              />
            );
          })
        )}
        {active.length > 0 ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSec }}>
              Total {filterName ? `em ${filterName}` : "das despesas"} ({active.length})
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>{formatMoney(billsTotal, currency.symbol)}</Text>
          </View>
        ) : null}
      </Card>

      <InstallmentsDueCard
        invoices={installmentInvoices}
        cardNames={cardNames}
        loading={installments.loading}
        hasError={Boolean(installments.error)}
        onRetry={() => refetchInstallments()}
      />

      <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 12, lineHeight: 17 }}>
        Toque no nome para editar ou excluir. As despesas no cartão entram sozinhas na fatura no dia; as da conta
        você marca como pagas.
      </Text>
      <Btn label="+ Novo item" onPress={() => navigation.navigate("BillForm", {})} />
    </ScrollView>
  );
}
