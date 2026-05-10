import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  ActionSheetIOS,
  Modal,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@apollo/client/react";
import { useLogoutMutation } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { toISODate } from "../lib/date";
import {
  EXPENSE_HISTORY_WITH_AUTHORS,
  type ExpenseDayWithAuthors,
  type ExpenseWithAuthor,
} from "../graphql/expenses";
import { BalanceCard } from "../components/ui/BalanceCard";
import { Card } from "../components/ui/Card";
import { ExpenseRow } from "../components/ui/ExpenseRow";
import { InlineError } from "../components/ui/InlineError";
import { Colors, Radius, Shadow } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";
import type { AppStackParamList } from "../../App";
import type { GroupPeriod } from "../context/PeriodContext";

type Navigation = NativeStackNavigationProp<AppStackParamList>;
type ExpenseHistoryData = { expenseHistory: ExpenseDayWithAuthors[] };

function authorLabel(author: ExpenseWithAuthor["createdBy"], currentUserId?: string) {
  if (!author) return null;
  if (currentUserId && author.id === currentUserId) return "Você";
  return author.email.split("@")[0];
}

function formatPeriodLabel(p: GroupPeriod): string {
  if (p.name) return p.name;
  if (!p.startDate || !p.endDate) return "Período";
  const start = p.startDate.slice(5, 7) + "/" + p.startDate.slice(0, 4);
  const end = p.endDate.slice(5, 7) + "/" + p.endDate.slice(0, 4);
  return `${start} – ${end}`;
}

// ─── Period Selector (Android fallback modal) ─────────────────────────────────

type PeriodPickerModalProps = {
  visible: boolean;
  periods: GroupPeriod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onCreateNew: () => void;
};

function PeriodPickerModal({
  visible,
  periods,
  selectedId,
  onSelect,
  onClose,
  onCreateNew,
}: PeriodPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Selecionar período</Text>
          {periods.map((p) => {
            const isSelected = p.id === selectedId;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  onSelect(p.id);
                  onClose();
                }}
                style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                  {formatPeriodLabel(p)}
                </Text>
                {p.status === "active" && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Ativo</Text>
                  </View>
                )}
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={onCreateNew} style={styles.modalCreateNew} activeOpacity={0.7}>
            <Text style={styles.modalCreateNewText}>+ Novo planejamento</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.modalCancel} activeOpacity={0.7}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Period Selector Strip ────────────────────────────────────────────────────

type PeriodSelectorProps = {
  periods: GroupPeriod[];
  selectedId: string | null;
  onSetSelected: (id: string) => Promise<void>;
};

