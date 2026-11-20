import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useQuery } from "@apollo/client/react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GROUP_PERIODS, type GroupPeriod } from "../graphql/groups";
import { usePeriod } from "../context/PeriodContext";
import { Block } from "../components/ui/Block";
import { formatDateBR } from "../lib/date";
import { formatMoney } from "../lib/money";
import { useCurrency } from "../context/CurrencyContext";
import type { AppStackParamList } from "../../App";
import { palette, radius, shadow } from "../theme";
import { Text } from "../components/ui/Text";
import { Icon } from "../components/ui/Icon";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

type GroupPeriodsData = {
  groupPeriods: GroupPeriod[];
};

/** Planned amounts of a period; "—" when it was never set. */
function formatPlanned(value: string | null | undefined, symbol: string): string {
  if (!value || Number.isNaN(parseFloat(value))) return "—";
  return formatMoney(value, symbol);
}

function PeriodStatusChip({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <View style={[styles.chip, isActive ? styles.chipActive : styles.chipClosed]}>
      <View style={[styles.chipDot, isActive ? styles.chipDotActive : styles.chipDotClosed]} />
      <Text style={[styles.chipLabel, isActive ? styles.chipLabelActive : styles.chipLabelClosed]}>
        {isActive ? "Ativo" : status === "scheduled" ? "Agendado" : "Encerrado"}
      </Text>
    </View>
  );
}

function PeriodRow({ item, isSelected, onSelect }: { item: GroupPeriod; isSelected: boolean; onSelect: () => void }) {
  const dateRange = `${formatDateBR(item.startDate)} → ${formatDateBR(item.endDate)}`;
  const title = item.name?.trim() ? item.name : dateRange;
  const subtitle = item.name?.trim() ? dateRange : null;
  const { currency } = useCurrency();

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.75}>
    <Block padding={0} style={StyleSheet.flatten(isSelected ? [styles.row, styles.rowSelected] : [styles.row])}>
      <View style={styles.rowInner}>
        {/* Left: title + subtitle + date range */}
        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
            <PeriodStatusChip status={item.status} />
          </View>
          {subtitle ? (
            <Text style={styles.rowSubtitle}>{subtitle}</Text>
          ) : null}
          <View style={styles.rowMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Limite diário</Text>
              <Text style={styles.metricValue}>{formatPlanned(item.dailyLimit, currency.symbol)}</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Saldo disponível</Text>
              <Text style={[styles.metricValue, item.availableBalance && parseFloat(item.availableBalance) < 0 ? styles.metricValueDanger : null]}>
                {formatPlanned(item.availableBalance, currency.symbol)}
              </Text>
            </View>
          </View>
          {isSelected && (
            <Text style={styles.selectedLabel}>Em foco na Home</Text>
          )}
        </View>
      </View>
    </Block>
    </TouchableOpacity>
  );
}

export function PeriodsScreen() {
  const navigation = useNavigation<Navigation>();
  const { selectedPeriodId, setSelectedPeriod } = usePeriod();
  const { data, loading, error, refetch, networkStatus } = useQuery<GroupPeriodsData>(
    GROUP_PERIODS,
    { notifyOnNetworkStatusChange: true, fetchPolicy: "cache-and-network" }
  );

  const isRefetching = networkStatus === 4;
  const periods = data?.groupPeriods ?? [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreatePeriod")}
        activeOpacity={0.85}
      >
        <Icon name="plus" size={26} tone="onAccent" />
      </TouchableOpacity>

      {loading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Erro ao carregar períodos</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<GroupPeriod>
          data={periods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PeriodRow
              item={item}
              isSelected={item.id === selectedPeriodId}
              onSelect={() => { setSelectedPeriod(item.id); navigation.goBack(); }}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={palette.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="calendar-blank-outline" size={40} />
              <Text style={styles.emptyTitle}>Nenhum planejamento encontrado</Text>
              <Text style={styles.emptySubtitle}>Os períodos criados aparecerão aqui.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.sheet,
  },
  header: {
    backgroundColor: palette.paper,
    paddingTop: Platform.OS === "ios" ? 62 : 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: palette.rule,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.sheet,
    borderWidth: 1,
    borderColor: palette.rule,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  backBtnText: {
    color: palette.accent,
    fontSize: 20,
    lineHeight: 22,
    marginLeft: -2,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: palette.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 4,
    lineHeight: 20,
  },
  list: {
    padding: 16,
    paddingTop: 20,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 15,
    color: palette.danger,
    textAlign: "center",
    marginBottom: 12,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: radius.control,
    backgroundColor: palette.accentSoft,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.accent,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.ink,
  },
  emptySubtitle: {
    fontSize: 13,
    color: palette.muted,
    textAlign: "center",
  },
  row: {
    overflow: "hidden",
  },
  rowSelected: {
    borderWidth: 2,
    borderColor: palette.accent,
  },
  selectedLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: palette.accent,
    letterSpacing: 0.3,
  },
  rowInner: {
    padding: 16,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: palette.ink,
  },
  rowSubtitle: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 4,
  },
  rowMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: palette.paper,
    borderRadius: radius.control,
    padding: 10,
    gap: 0,
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricSep: {
    width: 1,
    height: 28,
    backgroundColor: palette.rule,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.muted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.ink,
  },
  metricValueDanger: {
    color: palette.danger,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...shadow.floating,
  },
  fabIcon: {
    color: palette.onAccent,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "400",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: palette.incomeSoft,
    borderColor: palette.income,
  },
  chipClosed: {
    backgroundColor: palette.paper,
    borderColor: palette.rule,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipDotActive: {
    backgroundColor: palette.income,
  },
  chipDotClosed: {
    backgroundColor: palette.muted,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  chipLabelActive: {
    color: palette.income,
  },
  chipLabelClosed: {
    color: palette.muted,
  },
});
