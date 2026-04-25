import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@apollo/client/react";
import { useLogoutMutation } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { toISODate } from "../lib/date";
import {
  EXPENSE_HISTORY_WITH_AUTHORS,
  type ExpenseDayWithAuthors,
  type ExpenseWithAuthor,
} from "../graphql/expenses";
import { BalanceCard } from "../components/ui/BalanceCard";
import { Card } from "../components/ui/Card";
import { ExpenseRow } from "../components/ui/ExpenseRow";
import { Colors, Radius, Shadow } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";
import type { AppStackParamList } from "../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;
type ExpenseHistoryData = { expenseHistory: ExpenseDayWithAuthors[] };

function authorLabel(author: ExpenseWithAuthor["createdBy"], currentUserId?: string) {
  if (!author) return null;
  if (currentUserId && author.id === currentUserId) return "Você";
  return author.email.split("@")[0];
}

export function HomeScreen() {
  usePageTitle("Planfin");
  const { period, refetch: refetchPeriod } = usePeriod();
  const { signOut, user } = useAuth();
  const { activeGroup } = useGroup();
  const navigation = useNavigation<Navigation>();

  const balance = period?.today?.availableBalance ?? "0.00";
  const isPositive = parseFloat(balance) >= 0;

  const todaySpent = (() => {
    const limit = parseFloat(period?.today?.dailyLimit ?? period?.dailyLimit ?? "0");
    const carryover = parseFloat(period?.today?.carryover ?? "0");
    const avail = parseFloat(balance);
    const spent = limit + carryover - avail;
    return Math.max(0, spent).toFixed(2);
  })();

  const daysLeft = (() => {
    if (!period?.endDate) return null;
    const end = new Date(period.endDate + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  })();

  const { data, loading, refetch: refetchHistory } = useQuery<ExpenseHistoryData>(
    EXPENSE_HISTORY_WITH_AUTHORS,
    {
      variables: { periodId: period?.id ?? "" },
      skip: !period?.id,
      fetchPolicy: "network-only",
    },
  );

  useFocusEffect(
    useCallback(() => {
      refetchPeriod();
      if (period?.id) refetchHistory();
    }, [refetchPeriod, refetchHistory, period?.id]),
  );

  const todayStr = toISODate(new Date());
  const todayExpenses = data?.expenseHistory?.find((d) => d.date === todayStr)?.expenses ?? [];

  const [logout] = useLogoutMutation({
    onCompleted: () => signOut(),
    onError: () => signOut(),
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.surface,
        paddingTop: 56,
        paddingBottom: 14,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.navigate("Groups")} style={{ flex: 1 }}>
          <Text style={{ fontSize: 19, fontWeight: "800", color: Colors.text, letterSpacing: -0.3 }}>
            Planfin
          </Text>
          {activeGroup && (
            <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: "600", marginTop: 1 }}>
              📍 {activeGroup.name} ▾
            </Text>
          )}
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          {/* Bell button — hidden until notifications are implemented
          <View style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: Colors.primaryLight,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{ fontSize: 15 }}>🔔</Text>
          </View>
          */}
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.8}>
            <LinearGradient
              colors={[Colors.gradStart, Colors.gradEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 14, color: "#fff", fontWeight: "700" }}>
                {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance card */}
        <BalanceCard
          available={balance}
          spent={todaySpent}
          dailyLimit={period?.dailyLimit ?? "0.00"}
          isPositive={isPositive}
        />

        {/* Period info strip */}
        {period && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 12 }}>
            {[
              { label: "Período", val: `${period.startDate?.slice(5, 7)}/` + `${period.startDate?.slice(0, 4)} – ${period.endDate?.slice(5, 7)}/${period.endDate?.slice(0, 4)}` },
              { label: "Dias restantes", val: daysLeft !== null ? `${daysLeft} dias` : "—" },
            ].map(({ label, val }) => (
              <Card key={label} padding={12} style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 }}>
                  {label}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>
                  {val}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Today's expenses */}
        <Card padding={16}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7, textTransform: "uppercase" }}>
              Gastos de hoje
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : todayExpenses.length === 0 ? (
            <Text style={{ textAlign: "center", color: Colors.textTer, fontSize: 14, paddingVertical: 16 }}>
              Nenhum gasto hoje.
            </Text>
          ) : (
            todayExpenses.map((item) => (
              <ExpenseRow
                key={item.id}
                item={item}
                onPress={() => navigation.navigate("EditExpense", {
                  id: item.id,
                  amount: item.amount,
                  date: item.date ?? todayStr,
                  note: item.note ?? undefined,
                  subcategoryId: item.subcategory?.id ?? undefined,
                  categoryId: undefined,
                })}
                authorLabel={authorLabel(item.createdBy, user?.id)}
              />
            ))
          )}
        </Card>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense")}
        activeOpacity={0.85}
        style={{ position: "absolute", bottom: 24, right: 18 }}
      >
        <LinearGradient
          colors={[Colors.gradStart, Colors.gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: Colors.fabShadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 26, lineHeight: 32, fontWeight: "300" }}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
