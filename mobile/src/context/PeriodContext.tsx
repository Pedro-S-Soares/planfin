import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

export const ACTIVE_PERIOD_QUERY = gql`
  query ActivePeriod {
    activePeriod {
      id
      startDate
      endDate
      dailyLimit
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

type BudgetDay = {
  id: string;
  date: string;
  dailyLimit: string;
  carryover: string;
  availableBalance: string;
  closedAt: string | null;
};

type Period = {
  id: string;
  startDate: string;
  endDate: string;
  dailyLimit: string;
  status: string;
  today: BudgetDay | null;
};

type PeriodContextValue = {
  period: Period | null;
  hasActivePeriod: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, refetch } = useQuery<{ activePeriod: Period | null }>(
    ACTIVE_PERIOD_QUERY,
    { fetchPolicy: "network-only" }
  );

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
