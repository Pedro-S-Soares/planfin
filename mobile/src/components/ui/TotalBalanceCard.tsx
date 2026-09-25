import { BalanceCard, BalanceStat, BalanceStatDivider, BalanceStatRow } from "./BalanceCard";

interface TotalBalanceCardProps {
  remainingTotal: string;
  extraRemaining: string;
}

export function TotalBalanceCard({ remainingTotal, extraRemaining }: TotalBalanceCardProps) {
  const dailyRemaining = (
    parseFloat(remainingTotal || "0") - parseFloat(extraRemaining || "0")
  ).toFixed(2);

  return (
    <BalanceCard title="Disponível no período" amount={remainingTotal}>
      <BalanceStatRow>
        <BalanceStat label="Diário restante" value={dailyRemaining} />
        <BalanceStatDivider />
        <BalanceStat label="Extra restante" value={extraRemaining} isFlexible />
      </BalanceStatRow>
    </BalanceCard>
  );
}
