import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "../../components/ui/AppText";
import { Block, ListBlock } from "../../components/ui/Block";
import { Button } from "../../components/ui/Button";
import { DayHeader, SectionHeader } from "../../components/ui/DayHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { ExpenseRow } from "../../components/ui/ExpenseRow";
import { InlineError } from "../../components/ui/InlineError";
import { MoneyText } from "../../components/ui/MoneyText";
import { PlusIcon } from "../../components/ui/PlusIcon";
import { useInvoiceQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { layout, palette, space } from "../../theme";
import { AdjustInvoiceTotal } from "./components/AdjustInvoiceTotal";
import { StatusPill } from "./components/StatusPill";
import { groupInvoiceByDay } from "./invoice-days";
import { EntrySheet } from "../history/components/EntrySheet";
import { CLOSED_SHEET, createEntryState, editEntryState, type EntrySheetState } from "../history/entry-sheet";
import { formatMonth, formatShortDate, isInvoiceStatus, toNumber } from "./format";
import type { AppStackParamList } from "../../../App";
import { useSessionState } from "../../lib/session-state";
import { CategoryFilterRow } from "../history/components/CategoryFilterRow";
import { useFilterCategories } from "../history/use-filter-categories";
import {
  ALL_CATEGORIES,
  categoryEntryPresets,
  categoryFilterLabel,
  isCategoryFilterActive,
  matchesCategory,
  type CategoryFilter,
} from "../history/category-filter";

type InvoiceEntry = { amount?: string | null; type?: string | null };

/** What entries add to the invoice: purchases minus refunds. */
function invoiceSum(entries: InvoiceEntry[]): number {
  return entries.reduce((sum, e) => {
    const amount = parseFloat(e.amount ?? "0") || 0;
    return sum + (e.type === "income" ? -amount : amount);
  }, 0);
}

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function InvoiceScreen() {
  usePageTitle("Planfin - Fatura");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "Invoice">>();
  const { data, loading, error, refetch } = useInvoiceQuery({
    variables: { cardId: params.cardId, month: params.month, today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);
  const [categoryFilter, setCategoryFilter] = useSessionState<CategoryFilter>(`invoice-category-${params.cardId}`, ALL_CATEGORIES);
  const categories = useFilterCategories();

  if (loading && !data) return <ActivityIndicator color={palette.accent} style={styles.loading} />;
  if (error || !data?.invoice) {
    return (
      <View style={styles.errorBox}>
        <InlineError onRetry={() => refetch()} />
      </View>
    );
  }

  const invoice = data.invoice;
  const allEntries = invoice.entries?.filter((e) => e !== null) ?? [];
  const isFiltered = isCategoryFilterActive(categoryFilter);
  const entries = allEntries.filter((e) => matchesCategory(e, categoryFilter));
  const days = groupInvoiceByDay(entries, invoice.startDate ?? params.month);
  const previewCategory = (filter: CategoryFilter) => {
    const picked = allEntries.filter((e) => matchesCategory(e, filter));
    return { count: picked.length, total: invoiceSum(picked) };
  };
  // A new purchase while filtered by one category starts in it.
  const openCreate = (date: string) => {
    const { type, ...presets } = categoryEntryPresets(categoryFilter, categories);
    const state = createEntryState(date, { kind: "account", id: params.cardId }, type);
    setSheet(state.mode === "create" ? { ...state, params: { ...state.params, ...presets } } : state);
  };
  const canPay = toNumber(invoice.remaining) > 0;
  const isEarly = invoice.status === "open" || invoice.status === "upcoming";
  const addButton = (
    <Button
      label="Lançar"
      size="sm"
      variant="secondary"
      isFullWidth={false}
      leading={<PlusIcon tone="accent" />}
      accessibilityLabel="Lançar na fatura"
      onPress={() => openCreate(toISODate(new Date()))}
    />
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Block style={styles.summary}>
        <View style={styles.summaryTitle}>
          <AppText variant="label">Fatura de {formatMonth(invoice.month)}</AppText>
          {isInvoiceStatus(invoice.status) ? <StatusPill status={invoice.status} /> : null}
        </View>
        <MoneyText amount={invoice.total} variant="amount" style={styles.total} />
        <AppText variant="caption">
          Compras de {formatShortDate(invoice.startDate)} até a véspera de {formatShortDate(invoice.closingDate)} · vence{" "}
          {formatShortDate(invoice.dueDate)}
        </AppText>
        {toNumber(invoice.paid) > 0 ? (
          <View style={styles.paidRow}>
            <AppText variant="body" tone="income">Pago</AppText>
            <MoneyText amount={invoice.paid} variant="body" tone="income" />
            <AppText variant="body" tone="muted">· falta</AppText>
            <MoneyText amount={invoice.remaining} variant="label" />
          </View>
        ) : null}
        {invoice.status !== "paid" ? (
          <AdjustInvoiceTotal cardId={params.cardId} month={params.month} currentTotal={invoice.total} />
        ) : null}
        {canPay ? (
          <View style={styles.pay}>
            {isEarly ? (
              <AppText variant="caption">
                A fatura ainda está aberta. Pague o que já tem nela; compras feitas depois continuam entrando e
                ficam como saldo a pagar.
              </AppText>
            ) : null}
            <Button
              label={isEarly ? "Pagar antecipado" : "Pagar fatura"}
              onPress={() =>
                navigation.navigate("PayInvoice", { cardId: params.cardId, month: params.month, remaining: invoice.remaining ?? "0" })
              }
            />
          </View>
        ) : null}
      </Block>

      <SectionHeader title={isFiltered ? `Lançamentos (${entries.length} de ${allEntries.length})` : `Lançamentos (${entries.length})`} trailing={entries.length > 0 ? addButton : null} />
      {allEntries.length > 0 ? (
        <CategoryFilterRow value={categoryFilter} onChange={setCategoryFilter} categories={categories} preview={previewCategory} />
      ) : null}
      {isFiltered && entries.length > 0 ? (
        <Block style={styles.filterTotal}>
          <AppText variant="label" tone="muted" numberOfLines={2}>
            {categoryFilterLabel(categoryFilter, categories)} nesta fatura
          </AppText>
          <MoneyText amount={invoiceSum(entries)} variant="value" />
        </Block>
      ) : null}
      {entries.length === 0 ? (
        <Block>
          <EmptyState
            message={isFiltered ? "Nenhum lançamento desta categoria nesta fatura." : "Nenhum lançamento nesta fatura."}
            action={
              isFiltered ? (
                <Button label="Limpar filtro" variant="secondary" isFullWidth={false} onPress={() => setCategoryFilter(ALL_CATEGORIES)} />
              ) : (
                addButton
              )
            }
          />
        </Block>
      ) : (
        days.map((day) => (
          <View key={day.date} style={styles.day}>
            <DayHeader
              date={day.date}
              total={day.entries.length > 1 ? day.total : null}
              totalSign="auto"
              isTotalColored={false}
              onAdd={() => openCreate(day.date)}
            />
            <ListBlock>
              {day.entries.map((item) => {
                const entry = { ...item, id: item.id ?? "", amount: item.amount ?? "0" };
                return <ExpenseRow key={entry.id} item={entry} onPress={() => setSheet(editEntryState(entry, day.date))} />;
              })}
            </ListBlock>
          </View>
        ))
      )}
      <EntrySheet
        state={sheet}
        onClose={() => setSheet(CLOSED_SHEET)}
        onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  content: {
    padding: layout.gutter,
    paddingBottom: space.xxl,
  },
  loading: {
    marginTop: 40,
  },
  errorBox: {
    padding: layout.gutter,
  },
  summary: {
    marginBottom: space.xl,
  },
  summaryTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  total: {
    marginTop: space.xs,
    marginBottom: space.xs,
  },
  paidRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: space.xs,
    marginTop: space.sm,
  },
  pay: {
    marginTop: space.lg,
    gap: space.sm,
  },
  filterTotal: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.sm,
  },
  day: {
    marginTop: space.md,
    marginBottom: space.md,
  },
});
