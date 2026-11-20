import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "../../../components/ui/AppText";
import { Block } from "../../../components/ui/Block";
import { Button } from "../../../components/ui/Button";
import { MoneyText } from "../../../components/ui/MoneyText";
import { useCurrency } from "../../../context/CurrencyContext";
import { useAllowancePlanQuery, useDistributeAllowanceMutation } from "../../../graphql/__generated__/hooks";
import { confirm } from "../../../lib/alert";
import { toISODate } from "../../../lib/date";
import { palette, radius, space } from "../../../theme";
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
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("AccountForm", { kind: "allowance" })}>
        <Block style={styles.spaced}>
          <AppText variant="label">Mesada do casal</AppText>
          <AppText variant="body" tone="muted" style={styles.gapTop}>
            Crie uma conta de mesada para cada um. No fim do ciclo, o que sobrar é dividido meio a meio.
          </AppText>
        </Block>
      </Pressable>
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
    <Block style={styles.spaced}>
      <View style={styles.header}>
        <AppText variant="label">Mesada do ciclo</AppText>
        <AppText variant="caption">fecha {formatShortDate(plan.cycleEndDate)}</AppText>
      </View>
      <MoneyText amount={amount} variant="amount" tone={amount > 0 ? "ink" : "muted"} style={styles.amount} />
      {amount > 0 ? (
        <View style={styles.shares}>
          {shares.map((s) => (
            <View key={s.accountId ?? ""} style={styles.share}>
              <AppText variant="caption" numberOfLines={1}>{s.ownerName ?? s.accountName}</AppText>
              <MoneyText amount={s.amount} variant="label" />
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="body" tone="muted">
          Por enquanto não sobra para mesada. Ela aparece sozinha quando sobrar dinheiro no fim do ciclo.
        </AppText>
      )}
      {shortfall > 0 ? (
        <AppText variant="caption" style={styles.gapTop}>
          {money(shortfall)} ficam na conta porque o próximo salário não cobre o que já está na fatura.
        </AppText>
      ) : null}
      {distributed > 0 ? (
        <AppText variant="caption" tone="income" style={styles.gapTop}>
          Já distribuído neste ciclo: {money(distributed)}
        </AppText>
      ) : null}
      {plan.canDistribute ? (
        <Button
          label={`Distribuir ${money(amount)}`}
          isLoading={loading}
          style={styles.action}
          onPress={handleDistribute}
        />
      ) : amount > 0 ? (
        <AppText variant="caption" style={styles.gapTop}>
          A distribuição libera no fechamento, a partir de {formatShortDate(plan.opensOn)}.
        </AppText>
      ) : null}
    </Block>
  );
}

const styles = StyleSheet.create({
  spaced: {
    marginBottom: space.lg,
  },
  gapTop: {
    marginTop: space.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: space.sm,
  },
  amount: {
    marginTop: space.xs,
    marginBottom: space.xs,
  },
  shares: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xs,
  },
  share: {
    flex: 1,
    minWidth: 0,
    backgroundColor: palette.paper,
    borderRadius: radius.control,
    padding: space.md,
  },
  action: {
    marginTop: space.md,
  },
});
