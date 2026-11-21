import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useQuery } from "@apollo/client/react";
import { usePeriod } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import { formatPeriodMonths } from "../lib/date";
import {
  EXPENSE_HISTORY_WITH_AUTHORS,
  type ExpenseDayWithAuthors,
  type ExpenseWithAuthor,
} from "../graphql/expenses";
import { ListBlock } from "../components/ui/Block";
import { Button } from "../components/ui/Button";
import { DayHeader } from "../components/ui/DayHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { ExpenseRow } from "../components/ui/ExpenseRow";
import { InlineError } from "../components/ui/InlineError";
import { PlusIcon } from "../components/ui/PlusIcon";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { layout, palette, space } from "../theme";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSessionState } from "../lib/session-state";
import { useFilterCategories } from "../modules/history/use-filter-categories";
import {
  categoryEntryPresets,
  categoryFilterLabel,
  isCategoryFilterActive,
  type CategoryFilter,
} from "../modules/history/category-filter";
import type { MainTabParamList } from "../../App";
import { useFinancialAccounts } from "../modules/finance/use-financial-accounts";
import {
  DEFAULT_HISTORY_FILTERS,
  filterHistory,
  hasActiveFilters,
  summarizeHistory,
  categoryFilterTotal,
  type HistoryFilters,
} from "../modules/history/history-filters";
import { HistoryFilterBar } from "../modules/history/components/HistoryFilterBar";
import { HistorySummaryCard } from "../modules/history/components/HistorySummaryCard";
import { TransferRow } from "../modules/history/components/TransferRow";
import { EntrySheet } from "../modules/history/components/EntrySheet";
import {
  CLOSED_SHEET,
  createEntryState,
  defaultEntryDate,
  editEntryState,
  type EntrySheetState,
} from "../modules/history/entry-sheet";

type ExpenseHistoryData = { expenseHistory: ExpenseDayWithAuthors[] };

function authorLabel(author: ExpenseWithAuthor["createdBy"], currentUserId?: string) {
  if (!author) return null;
  if (currentUserId && author.id === currentUserId) return "Você";
  return author.email.split("@")[0];
}

