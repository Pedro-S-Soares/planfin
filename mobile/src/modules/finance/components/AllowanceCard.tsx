import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { useAllowancePlanQuery, useDistributeAllowanceMutation } from "../../../graphql/__generated__/hooks";
import { confirm } from "../../../lib/alert";
import { toISODate } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { useFinancialAccounts } from "../use-financial-accounts";
import type { AppStackParamList } from "../../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

/** End-of-cycle left over split between the couple's allowance accounts. */
export function AllowanceCard() {
  const navigation = useNavigation<Navigation>();
  const { currency } = useCurrency();
  const today = toISODate(new Date());
  const { accounts } = useFinancialAccounts();
  const { data, refetch } = useAllowancePlanQuery({ variables: { today }, fetchPolicy: "cache-and-network" });
  const [distribute, { loading }] = useDistributeAllowanceMutation({
    refetchQueries: ["AllowancePlan", "FinancePanel", "FinancialAccounts", "AccountMovements"],
    onError: () => undefined, // o toast global avisa o erro
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const plan = data?.allowancePlan;
  if (!plan || accounts.length === 0) return null;
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const shares = plan.shares?.filter((s) => s !== null) ?? [];
  const amount = toNumber(plan.amount);
  const shortfall = toNumber(plan.shortfall);
  const distributed = toNumber(plan.distributed);

  if (shares.length === 0) {
    return (
      <TouchableOpacity onPress={() => navigation.navigate("AccountForm", { kind: "allowance" })} activeOpacity={0.85}>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>MESADA DO CASAL</Text>
          <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4 }}>
            Crie uma conta de mesada para cada um. No fim do ciclo, o que sobrar é dividido meio a meio. ›
          </Text>
        </Card>
      </TouchableOpacity>
    );
  }

  const handleDistribute = () =>
    confirm(
      {
        title: "Distribuir mesada",
        message: `Transferir ${money(amount)} da conta principal: ${shares.map((s) => `${s.ownerName ?? s.accountName} ${money(s.amount)}`).join(", ")}. Faça a transferência no banco também.`,
        confirmLabel: "Distribuir",
      },
      () => distribute({ variables: { today } }),
    );

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>MESADA DO CICLO</Text>
        <Text style={{ fontSize: 11, color: Colors.textTer }}>fecha {formatShortDate(plan.cycleEndDate)}</Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: "800", color: amount > 0 ? Colors.text : Colors.textSec, marginTop: 4 }}>
        {money(amount)}
      </Text>
      {amount > 0 ? (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          {shares.map((s) => (
            <View key={s.accountId ?? ""} style={{ flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 10 }}>
              <Text style={{ fontSize: 12, color: Colors.textSec }} numberOfLines={1}>{s.ownerName ?? s.accountName}</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>{money(s.amount)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4 }}>
          Por enquanto não sobra para mesada. Ela aparece sozinha quando sobrar dinheiro no fim do ciclo.
        </Text>
      )}
      {shortfall > 0 ? (
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 8 }}>
          {money(shortfall)} ficam na conta porque o próximo salário não cobre o que já está na fatura.
        </Text>
      ) : null}
      {distributed > 0 ? (
        <Text style={{ fontSize: 12, color: Colors.successText, marginTop: 8 }}>Já distribuído neste ciclo: {money(distributed)}</Text>
      ) : null}
      {plan.canDistribute ? (
        <TouchableOpacity
          onPress={handleDistribute}
          disabled={loading}
          activeOpacity={0.8}
          style={{ marginTop: 12, backgroundColor: Colors.success, borderRadius: Radius.md, paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{loading ? "Distribuindo…" : `Distribuir ${money(amount)}`}</Text>
        </TouchableOpacity>
      ) : amount > 0 ? (
        <Text style={{ fontSize: 12, color: Colors.textTer, marginTop: 8 }}>
          A distribuição libera no fechamento, a partir de {formatShortDate(plan.opensOn)}.
        </Text>
      ) : null}
    </Card>
  );
}
