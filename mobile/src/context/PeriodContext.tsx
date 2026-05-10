import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gql, useQuery, ApolloError } from "@apollo/client";
import { ActivePeriodQuery } from "../graphql/__generated__/hooks";
import { toISODate } from "../lib/date";
import { storage } from "../lib/storage";
import { useGroup } from "./GroupContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = NonNullable<ActivePeriodQuery["activePeriod"]>;
type BudgetDay = NonNullable<Period["today"]>;

/** A lightweight period summary returned by groupPeriods */
export type GroupPeriod = {
  id: string;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  dailyLimit?: string | null;
  totalBudget?: string | null;
  status?: string | null;
  availableBalance?: string | null;
};

export type { Period, BudgetDay };

type PeriodContextValue = {
  /** Full period detail (activePeriod query), for the currently selected period */
  period: Period | null;
  hasActivePeriod: boolean;
  isLoading: boolean;
  error: ApolloError | null;
  refetch: () => void;
  /** All periods for the current group */
  periods: GroupPeriod[];
  periodsLoading: boolean;
  /** ID of the currently selected period (persisted per group) */
  selectedPeriodId: string | null;
  /** Select a different period – persists choice to storage */
  setSelectedPeriod: (id: string) => Promise<void>;
};

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const ACTIVE_PERIOD_QUERY = gql`
  query ActivePeriod($today: String!, $periodId: ID) {
    activePeriod(today: $today, periodId: $periodId) {
      id
      startDate
      endDate
      dailyLimit
      totalBudget
      remainingTotal
      status
      today {
        id
        date
        dailyLimit
        carryover
        availableBalance
        closedAt
      }
    }
  }
`;

type ActivePeriodData = ActivePeriodQuery;

const GROUP_PERIODS_QUERY = gql`
  query GroupPeriods {
    group {
      groupPeriods {
        id
        name
        startDate
        endDate
        dailyLimit
        totalBudget
        status
        availableBalance
      }
    }
  }
`;

type GroupPeriodsData = {
  group?: {
    groupPeriods?: GroupPeriod[] | null;
  } | null;
};

// ─── Storage key helper ───────────────────────────────────────────────────────

function storageKey(groupId: string): string {
  return `active_period_id_${groupId}`;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const { activeGroup } = useGroup();
  const groupId = activeGroup?.id ?? null;

  // ── Selected period ID state (restored from AsyncStorage on group change) ──
  const [selectedPeriodId, setSelectedPeriodIdState] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  // Track the last groupId we loaded storage for to avoid duplicate loads
  const lastLoadedGroupRef = useRef<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setSelectedPeriodIdState(null);
      setStorageReady(true);
      lastLoadedGroupRef.current = null;
      return;
    }
    if (lastLoadedGroupRef.current === groupId) return;
    lastLoadedGroupRef.current = groupId;

    setStorageReady(false);
    storage.getItem(storageKey(groupId)).then((stored) => {
      setSelectedPeriodIdState(stored ?? null);
      setStorageReady(true);
    });
  }, [groupId]);

  // ── Fetch all group periods ───────────────────────────────────────────────
  const periodsQuery = useQuery<GroupPeriodsData>(GROUP_PERIODS_QUERY, {
    fetchPolicy: "network-only",
    skip: !groupId,
  });

  const periods: GroupPeriod[] = useMemo(
    () => (periodsQuery.data?.group?.groupPeriods ?? []) as GroupPeriod[],
    [periodsQuery.data],
  );

  // Once periods are loaded, resolve / default the selected period id
  const resolvedSelectedId = useMemo((): string | null => {
    if (!storageReady || periods.length === 0) return selectedPeriodId;
    // Validate stored id still exists in the list
    if (selectedPeriodId && periods.some((p) => p.id === selectedPeriodId)) {
      return selectedPeriodId;
    }
    // Default: first active period, or first period
    const activePeriod = periods.find((p) => p.status === "active");
    return activePeriod?.id ?? periods[0]?.id ?? null;
  }, [storageReady, periods, selectedPeriodId]);

  // ── Fetch full period detail (the activePeriod query still drives the
  //    balance/today data because it computes availableBalance for today) ────
  const { data, loading, error, refetch } = useQuery<ActivePeriodData>(ACTIVE_PERIOD_QUERY, {
    variables: {
      today: toISODate(new Date()),
      ...(selectedPeriodId ? { periodId: selectedPeriodId } : {}),
    },
    fetchPolicy: "network-only",
    skip: !groupId,
  });

  const period = data?.activePeriod ?? null;
  const hasActivePeriod = period !== null && period.status === "active";

  // ── Setter: persist to storage and update state ───────────────────────────
  const setSelectedPeriod = useCallback(
    async (id: string) => {
      setSelectedPeriodIdState(id);
      if (groupId) {
        await storage.setItem(storageKey(groupId), id);
      }
    },
    [groupId],
  );

  const value = useMemo<PeriodContextValue>(
    () => ({
      period,
      hasActivePeriod,
      isLoading: loading,
      error: error ?? null,
      refetch,
      periods,
      periodsLoading: periodsQuery.loading,
      selectedPeriodId: resolvedSelectedId,
      setSelectedPeriod,
    }),
    [
      period,
      hasActivePeriod,
      loading,
      error,
      refetch,
      periods,
      periodsQuery.loading,
      resolvedSelectedId,
      setSelectedPeriod,
    ],
  );

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider");
  return ctx;
}
