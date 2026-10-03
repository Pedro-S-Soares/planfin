import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { useCurrency } from "../../context/CurrencyContext";
import {
  useAccountMovementsQuery,
  useArchiveFinancialAccountMutation,
  useMakePrimaryAccountMutation,
} from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { formatDateBR } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { ACCOUNT_KIND_LABEL, formatMoney, toNumber } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function AccountDetailScreen() {
  usePageTitle("Planfin - Conta");
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<AppStackParamList, "AccountDetail">>();
  const { currency } = useCurrency();
  const { accounts } = useFinancialAccounts();
  const account = accounts.find((a) => a.id === params.accountId) ?? null;

  const movements = useAccountMovementsQuery({
    variables: { accountId: params.accountId, limit: 100 },
    fetchPolicy: "cache-and-network",
  });
  const [makePrimary, { loading: makingPrimary }] = useMakePrimaryAccountMutation({ refetchQueries: ["FinancialAccounts"] });
  const [archive] = useArchiveFinancialAccountMutation({
    refetchQueries: ["FinancialAccounts"],
    onCompleted: () => navigation.goBack(),
  });

  if (!account) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />;

  const rows = movements.data?.accountMovements?.filter((m) => m !== null) ?? [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Card padding={18} style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: Colors.textSec }}>{ACCOUNT_KIND_LABEL[account.kind]}</Text>
        <Text style={{ fontSize: 30, fontWeight: "800", color: toNumber(account.balance) < 0 ? Colors.danger : Colors.text, marginTop: 4 }}>
          {formatMoney(account.balance, currency.symbol)}
        </Text>
        <View style={{ gap: 8, marginTop: 14 }}>
          <Btn
            label="Ajustar saldo"
            size="sm"
            onPress={() => navigation.navigate("AdjustBalance", { accountId: account.id, balance: account.balance ?? "0" })}
          />
          <Btn label="Editar" size="sm" variant="ghost" onPress={() => navigation.navigate("AccountForm", { accountId: account.id })} />
          {account.kind === "checking" && !account.isPrimary ? (
            <Btn
              label="Tornar conta principal"
              size="sm"
              variant="secondary"
              loading={makingPrimary}
              onPress={() => makePrimary({ variables: { id: account.id } })}
            />
          ) : null}
        </View>
      </Card>

      <Card padding={16}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7, marginBottom: 8 }}>
          MOVIMENTAÇÕES
        </Text>
        {movements.loading && !movements.data ? (
          <ActivityIndicator color={Colors.primary} />
        ) : movements.error ? (
          <InlineError onRetry={() => movements.refetch()} />
        ) : rows.length === 0 ? (
          <Text style={{ color: Colors.textTer, textAlign: "center", paddingVertical: 12 }}>Nenhuma movimentação ainda.</Text>
        ) : (
          rows.map((m) => {
            const amount = toNumber(m.amount);
            return (
              <View
                key={`${m.kind}-${m.id}`}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: Colors.text, fontWeight: "600" }} numberOfLines={1}>{m.description}</Text>
                  <Text style={{ fontSize: 12, color: Colors.textSec }}>{m.date ? formatDateBR(m.date) : ""}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: amount > 0 ? Colors.success : Colors.text }}>
                  {formatMoney(amount, currency.symbol, true)}
                </Text>
              </View>
            );
          })
        )}
      </Card>

      <View style={{ marginTop: 16 }}>
        <Btn
          label="Arquivar conta"
          variant="danger"
          size="sm"
          onPress={() =>
            confirm(
              { title: "Arquivar conta", message: "Ela some da lista. Os lançamentos continuam no histórico.", confirmLabel: "Arquivar", destructive: true },
              () => archive({ variables: { id: account.id } }),
            )
          }
        />
      </View>
    </ScrollView>
  );
}
