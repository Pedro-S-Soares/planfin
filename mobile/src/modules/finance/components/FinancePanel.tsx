import { useState } from "react";
import { useCurrency } from "../../../context/CurrencyContext";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "../../../components/ui/AppText";
import { Block } from "../../../components/ui/Block";
import { MoneyText } from "../../../components/ui/MoneyText";
import { InlineError } from "../../../components/ui/InlineError";
import { palette, radius, space } from "../../../theme";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { useFinancePanel } from "../use-finance-panel";
import { CommitmentList } from "./CommitmentList";
import { SalaryBanner } from "./SalaryBanner";
import type { AppStackParamList, MainTabParamList } from "../../../../App";

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<AppStackParamList>
>;

function Figure({ label, value, tone }: { label: string; value: string | null | undefined; tone?: "muted" }) {
  return (
    <View style={styles.figure}>
      <AppText variant="caption">{label}</AppText>
      <MoneyText amount={value} variant="value" tone={tone} adjustsFontSizeToFit />
    </View>
  );
}

/**
 * The Home's notices about the account: the invitation to register the accounts, the
 * salary to register or configure, and a cash alert when what leaves the main account
 * before the next salary is more than it holds (`financePanel.free` < 0).
 */
export function FinanceNotices() {
  const navigation = useNavigation<Navigation>();
  const { currency } = useCurrency();
  const { panel, loading, error, refetch } = useFinancePanel();

  if (loading) return <ActivityIndicator color={palette.accent} style={styles.loading} />;
  if (error) {
    return (
      <View style={styles.spaced}>
        <InlineError message="Erro ao carregar o painel." onRetry={() => refetch()} />
      </View>
    );
  }
  if (!panel) return null;

  if (!panel.hasAccounts || panel.available === null || panel.available === undefined) {
    return (
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Accounts")}>
        <Block style={styles.spaced}>
          <AppText variant="baseStrong">Quanto você pode gastar de verdade?</AppText>
          <AppText variant="body" tone="muted" style={styles.gapTop}>
            Cadastre sua conta principal e o cartão para ver o dinheiro livre depois da fatura e dos boletos.
          </AppText>
        </Block>
      </Pressable>
    );
  }

  const salary = panel.salary;
  const free = toNumber(panel.free);
  const isShort = panel.free != null && free < 0;
  const horizon = formatShortDate(panel.horizonDate);

  return (
    <>
      {isShort ? (
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("MonthPlan")}>
          <View style={[styles.spaced, styles.alert]}>
            <AppText variant="label" tone="danger">
              Faltam {formatMoney(-free, currency.symbol)} na conta até {horizon}, antes do salário
            </AppText>
            <AppText variant="caption" style={styles.gapTop}>
              O que vence na conta principal até {horizon} passa do saldo. Ver compromissos ›
            </AppText>
          </View>
        </Pressable>
      ) : null}
      {salary?.pending && salary.cycleStartDate ? (
        <View style={styles.spaced}>
          <SalaryBanner amount={salary.amount} date={salary.cycleStartDate} />
        </View>
      ) : null}
      {salary && !salary.configured ? (
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("SalarySettings")} style={styles.spaced}>
          <AppText variant="caption">
            Cadastre seu salário para o app contar até o próximo pagamento e montar o ciclo sozinho.{" "}
            <AppText variant="caption" tone="accent">Cadastrar</AppText>
          </AppText>
        </Pressable>
      ) : null}
    </>
  );
}

/**
 * "Dinheiro na conta": the main account's balance and what leaves it until the eve of the
 * next salary, with the list of commitments. A detail of the Planejamento, not a main number.
 */
export function FinancePanel() {
  const navigation = useNavigation<Navigation>();
  const { panel } = useFinancePanel();
  const [expanded, setExpanded] = useState(false);

  if (!panel?.hasAccounts || panel.available === null || panel.available === undefined) return null;

  const commitments = panel.commitments?.filter((c) => c !== null) ?? [];
  const salary = panel.salary;
  const horizonLabel = salary?.configured
    ? `até o salário de ${formatShortDate(salary.nextSalaryDate)}`
    : `até ${formatShortDate(panel.horizonDate)}`;

  return (
    <Block style={styles.spaced}>
      <View style={styles.header}>
        <AppText variant="label">Dinheiro na conta</AppText>
        <AppText variant="caption">{horizonLabel}</AppText>
      </View>
      <View style={styles.figures}>
        <Figure label="Tenho" value={panel.available} />
        <Figure label="Comprometido" value={panel.committed} tone="muted" />
        <Figure label="Sobra na conta" value={panel.free} />
      </View>
      <Pressable accessibilityRole="button" onPress={() => setExpanded((v) => !v)} hitSlop={8} style={styles.toggle}>
        <AppText variant="label" tone="accent">
          {expanded ? "Esconder compromissos" : `Ver compromissos (${commitments.length})`}
        </AppText>
      </Pressable>
      {expanded ? (
        <View style={styles.gapTop}>
          <CommitmentList
            items={commitments}
            onOpenInvoice={(cardId, month) => navigation.navigate("Invoice", { cardId, month })}
            onOpenBills={(month) => navigation.navigate("Bills", { month })}
          />
        </View>
      ) : null}
      <AppText variant="caption" style={styles.gapTop}>
        Só o que sai da conta principal antes do salário. O que dá para gastar no ciclo está no plano acima.
      </AppText>
    </Block>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginBottom: space.lg,
  },
  spaced: {
    marginBottom: space.lg,
  },
  gapTop: {
    marginTop: space.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    marginBottom: space.sm,
  },
  figures: {
    flexDirection: "row",
    gap: space.md,
  },
  figure: {
    flex: 1,
    minWidth: 0,
  },
  alert: {
    padding: space.md,
    borderRadius: radius.block,
    borderWidth: 1,
    borderColor: palette.danger,
    backgroundColor: palette.dangerSoft,
  },
  toggle: {
    alignSelf: "flex-start",
    paddingTop: space.md,
  },
});
