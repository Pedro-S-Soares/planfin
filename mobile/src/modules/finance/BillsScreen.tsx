import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button } from "../../components/ui/Button";
import { Block } from "../../components/ui/Block";
import { Chip } from "../../components/ui/Chip";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import { useBillOccurrencesQuery, useUnpayBillMutation, useUnskipBillMutation } from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { BillRow } from "./components/BillRow";
import { InstallmentsDueCard } from "./components/InstallmentsDueCard";
import { useFinancialAccounts } from "./use-financial-accounts";
import { useInstallmentsDue } from "./use-installments-due";
import { addMonths, formatMoney, formatMonth, monthOf, toNumber, accountKindIcon } from "./format";
import type { AppStackParamList } from "../../../App";
import { palette } from "../../theme";
import { Text } from "../../components/ui/Text";
import { MonthStepper } from "../../components/ui/MonthStepper";
import { EntrySheet } from "../history/components/EntrySheet";
import { CLOSED_SHEET, createEntryStateWith, type EntrySheetState } from "../history/entry-sheet";
import { MONEY_QUERIES } from "../../lib/money-queries";

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
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);
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
  const [unpayBill] = useUnpayBillMutation({ refetchQueries: MONEY_QUERIES });
  const [unskipBill] = useUnskipBillMutation({ refetchQueries: MONEY_QUERIES });

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
    <ScrollView style={{ flex: 1, backgroundColor: palette.paper }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <MonthStepper
        size="title"
        label={formatMonth(month)}
        onPrevious={() => setMonth((m) => addMonths(m, -1))}
        onNext={() => setMonth((m) => addMonths(m, 1))}
      />

      <Block padding={16} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>Total do mês</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.ink }}>{formatMoney(total, currency.symbol)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>Falta pagar</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.ink }}>{formatMoney(total - paid, currency.symbol)}</Text>
          </View>
        </View>
      </Block>

      {accounts.length > 1 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <Chip label="Todas" selected={accountFilter === null} onPress={() => setAccountFilter(null)} />
          {accounts.map((a) => (
            <Chip
              key={a.id}
              label={a.name}
              icon={accountKindIcon(a.kind)}
              selected={accountFilter === a.id}
              onPress={() => setAccountFilter(accountFilter === a.id ? null : a.id)}
            />
          ))}
        </View>
      ) : null}

      <Block padding={16} style={{ marginBottom: 12 }}>
        {loading && !data ? (
          <ActivityIndicator color={palette.accent} />
        ) : error ? (
          <InlineError onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <Text style={{ color: palette.muted, textAlign: "center", paddingVertical: 12 }}>
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
                card={cards.find((c) => c.id === bill.account?.id)}
                onEdit={() => navigation.navigate("BillForm", { billId })}
                onPay={() =>
                  navigation.navigate("PayBill", {
                    billId,
                    month,
                    amount: o.amount ?? "0",
                    name: bill.name ?? "",
                    isCard,
                    isIncome: bill.direction === "income",
                    isPlanned: !!bill.noDueDay,
                    cardId: isCard ? bill.account?.id ?? undefined : undefined,
                  })
                }
                onAddPurchase={() =>
                  setSheet(
                    createEntryStateWith({
                      accountId: bill.account?.id ?? undefined,
                      categoryId: bill.subcategory?.categoryId ?? undefined,
                      subcategoryId: bill.subcategory?.id ?? undefined,
                      quotaId: bill.kind === "quota" ? billId : undefined,
                    }),
                  )
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
            <Text style={{ fontSize: 13, fontWeight: "700", color: palette.muted }}>
              Total {filterName ? `em ${filterName}` : "das despesas"} ({active.length})
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "800", color: palette.ink }}>{formatMoney(billsTotal, currency.symbol)}</Text>
          </View>
        ) : null}
      </Block>

      <InstallmentsDueCard
        invoices={installmentInvoices}
        cardNames={cardNames}
        loading={installments.loading}
        hasError={Boolean(installments.error)}
        onRetry={() => refetchInstallments()}
      />

      <Text style={{ fontSize: 12, color: palette.muted, marginBottom: 12, lineHeight: 17 }}>
        Toque no nome para editar ou excluir. As despesas no cartão entram sozinhas na fatura no dia; as da conta
        você marca como pagas.
      </Text>
      <Button label="+ Novo item" onPress={() => navigation.navigate("BillForm", {})} />
      <EntrySheet
        state={sheet}
        onClose={() => setSheet(CLOSED_SHEET)}
        onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
      />
    </ScrollView>
  );
}
