import React, { createContext, useContext, useMemo } from "react";
import { useActivePeriodQuery, ActivePeriodQuery } from "../graphql/__generated__/hooks";

type Period = NonNullable<ActivePeriodQuery["activePeriod"]>;
type BudgetDay = NonNullable<Period["today"]>;

export type { Period, BudgetDay };

type PeriodContextValue = {
  period: Period | null;
  hasActivePeriod: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, refetch } = useActivePeriodQuery({
    fetchPolicy: "network-only",
  });

  const period = data?.activePeriod ?? null;
  const hasActivePeriod = period !== null && period.status === "active";

  const value = useMemo(
    () => ({ period, hasActivePeriod, isLoading: loading, refetch }),
    [period, hasActivePeriod, loading, refetch]
  );

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider");
  return ctx;
}