function PeriodSelector({ periods, selectedId, onSetSelected }: PeriodSelectorProps) {
  const [androidModalVisible, setAndroidModalVisible] = useState(false);
  const navigation = useNavigation<Navigation>();

  const selectedPeriod = periods.find((p) => p.id === selectedId) ?? periods[0] ?? null;
  const label = selectedPeriod ? formatPeriodLabel(selectedPeriod) : "Período";

  const openPicker = useCallback(() => {
    if (Platform.OS === "ios") {
      const options = periods.map(formatPeriodLabel);
      options.push("Novo planejamento");
      options.push("Cancelar");
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: "Selecionar período",
        },
        (idx) => {
          if (idx < periods.length) {
            onSetSelected(periods[idx].id);
          } else if (idx === periods.length) {
            navigation.navigate("CreatePeriod");
          }
        },
      );
    } else {
      setAndroidModalVisible(true);
    }
  }, [periods, onSetSelected, navigation]);

  return (
    <>
      <TouchableOpacity
        onPress={openPicker}
        activeOpacity={0.7}
        style={styles.periodSelector}
      >
        <Text style={styles.periodSelectorText} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.periodSelectorChevron}>▾</Text>
      </TouchableOpacity>

      {Platform.OS !== "ios" && (
        <PeriodPickerModal
          visible={androidModalVisible}
          periods={periods}
          selectedId={selectedId}
          onSelect={onSetSelected}
          onClose={() => setAndroidModalVisible(false)}
          onCreateNew={() => {
            setAndroidModalVisible(false);
            navigation.navigate("CreatePeriod");
          }}
        />
      )}
    </>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export function HomeScreen() {
  usePageTitle("Planfin");
  const { period, refetch: refetchPeriod, periods, selectedPeriodId, setSelectedPeriod } = usePeriod();
  const { signOut, user } = useAuth();
  const { activeGroup } = useGroup();
  const navigation = useNavigation<Navigation>();

  const balance = period?.today?.availableBalance ?? "0.00";
  const isPositive = parseFloat(balance) >= 0;

  const todaySpent = (() => {
    const limit = parseFloat(period?.today?.dailyLimit ?? period?.dailyLimit ?? "0");
    const carryover = parseFloat(period?.today?.carryover ?? "0");
    const avail = parseFloat(balance);
    const spent = limit + carryover - avail;
    return Math.max(0, spent).toFixed(2);
  })();

  const daysLeft = (() => {
    if (!period?.endDate) return null;
    const end = new Date(period.endDate + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  })();

  const { data, loading, error, refetch: refetchHistory } = useQuery<ExpenseHistoryData>(
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
      if (period?.id) refetchHistory();
    }, [refetchPeriod, refetchHistory, period?.id]),
  );

  const todayStr = toISODate(new Date());
  const todayExpenses = data?.expenseHistory?.find((d) => d.date === todayStr)?.expenses ?? [];

  const [logout] = useLogoutMutation({
    onCompleted: () => signOut(),
    onError: () => signOut(),
  });

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Groups")} style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Planfin</Text>
          {activeGroup && (
            <Text style={styles.headerGroupName}>📍 {activeGroup.name} ▾</Text>
          )}
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.8}>
            <LinearGradient
              colors={[Colors.gradStart, Colors.gradEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Period selector strip */}
      {periods.length > 0 && (
        <PeriodSelector
          periods={periods}
          selectedId={selectedPeriodId}
          onSetSelected={setSelectedPeriod}
        />
      )}

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance card */}
        <BalanceCard
          available={balance}
          spent={todaySpent}
          dailyLimit={period?.dailyLimit ?? "0.00"}
          isPositive={isPositive}
          remainingTotal={period?.remainingTotal ?? undefined}
        />

        {/* Period info strip */}
        {period && (
          <View style={styles.periodInfoRow}>
            {[
              { label: "Período", val: `${period.startDate?.slice(5, 7)}/` + `${period.startDate?.slice(0, 4)} – ${period.endDate?.slice(5, 7)}/${period.endDate?.slice(0, 4)}` },
              { label: "Dias restantes", val: daysLeft !== null ? `${daysLeft} dias` : "—" },
            ].map(({ label, val }) => (
              <Card key={label} padding={12} style={styles.periodInfoCard}>
                <Text style={styles.periodInfoLabel}>{label}</Text>
                <Text style={styles.periodInfoValue}>{val}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Today's expenses */}
        <Card padding={16}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseHeaderLabel}>Gastos de hoje</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={styles.activityIndicator} />
          ) : error ? (
            <InlineError onRetry={refetchHistory} />
          ) : todayExpenses.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum gasto hoje.</Text>
          ) : (
            todayExpenses.map((item) => (
              <ExpenseRow
                key={item.id}
                item={item}
                onPress={() => navigation.navigate("EditExpense", {
                  id: item.id,
                  amount: item.amount,
                  date: item.date ?? todayStr,
                  note: item.note ?? undefined,
                  isExtra: item.isExtra ?? undefined,
                  subcategoryId: item.subcategory?.id ?? undefined,
                  categoryId: undefined,
                })}
                authorLabel={authorLabel(item.createdBy, user?.id)}
              />
            ))
          )}
        </Card>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense")}
        activeOpacity={0.85}
        style={styles.fab}
      >
        <LinearGradient
          colors={[Colors.gradStart, Colors.gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  // Header
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerGroupName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  avatarGradient: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
  },
  // Period selector strip
  periodSelector: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  periodSelectorText: {
    fontSize: 13,
    color: Colors.primaryText,
    fontWeight: "600",
    flex: 1,
  },
  periodSelectorChevron: {
    fontSize: 12,
    color: Colors.primaryText,
    fontWeight: "600",
  },
  // Scroll content
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // Period info
  periodInfoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  periodInfoCard: {
    flex: 1,
  },
  periodInfoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSec,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  periodInfoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  // Expense section
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  expenseHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSec,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  activityIndicator: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textTer,
    fontSize: 14,
    paddingVertical: 16,
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 18,
  },
  fabGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.fabShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  fabIcon: {
    color: "#fff",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "300",
  },
  // Android period picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSec,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 12,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    marginBottom: 4,
  },
  modalItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  modalItemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  modalItemTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
  activeBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginRight: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.successText,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "700",
  },
  modalCreateNew: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalCreateNewText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "700",
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: "600",
  },
});
