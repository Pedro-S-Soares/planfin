import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors, Radius } from "../../../theme/tokens";
import { parseISODate } from "../../../lib/date";
import { ACCOUNT_KIND_ICON, ACCOUNT_KIND_LABEL, formatMoney, formatShortDate, toNumber } from "../format";
import type { FinancialAccount } from "../use-financial-accounts";

type AccountBalanceCardProps = {
  account: FinancialAccount;
  onPress: () => void;
  onAdjust: () => void;
};

/** Meal voucher: how much it allows per day until the next credit. */
function benefitHint(account: FinancialAccount, balance: number, symbol: string): string | null {
  if (account.kind !== "benefit" || !account.nextCreditDate || !account.monthlyCredit) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.max(1, Math.round((parseISODate(account.nextCreditDate).getTime() - today.getTime()) / 86_400_000));
  const perDay = Math.max(0, balance) / days;
  return `Recebe ${formatMoney(account.monthlyCredit, symbol)} em ${formatShortDate(account.nextCreditDate)} · dá ${formatMoney(perDay, symbol)}/dia até lá`;
}

export function AccountBalanceCard({ account, onPress, onAdjust }: AccountBalanceCardProps) {
  const { currency } = useCurrency();
  const balance = toNumber(account.balance);
  const ownerName = account.owner ? account.owner.name ?? account.owner.email?.split("@")[0] : null;
  const creditHint = benefitHint(account, balance, currency.symbol);

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 22 }}>{ACCOUNT_KIND_ICON[account.kind]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{account.name}</Text>
            <Text style={{ fontSize: 12, color: Colors.textSec }}>
              {ACCOUNT_KIND_LABEL[account.kind]}
              {account.isPrimary ? " · Principal" : ""}
              {ownerName ? ` · ${ownerName}` : ""}
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: Colors.textTer }}>›</Text>
        </View>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: balance < 0 ? Colors.danger : Colors.text,
            marginTop: 12,
            letterSpacing: -0.5,
          }}
        >
          {formatMoney(balance, currency.symbol)}
        </Text>
      </TouchableOpacity>
      {creditHint ? <Text style={{ fontSize: 12, color: Colors.successText, marginTop: 2 }}>{creditHint}</Text> : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontSize: 12, color: Colors.textTer }}>
          Conferido com o banco em {formatShortDate(account.balanceDate)}
        </Text>
        <TouchableOpacity
          onPress={onAdjust}
          activeOpacity={0.8}
          style={{ backgroundColor: Colors.bg, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.primaryText }}>Ajustar saldo</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
