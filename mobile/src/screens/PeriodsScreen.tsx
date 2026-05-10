import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GROUP_PERIODS, type GroupPeriod } from "../graphql/groups";
import { usePeriod } from "../context/PeriodContext";
import { Card } from "../components/ui/Card";
import { Colors, Radius } from "../theme/tokens";
import { formatDateBR } from "../lib/date";
import type { AppStackParamList } from "../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

type GroupPeriodsData = {
  groupPeriods: GroupPeriod[];
};

function formatMoney(value: string | null | undefined): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return "R$ " + num.toFixed(2).replace(".", ",");
}

function PeriodStatusChip({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <View style={[styles.chip, isActive ? styles.chipActive : styles.chipClosed]}>
      <View style={[styles.chipDot, isActive ? styles.chipDotActive : styles.chipDotClosed]} />
      <Text style={[styles.chipLabel, isActive ? styles.chipLabelActive : styles.chipLabelClosed]}>
        {isActive ? "Ativo" : "Encerrado"}
      </Text>
    </View>
  );
}

function PeriodRow({ item, isSelected, onSelect }: { item: GroupPeriod; isSelected: boolean; onSelect: () => void }) {
  const dateRange = `${formatDateBR(item.startDate)} → ${formatDateBR(item.endDate)}`;
  const title = item.name?.trim() ? item.name : dateRange;
  const subtitle = item.name?.trim() ? dateRange : null;

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.75}>
    <Card padding={0} style={StyleSheet.flatten(isSelected ? [styles.row, styles.rowSelected] : [styles.row])}>
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
              <Text style={styles.metricValue}>{formatMoney(item.dailyLimit)}</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Saldo disponível</Text>
              <Text style={[styles.metricValue, item.availableBalance && parseFloat(item.availableBalance) < 0 ? styles.metricValueDanger : null]}>
                {formatMoney(item.availableBalance)}
              </Text>
            </View>
          </View>
          {isSelected && (
            <Text style={styles.selectedLabel}>Em foco na Home</Text>
          )}
        </View>
      </View>
    </Card>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Planejamentos</Text>
          <Text style={styles.headerSubtitle}>Histórico de períodos do grupo</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreatePeriod")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {loading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
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
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
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
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === "ios" ? 62 : 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  backBtnText: {
    color: Colors.primary,
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
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSec,
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
    color: Colors.danger,
    textAlign: "center",
    marginBottom: 12,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primaryText,
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
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSec,
    textAlign: "center",
  },
  row: {
    overflow: "hidden",
  },
  rowSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
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
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSec,
    marginBottom: 4,
  },
  rowMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radius.sm,
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
    backgroundColor: Colors.border,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSec,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  metricValueDanger: {
    color: Colors.danger,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    color: "#fff",
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
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: "#E8FBF2",
    borderColor: "#0EAD70",
  },
  chipClosed: {
    backgroundColor: Colors.bg,
    borderColor: Colors.border,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipDotActive: {
    backgroundColor: "#0EAD70",
  },
  chipDotClosed: {
    backgroundColor: Colors.textTer,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  chipLabelActive: {
    color: "#0A7A50",
  },
  chipLabelClosed: {
    color: Colors.textSec,
  },
});
