import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors, Radius } from "../../../theme/tokens";
import { ACCOUNT_KIND_ICON, ACCOUNT_KIND_LABEL, formatMoney, formatShortDate, toNumber } from "../format";
import type { FinancialAccount } from "../use-financial-accounts";

type AccountBalanceCardProps = {
  account: FinancialAccount;
  onPress: () => void;
  onAdjust: () => void;
};

export function AccountBalanceCard({ account, onPress, onAdjust }: AccountBalanceCardProps) {
  const { currency } = useCurrency();
  const balance = toNumber(account.balance);
  const ownerName = account.owner ? account.owner.name ?? account.owner.email?.split("@")[0] : null;

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
