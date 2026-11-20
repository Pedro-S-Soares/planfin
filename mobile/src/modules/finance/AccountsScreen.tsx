import { useCallback } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button } from "../../components/ui/Button";
import { Block } from "../../components/ui/Block";
import { InlineError } from "../../components/ui/InlineError";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AccountBalanceCard } from "./components/AccountBalanceCard";
import { CardSummary } from "./components/CardSummary";
import { ReserveCard } from "./components/ReserveCard";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { PlusIcon } from "../../components/ui/PlusIcon";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";
import { palette } from "../../theme";
import { Text } from "../../components/ui/Text";
import { Icon } from "../../components/ui/Icon";

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
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <ScreenHeader
        title="Contas"
        subtitle="Saldos e faturas"
        action={
          <Button
            label="Adicionar"
            size="sm"
            variant="secondary"
            isFullWidth={false}
            leading={<PlusIcon tone="accent" />}
            accessibilityLabel="Adicionar conta"
            onPress={() => navigation.navigate("AccountForm", {})}
          />
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {loading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 32 }} />
        ) : error ? (
          <InlineError onRetry={() => refetch()} />
        ) : accounts.length === 0 ? (
          <Block padding={20}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: palette.ink }}>Cadastre sua conta e seu cartão</Text>
            <Text style={{ fontSize: 14, color: palette.muted, marginTop: 8, lineHeight: 20 }}>
              Com a conta principal e o cartão cadastrados, o app mostra quanto você tem agora, quanto já está
              comprometido com a fatura e quanto ainda pode gastar.
            </Text>
            <View style={{ gap: 10, marginTop: 18 }}>
              <Button label="Adicionar conta corrente" onPress={() => navigation.navigate("AccountForm", { kind: "checking" })} />
              <Button
                label="Adicionar cartão de crédito"
                variant="secondary"
                onPress={() => navigation.navigate("AccountForm", { kind: "credit_card" })}
              />
            </View>
          </Block>
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
            <Button label="Fixas, avulsas e entradas" leading={<Icon name="receipt-text-outline" size={18} tone="accent" />} variant="secondary" onPress={() => navigation.navigate("Bills", {})} />
            <View style={{ height: 10 }} />
            <Button label="Salário e ciclo" leading={<Icon name="briefcase-outline" size={18} tone="accent" />} variant="secondary" onPress={() => navigation.navigate("SalarySettings")} />
            <View style={{ height: 10 }} />
            <Button label="Planejamento do mês" leading={<Icon name="calculator-variant-outline" size={18} tone="accent" />} variant="secondary" onPress={() => navigation.navigate("MonthPlan")} />
            <View style={{ height: 10 }} />
            {accounts.some((a) => a.kind === "reserve") ? <ReserveCard /> : null}
            {moneyAccounts.length > 0 ? (
              <Button
                label="Transferir entre contas"
                variant="secondary"
                onPress={() => navigation.navigate("Transfer", {})}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
