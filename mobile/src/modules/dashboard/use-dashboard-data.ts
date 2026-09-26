import { useMemo } from "react";
import type { ApolloError } from "@apollo/client";
import { useDashboardDataQuery } from "../../graphql/__generated__/hooks";
import { useAuth } from "../../context/AuthContext";
import { usePeriod } from "../../context/PeriodContext";
import { toISODate } from "../../lib/date";
import { fetchWindow } from "./analytics";
import { buildFacts } from "./facts";
import type { CategoryInfo, DateWindow, Fact, PeriodBudget } from "./types";

export type DashboardData =
  | { status: "loading" }
  | { status: "error"; error: ApolloError | undefined; refetch: () => void }
  | {
      status: "ready";
      facts: Fact[];
      categories: Map<string, CategoryInfo>;
      fetched: DateWindow;
      today: string;
      period: PeriodBudget | null;
      refetch: () => void;
    };

/** Fetches ~13 months of expenses (the backend's max range) once; every chart derives from it. */
export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const { period: activePeriod } = usePeriod();
  const today = toISODate(new Date());

  const period = useMemo<PeriodBudget | null>(() => {
    if (!activePeriod?.startDate || !activePeriod.endDate) return null;
    return {
      startDate: activePeriod.startDate,
      endDate: activePeriod.endDate,
      totalBudget: Number(activePeriod.totalBudget ?? 0),
      dailyLimit: Number(activePeriod.dailyLimit ?? 0),
    };
  }, [activePeriod?.startDate, activePeriod?.endDate, activePeriod?.totalBudget, activePeriod?.dailyLimit]);

  const fetched = useMemo(() => fetchWindow(today, period), [today, period]);

  const { data, loading, error, refetch } = useDashboardDataQuery({
    variables: fetched,
    fetchPolicy: "cache-and-network",
  });

  const built = useMemo(() => (data ? buildFacts(data, user?.id) : null), [data, user?.id]);
  const retry = () => void refetch();

  if (built) {
    return { status: "ready", ...built, fetched, today, period, refetch: retry };
  }
  if (loading) return { status: "loading" };
  return { status: "error", error, refetch: retry };
}
