import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../../components/ui/Card";
import { InlineError } from "../../../components/ui/InlineError";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { useFinancePanel } from "../use-finance-panel";
import { CommitmentList } from "./CommitmentList";
import { SalaryBanner } from "./SalaryBanner";
import type { AppStackParamList, MainTabParamList } from "../../../../App";

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<AppStackParamList>
>;

function Figure({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.6 }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: "800", color: tone ?? Colors.text, marginTop: 3 }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

export function FinancePanel() {
  const navigation = useNavigation<Navigation>();
  const { currency } = useCurrency();
  const { panel, loading, error, refetch } = useFinancePanel();
  const [expanded, setExpanded] = useState(false);

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginBottom: 12 }} />;
  if (error) {
    return (
      <View style={{ marginBottom: 12 }}>
        <InlineError message="Erro ao carregar o painel." onRetry={() => refetch()} />
      </View>
    );
  }
  if (!panel) return null;

  if (!panel.hasAccounts || panel.available === null || panel.available === undefined) {
    return (
      <TouchableOpacity onPress={() => navigation.navigate("Accounts")} activeOpacity={0.85}>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.text }}>Quanto você pode gastar de verdade?</Text>
          <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4 }}>
            Cadastre sua conta principal e o cartão para ver o dinheiro livre depois da fatura e dos boletos. ›
          </Text>
        </Card>
      </TouchableOpacity>
    );
  }

  const free = toNumber(panel.free);
  const commitments = panel.commitments?.filter((c) => c !== null) ?? [];
  const salary = panel.salary;
  const horizonLabel = salary?.configured
    ? `até o salário de ${formatShortDate(salary.nextSalaryDate)}`
    : `até ${formatShortDate(panel.horizonDate)}`;

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>DINHEIRO NA CONTA</Text>
        <Text style={{ fontSize: 11, color: Colors.textTer }}>{horizonLabel}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Figure label="TENHO" value={formatMoney(panel.available, currency.symbol)} />
        <Figure label="COMPROMETIDO" value={formatMoney(panel.committed, currency.symbol)} tone={Colors.textSec} />
      </View>
      <View
        style={{
          marginTop: 12,
          borderRadius: Radius.md,
          padding: 12,
          backgroundColor: free < 0 ? Colors.dangerLight : Colors.successLight,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", color: free < 0 ? Colors.danger : Colors.successText, letterSpacing: 0.6 }}>
          POSSO GASTAR
        </Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: free < 0 ? Colors.danger : Colors.successText, marginTop: 2 }}>
          {formatMoney(free, currency.symbol)}
        </Text>
        {free < 0 ? (
          <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 2 }}>
            Falta dinheiro para cobrir o que vence antes do próximo salário.
          </Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} activeOpacity={0.7} style={{ paddingTop: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>
          {expanded ? "Esconder compromissos" : `Ver compromissos (${commitments.length})`}
        </Text>
      </TouchableOpacity>
      {expanded ? (
        <View style={{ marginTop: 8 }}>
          <CommitmentList
            items={commitments}
            onOpenInvoice={(cardId, month) => navigation.navigate("Invoice", { cardId, month })}
            onOpenBills={(month) => navigation.navigate("Bills", { month })}
          />
        </View>
      ) : null}

      {salary?.pending && salary.cycleStartDate ? <SalaryBanner amount={salary.amount} date={salary.cycleStartDate} /> : null}
      {salary && !salary.configured ? (
        <TouchableOpacity onPress={() => navigation.navigate("SalarySettings")} activeOpacity={0.7} style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 12, color: Colors.textSec }}>
            Cadastre seu salário para o app contar até o próximo pagamento e montar o ciclo sozinho. ›
          </Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}
