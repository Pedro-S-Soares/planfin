import type { ReactNode } from "react";
import { toNumber } from "../../lib/money";
import { BalanceCard, BalanceStat, BalanceStatDivider, BalanceStatRow } from "./BalanceCard";

interface TotalBalanceCardProps {
  remainingTotal: string;
  extraRemaining: string;
  /** Secondary lines under the stats (e.g. "Posso gastar"). */
  footer?: ReactNode;
}

export function TotalBalanceCard({ remainingTotal, extraRemaining, footer }: TotalBalanceCardProps) {
  const dailyRemaining = String(toNumber(remainingTotal) - toNumber(extraRemaining));

  return (
    <BalanceCard title="Disponível no período" amount={remainingTotal}>
      <BalanceStatRow>
        <BalanceStat label="Diário restante" value={dailyRemaining} />
        <BalanceStatDivider />
        <BalanceStat label="Extra restante" value={extraRemaining} isFlexible />
      </BalanceStatRow>
      {footer}
    </BalanceCard>
  );
}
