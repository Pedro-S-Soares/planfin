import { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@apollo/client/react";
import { usePeriod } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { formatPeriodMonths, formatWeekdayDate } from "../lib/date";
import {
  EXPENSE_HISTORY_WITH_AUTHORS,
  type ExpenseDayWithAuthors,
  type ExpenseWithAuthor,
} from "../graphql/expenses";
import { Card } from "../components/ui/Card";
import { ExpenseRow } from "../components/ui/ExpenseRow";
import { InlineError } from "../components/ui/InlineError";
import { Colors } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatMoney } from "../modules/finance/format";
import { useFinancialAccounts } from "../modules/finance/use-financial-accounts";
import {
  DEFAULT_HISTORY_FILTERS,
  filterHistory,
  hasActiveFilters,
  summarizeHistory,
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

function dayTotalColor(total: number) {
  return total > 0 ? Colors.success : Colors.textSec;
}

function AddDayButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Lançar neste dia"
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{
        height: 26,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.primaryText }}>+ Lançar</Text>
    </TouchableOpacity>
  );
}

function authorLabel(author: ExpenseWithAuthor["createdBy"], currentUserId?: string) {
  if (!author) return null;
  if (currentUserId && author.id === currentUserId) return "Você";
  return author.email.split("@")[0];
}

export function HistoryScreen() {
  usePageTitle("Planfin - Histórico");
  const { period, refetch: refetchPeriod } = usePeriod();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { accounts } = useFinancialAccounts();
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_HISTORY_FILTERS);
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

  const openCreate = (date: string) => setSheet(createEntryState(date, filters.account));
  const closeSheet = () => setSheet(CLOSED_SHEET);
  const entrySheet = (
    <EntrySheet
      state={sheet}
      onClose={closeSheet}
      onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
    />
  );

  const header = (
    <View style={{
      backgroundColor: Colors.surface,
      paddingTop: Platform.OS === "ios" ? 58 : 24,
      paddingBottom: 14,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, letterSpacing: -0.4 }}>
            Histórico
          </Text>
          {periodLabel && (
            <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
              Período: {periodLabel}
            </Text>
          )}
        </View>
        {period ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => openCreate(defaultEntryDate(period.startDate, period.endDate))}
            style={{
              height: 40,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: Colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>+ Lançar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const filterBar = (
    <HistoryFilterBar filters={filters} accounts={accounts} onChange={setFilters} />
  );

  // Only the first load replaces the list: refetches after a save keep it (and its scroll) on screen.
  if (loading && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        <View style={{ padding: 16 }}>
          <InlineError onRetry={refetch} />
        </View>
      </View>
    );
  }

  if (days.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        {filterBar}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: Colors.textTer, fontSize: 15, textAlign: "center" }}>
            {hasActiveFilters(filters) ? "Nenhum lançamento com esses filtros." : "Nenhum gasto registrado ainda."}
          </Text>
        </View>
        {entrySheet}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {header}
      {filterBar}
      <FlatList
        data={days}
        keyExtractor={(day) => day.date}
        contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 16 }}
        ListHeaderComponent={
          <HistorySummaryCard summary={summary} account={filteredAccount} currencySymbol={currency.symbol} />
        }
        renderItem={({ item: day }) => (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingHorizontal: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>
                {formatWeekdayDate(day.date)}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 12, color: dayTotalColor(day.total), fontWeight: "600" }}>
                  Total: {formatMoney(day.total, currency.symbol, { sign: "flow" })}
                </Text>
                <AddDayButton onPress={() => openCreate(day.date)} />
              </View>
            </View>
            <Card padding={12}>
              {day.items.map((historyItem) => historyItem.kind === "transfer" ? (
                <TransferRow
                  key={`transfer-${historyItem.transfer.id}`}
                  transfer={historyItem.transfer}
                  signedAmount={historyItem.signedAmount}
                  currencySymbol={currency.symbol}
                />
              ) : (
                <ExpenseRow
                  key={historyItem.entry.id}
                  item={historyItem.entry}
                  onPress={() => setSheet(editEntryState(historyItem.entry, day.date))}
                  authorLabel={authorLabel(historyItem.entry.createdBy, user?.id)}
                />
              ))}
            </Card>
          </View>
        )}
      />
      {entrySheet}
    </View>
  );
}
