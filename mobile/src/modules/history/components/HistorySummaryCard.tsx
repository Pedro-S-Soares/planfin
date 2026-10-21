import { Text, View } from "react-native";
import { Card } from "../../../components/ui/Card";
import { Colors } from "../../../theme/tokens";
import { formatMoney } from "../../finance/format";
import type { FinancialAccount } from "../../finance/use-financial-accounts";
import type { HistorySummary } from "../history-filters";

interface HistorySummaryCardProps {
  summary: HistorySummary;
  /** The account being filtered, to compare its balance in the app with the bank. */
  account: FinancialAccount | null;
  currencySymbol: string;
}

function SummaryValue({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "800", color }}>{value}</Text>
    </View>
  );
}

export function HistorySummaryCard({ summary, account, currencySymbol }: HistorySummaryCardProps) {
  const hasBalance = account !== null && account.kind !== "credit_card" && account.balance != null;

  return (
    <Card padding={14} style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <SummaryValue label="ENTRADAS" value={formatMoney(summary.incoming, currencySymbol)} color={Colors.success} />
        <SummaryValue label="SAÍDAS" value={formatMoney(summary.outgoing, currencySymbol)} color={Colors.text} />
        <SummaryValue
          label="RESULTADO"
          value={formatMoney(summary.net, currencySymbol, true)}
          color={summary.net >= 0 ? Colors.success : Colors.danger}
        />
      </View>
      <Text style={{ fontSize: 11, color: Colors.textTer, marginTop: 8 }}>
        {summary.count} {summary.count === 1 ? "lançamento" : "lançamentos"} no período com estes filtros
      </Text>
      {hasBalance ? (
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 4 }}>
          Saldo de {account.name} no app hoje:{" "}
          <Text style={{ fontWeight: "700", color: Colors.text }}>{formatMoney(account.balance, currencySymbol)}</Text>
        </Text>
      ) : null}
    </Card>
  );
}
