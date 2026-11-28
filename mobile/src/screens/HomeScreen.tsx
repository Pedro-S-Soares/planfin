import { useCallback, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
import { AppText } from "../components/ui/AppText";
import { Block, ListBlock } from "../components/ui/Block";
import { ChipGroup } from "../components/ui/Chip";
import { DailyAvailable, DailyBalanceCard, DailyStats } from "../components/ui/DailyBalanceCard";
import { SectionHeader } from "../components/ui/DayHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { ExpenseRow } from "../components/ui/ExpenseRow";
import { InlineError } from "../components/ui/InlineError";
import { TotalAvailable, TotalBalanceCard, TotalStats } from "../components/ui/TotalBalanceCard";
import { layout, palette, radius, space } from "../theme";
import { usePageTitle } from "../hooks/usePageTitle";
import { FinanceNotices } from "../modules/finance/components/FinancePanel";
import { PlanHomeCard } from "../modules/finance/components/PlanHomeCard";
import { AllowanceCard } from "../modules/finance/components/AllowanceCard";
import { EntrySheet } from "../modules/history/components/EntrySheet";
import { OptionSheet, type SheetSection } from "../modules/history/components/OptionSheet";
import {
  CLOSED_SHEET,
  editEntryState,
  type EntrySheetState,
} from "../modules/history/entry-sheet";
import type { AppStackParamList } from "../../App";
import type { GroupPeriod } from "../context/PeriodContext";

type Navigation = NativeStackNavigationProp<AppStackParamList>;
type ExpenseHistoryData = { expenseHistory: ExpenseDayWithAuthors[] };
type BalanceView = "daily" | "total";

const BALANCE_VIEWS: { value: BalanceView; label: string }[] = [
  { value: "daily", label: "Diário" },
  { value: "total", label: "Total" },
];

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

// ─── Period Selector Strip ────────────────────────────────────────────────────

type PeriodSelectorProps = {
  periods: GroupPeriod[];
  selectedId: string | null;
  onSetSelected: (id: string) => Promise<void>;
};

function PeriodSelector({ periods, selectedId, onSetSelected }: PeriodSelectorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
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
      setIsPickerOpen(true);
    }
  }, [periods, onSetSelected, navigation]);

  const sections: SheetSection[] = [
    {
      options: periods.map((p) => ({
        key: p.id,
        label: p.status === "active" ? `${formatPeriodLabel(p)} · ativo` : formatPeriodLabel(p),
        isSelected: p.id === selectedPeriod?.id,
        onSelect: () => {
          onSetSelected(p.id);
        },
      })),
    },
    {
      options: [
        { key: "new", label: "Novo planejamento", isSelected: false, onSelect: () => navigation.navigate("CreatePeriod") },
      ],
    },
  ];

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`Período: ${label}`} onPress={openPicker} style={styles.periodSelector}>
        <AppText variant="label" tone="accent" style={styles.periodSelectorText} numberOfLines={1}>
          {label}
        </AppText>
        <MaterialCommunityIcons name="chevron-down" size={18} color={palette.accent} />
      </Pressable>

      {Platform.OS !== "ios" ? (
        <OptionSheet title="Selecionar período" sections={sections} isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
      ) : null}
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
  const [balanceView, setBalanceView] = useState<BalanceView>("daily");
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);

  const balance = period?.today?.availableBalance ?? "0.00";

  const todaySpent = Math.max(0, parseFloat(period?.today?.spent ?? "0")).toFixed(2);

  const dailyStats = {
    spent: todaySpent,
    dailyLimit: period?.dailyLimit ?? "0.00",
    extraBudget: period?.extraBudget ?? "0.00",
    extraSpent: period?.extraSpent ?? "0.00",
  };
  const totalStats = {
    remainingTotal: period?.remainingTotal ?? "0.00",
    extraRemaining: period?.extraRemaining ?? "0.00",
  };

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trocar de grupo"
          onPress={() => navigation.navigate("Groups")}
          style={styles.headerLeft}
        >
          <AppText variant="title">Planfin</AppText>
          {activeGroup ? (
            <View style={styles.groupRow}>
              <AppText variant="label" tone="accent" numberOfLines={1}>
                {activeGroup.name}
              </AppText>
              <MaterialCommunityIcons name="chevron-down" size={16} color={palette.accent} />
            </View>
          ) : null}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Perfil" onPress={() => navigation.navigate("Profile")} style={styles.avatar}>
          <AppText variant="label" tone="accent">
            {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
          </AppText>
        </Pressable>
      </View>

      {periods.length > 0 ? (
        <PeriodSelector periods={periods} selectedId={selectedPeriodId} onSetSelected={setSelectedPeriod} />
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notices about the account (cash alert, salary to register) above the one main card */}
        <FinanceNotices />

        {/* The one main number: what the invoice plan leaves free, with today's budget inside */}
        <View style={styles.viewToggle}>
          <ChipGroup options={BALANCE_VIEWS} value={balanceView} onChange={setBalanceView} />
        </View>
        <PlanHomeCard
          dailyLimit={period?.dailyLimit}
          today={
            balanceView === "daily" ? (
              <>
                <DailyAvailable available={balance} />
                <DailyStats {...dailyStats} />
              </>
            ) : (
              <>
                <TotalAvailable remainingTotal={totalStats.remainingTotal} />
                <TotalStats {...totalStats} />
              </>
            )
          }
          fallback={
            balanceView === "daily" ? (
              <DailyBalanceCard available={balance} {...dailyStats} />
            ) : (
              <TotalBalanceCard {...totalStats} />
            )
          }
        />

        {/* Period: dates and days left in one line, tap to edit */}
        {period ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar período"
            onPress={() => navigation.navigate("EditPeriod")}
          >
            <Block style={styles.periodBlock}>
              <View style={styles.periodRow}>
                <View>
                  <AppText variant="caption">Período</AppText>
                  <AppText variant="label" isTabular>
                    {`${period.startDate?.slice(8, 10)}/${period.startDate?.slice(5, 7)} – ${period.endDate?.slice(8, 10)}/${period.endDate?.slice(5, 7)}`}
                  </AppText>
                </View>
                <View style={styles.periodRight}>
                  <AppText variant="caption">Faltam</AppText>
                  <AppText variant="label" isTabular>
                    {daysLeft !== null ? `${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}` : "—"}
                  </AppText>
                </View>
                <AppText variant="label" tone="accent">Editar</AppText>
              </View>
            </Block>
          </Pressable>
        ) : null}

        <AllowanceCard />

        {/* Today's entries */}
        <SectionHeader title="Gastos de hoje" />
        {loading ? (
          <ActivityIndicator color={palette.accent} style={styles.activityIndicator} />
        ) : error ? (
          <InlineError onRetry={refetchHistory} />
        ) : todayExpenses.length === 0 ? (
          <Block padding={0}>
            <EmptyState message="Nenhum gasto hoje." />
          </Block>
        ) : (
          <ListBlock>
            {todayExpenses.map((item) => (
              <ExpenseRow
                key={item.id}
                item={item}
                onPress={() => setSheet(editEntryState(item, todayStr))}
                authorLabel={authorLabel(item.createdBy, user?.id)}
              />
            ))}
          </ListBlock>
        )}
      </ScrollView>

      <EntrySheet
        state={sheet}
        onClose={() => setSheet(CLOSED_SHEET)}
        onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  header: {
    backgroundColor: palette.sheet,
    paddingTop: 56,
    paddingBottom: space.md,
    paddingHorizontal: layout.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.rule,
  },
  headerLeft: {
    flexShrink: 1,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  periodSelector: {
    backgroundColor: palette.sheet,
    borderBottomWidth: 1,
    borderBottomColor: palette.rule,
    paddingHorizontal: layout.gutter,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  periodSelectorText: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.gutter,
    paddingBottom: space.xxl,
  },
  viewToggle: {
    marginBottom: space.md,
  },
  periodBlock: {
    marginTop: space.lg,
    marginBottom: space.lg,
    paddingVertical: space.md,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xl,
  },
  periodRight: {
    flex: 1,
  },
  activityIndicator: {
    marginVertical: space.xl,
  },
});