export function HistoryScreen() {
  usePageTitle("Planfin - Histórico");
  const { period, refetch: refetchPeriod } = usePeriod();
  const { user } = useAuth();
  const { accounts } = useFinancialAccounts();
  const [filters, setFilters] = useSessionState<HistoryFilters>("history-filters", DEFAULT_HISTORY_FILTERS);
  const categories = useFilterCategories();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<MainTabParamList, "History">>();

  // Opened from a category of the Painel: show just that category (the other filters are dropped).
  const requestedCategory = params?.category;
  useEffect(() => {
    if (!requestedCategory) return;
    setFilters({ ...DEFAULT_HISTORY_FILTERS, category: requestedCategory });
    navigation.setParams({ category: undefined } as never);
  }, [requestedCategory, navigation, setFilters]);
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);

  const { data, loading, error, refetch } = useQuery<ExpenseHistoryData>(
    EXPENSE_HISTORY_WITH_AUTHORS,
    {
      variables: { periodId: period?.id ?? "" },
      skip: !period?.id,
      fetchPolicy: "network-only",
    },
  );

  useFocusEffect(
    useCallback(() => {
      refetchPeriod();
      if (period?.id) refetch();
    }, [refetchPeriod, refetch, period?.id]),
  );

  const rawDays = data?.expenseHistory;
  // Day totals are recomputed from what the filters leave visible, so they always match the list.
  const days = useMemo(() => filterHistory(rawDays ?? [], filters), [rawDays, filters]);
  const summary = useMemo(() => summarizeHistory(days), [days]);
  const accountFilter = filters.account;
  const filteredAccount = accountFilter.kind === "account"
    ? accounts.find((a) => a.id === accountFilter.id) ?? null
    : null;

  const periodLabel = formatPeriodMonths(period?.startDate, period?.endDate);
  const previewCategory = useCallback(
    (category: CategoryFilter) => {
      const preview = summarizeHistory(filterHistory(rawDays ?? [], { ...filters, category }));
      return { count: preview.count, total: categoryFilterTotal(preview) };
    },
    [rawDays, filters],
  );
  const categoryHeadline = isCategoryFilterActive(filters.category)
    ? { label: categoryFilterLabel(filters.category, categories), periodLabel }
    : null;

  // A new entry while filtered by one category starts in it.
  const openCreate = (date: string) => {
    const { type, ...presets } = categoryEntryPresets(filters.category, categories);
    const state = createEntryState(date, filters.account, type);
    setSheet(state.mode === "create" ? { ...state, params: { ...state.params, ...presets } } : state);
  };
  const closeSheet = () => setSheet(CLOSED_SHEET);
  const entrySheet = (
    <EntrySheet
      state={sheet}
      onClose={closeSheet}
      onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
    />
  );

  const header = (
    <ScreenHeader
      title="Histórico"
      subtitle={periodLabel ? `Período: ${periodLabel}` : null}
      action={
        period ? (
          <Button
            label="Lançar"
            size="sm"
            isFullWidth={false}
            leading={<PlusIcon />}
            accessibilityLabel="Lançar gasto ou receita"
            onPress={() => openCreate(defaultEntryDate(period.startDate, period.endDate))}
          />
        ) : null
      }
    />
  );

  const filterBar = (
    <HistoryFilterBar
      filters={filters}
      accounts={accounts}
      onChange={setFilters}
      categories={categories}
      previewCategory={previewCategory}
    />
  );

  // Only the first load replaces the list: refetches after a save keep it (and its scroll) on screen.
  if (loading && !data) {
    return (
      <View style={styles.root}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        {header}
        <View style={styles.errorBox}>
          <InlineError onRetry={refetch} />
        </View>
      </View>
    );
  }

  if (days.length === 0) {
    const isFiltered = hasActiveFilters(filters);
    return (
      <View style={styles.root}>
        {header}
        {filterBar}
        <View style={styles.center}>
          <EmptyState
            message={isFiltered ? "Nenhum lançamento com esses filtros." : "Nenhum lançamento neste período ainda."}
            action={
              isFiltered ? (
                <Button label="Limpar filtros" variant="secondary" isFullWidth={false} onPress={() => setFilters(DEFAULT_HISTORY_FILTERS)} />
              ) : period ? (
                <Button
                  label="Lançar"
                  isFullWidth={false}
                  leading={<PlusIcon />}
                  onPress={() => openCreate(defaultEntryDate(period.startDate, period.endDate))}
                />
              ) : null
            }
          />
        </View>
        {entrySheet}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {header}
      {filterBar}
      <FlatList
        data={days}
        keyExtractor={(day) => day.date}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <HistorySummaryCard summary={summary} account={filteredAccount} categoryHeadline={categoryHeadline} />
        }
        renderItem={({ item: day }) => (
          <View style={styles.day}>
            <DayHeader date={day.date} total={day.total} onAdd={() => openCreate(day.date)} />
            <ListBlock>
              {day.items.map((historyItem) => historyItem.kind === "transfer" ? (
                <TransferRow
                  key={`transfer-${historyItem.transfer.id}`}
                  transfer={historyItem.transfer}
                  signedAmount={historyItem.signedAmount}
                />
              ) : (
                <ExpenseRow
                  key={historyItem.entry.id}
                  item={historyItem.entry}
                  onPress={() => setSheet(editEntryState(historyItem.entry, day.date))}
                  authorLabel={authorLabel(historyItem.entry.createdBy, user?.id)}
                />
              ))}
            </ListBlock>
          </View>
        )}
      />
      {entrySheet}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    padding: layout.gutter,
  },
  list: {
    paddingVertical: layout.blockGap,
    paddingHorizontal: layout.gutter,
  },
  day: {
    marginBottom: space.xl,
  },
});
