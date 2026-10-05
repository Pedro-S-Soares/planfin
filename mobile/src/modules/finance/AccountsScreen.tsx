import { useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { AccountBalanceCard } from "./components/AccountBalanceCard";
import { CardSummary } from "./components/CardSummary";
import { ReserveCard } from "./components/ReserveCard";
import { TabHeader } from "./components/TabHeader";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function AccountsScreen() {
  usePageTitle("Planfin - Contas");
  const navigation = useNavigation<Navigation>();
  const { accounts, cards, loading, error, refetch } = useFinancialAccounts();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const moneyAccounts = accounts.filter((a) => a.kind !== "credit_card");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <TabHeader
        title="Contas"
        subtitle="Saldos e faturas"
        actionLabel="+ Adicionar"
        onAction={() => navigation.navigate("AccountForm", {})}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <InlineError onRetry={() => refetch()} />
        ) : accounts.length === 0 ? (
          <Card padding={20}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.text }}>Cadastre sua conta e seu cartão</Text>
            <Text style={{ fontSize: 14, color: Colors.textSec, marginTop: 8, lineHeight: 20 }}>
              Com a conta principal e o cartão cadastrados, o app mostra quanto você tem agora, quanto já está
              comprometido com a fatura e quanto ainda pode gastar.
            </Text>
            <View style={{ gap: 10, marginTop: 18 }}>
              <Btn label="Adicionar conta corrente" onPress={() => navigation.navigate("AccountForm", { kind: "checking" })} />
              <Btn
                label="Adicionar cartão de crédito"
                variant="secondary"
                onPress={() => navigation.navigate("AccountForm", { kind: "credit_card" })}
              />
            </View>
          </Card>
        ) : (
          <>
            {moneyAccounts.map((account) => (
              <AccountBalanceCard
                key={account.id}
                account={account}
                onPress={() => navigation.navigate("AccountDetail", { accountId: account.id })}
                onAdjust={() =>
                  navigation.navigate("AdjustBalance", { accountId: account.id, balance: account.balance ?? "0" })
                }
              />
            ))}
            {cards.map((card) => (
              <CardSummary
                key={card.id}
                card={card}
                onOpen={() => navigation.navigate("CardDetail", { cardId: card.id })}
                onOpenInvoice={(month) => navigation.navigate("Invoice", { cardId: card.id, month })}
                onPay={(month, remaining) => navigation.navigate("PayInvoice", { cardId: card.id, month, remaining })}
              />
            ))}
            <Btn label="🧾 Fixas, avulsas e entradas" variant="secondary" onPress={() => navigation.navigate("Bills", {})} />
            <View style={{ height: 10 }} />
            <Btn label="💼 Salário e ciclo" variant="secondary" onPress={() => navigation.navigate("SalarySettings")} />
            <View style={{ height: 10 }} />
            <Btn label="🧮 Planejamento do mês" variant="secondary" onPress={() => navigation.navigate("MonthPlan")} />
            <View style={{ height: 10 }} />
            {accounts.some((a) => a.kind === "reserve") ? <ReserveCard /> : null}
            {moneyAccounts.length > 0 ? (
              <Btn
                label="Transferir entre contas"
                variant="ghost"
                onPress={() => navigation.navigate("Transfer", {})}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
