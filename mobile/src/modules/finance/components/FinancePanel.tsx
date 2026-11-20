import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "../../../components/ui/AppText";
import { Block } from "../../../components/ui/Block";
import { MoneyText } from "../../../components/ui/MoneyText";
import { InlineError } from "../../../components/ui/InlineError";
import { palette, space } from "../../../theme";
import { formatShortDate } from "../format";
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

export function FinancePanel() {
  const navigation = useNavigation<Navigation>();
  const { panel, loading, error, refetch } = useFinancePanel();
  const [expanded, setExpanded] = useState(false);

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

      {salary?.pending && salary.cycleStartDate ? <SalaryBanner amount={salary.amount} date={salary.cycleStartDate} /> : null}
      {salary && !salary.configured ? (
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("SalarySettings")} style={styles.gapTop}>
          <AppText variant="caption">
            Cadastre seu salário para o app contar até o próximo pagamento e montar o ciclo sozinho.{" "}
            <AppText variant="caption" tone="accent">Cadastrar</AppText>
          </AppText>
        </Pressable>
      ) : null}
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
  toggle: {
    alignSelf: "flex-start",
    paddingTop: space.md,
  },
});
