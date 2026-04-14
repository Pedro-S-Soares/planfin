import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePeriod, ACTIVE_PERIOD_QUERY } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import type { AppStackParamList } from "../../App";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const TODAY_EXPENSES_QUERY = gql`
  query TodayExpenses($periodId: ID!) {
    expenseHistory(periodId: $periodId) {
      date
      total
      expenses {
        id
        amount
        note
        subcategory {
          name
          category_id
        }
      }
    }
  }
`;

type Expense = {
  id: string;
  amount: string;
  note: string | null;
  subcategory: { name: string; category_id: string } | null;
};

type ExpenseDay = {
  date: string;
  total: string;
  expenses: Expense[];
};

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function HomeScreen() {
  const { period } = usePeriod();
  const { signOut } = useAuth();
  const navigation = useNavigation<Navigation>();

  const today = period?.today;
  const balance = today?.availableBalance ?? "0.00";
  const isPositive = parseFloat(balance) >= 0;

  const { data, loading } = useQuery<{ expenseHistory: ExpenseDay[] }>(TODAY_EXPENSES_QUERY, {
    variables: { periodId: period?.id },
    skip: !period?.id,
    fetchPolicy: "network-only",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayExpenses = data?.expenseHistory.find((d: ExpenseDay) => d.date === todayStr)?.expenses ?? [];

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => signOut(),
    onError: () => signOut(),
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planfin</Text>
        <TouchableOpacity onPress={() => logout()}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Balance card */}
      <View style={[styles.balanceCard, isPositive ? styles.balancePositive : styles.balanceNegative]}>
        <Text style={styles.balanceLabel}>Disponível hoje</Text>
        <Text style={styles.balanceValue}>
          R$ {parseFloat(balance).toFixed(2).replace(".", ",")}
        </Text>
        {period && (
          <Text style={styles.periodInfo}>
            Limite diário: R$ {parseFloat(period.dailyLimit).toFixed(2).replace(".", ",")}
          </Text>
        )}
      </View>

      {/* Today's expenses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gastos de hoje</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : todayExpenses.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum gasto registrado hoje.</Text>
        ) : (
          <FlatList
            data={todayExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseCategory}>
                    {item.subcategory?.name ?? "Sem categoria"}
                  </Text>
                  {item.note ? <Text style={styles.expenseNote}>{item.note}</Text> : null}
                </View>
                <Text style={styles.expenseAmount}>
                  R$ {parseFloat(item.amount).toFixed(2).replace(".", ",")}
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  balancePositive: {
    backgroundColor: "#2563EB",
  },
  balanceNegative: {
    backgroundColor: "#ef4444",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 8,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },
  periodInfo: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  expenseNote: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
});
