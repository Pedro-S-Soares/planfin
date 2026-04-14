import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { usePeriod } from "../context/PeriodContext";

const EXPENSE_HISTORY_QUERY = gql`
  query ExpenseHistory($periodId: ID!) {
    expenseHistory(periodId: $periodId) {
      date
      total
      expenses {
        id
        amount
        note
        subcategory {
          id
          name
        }
      }
    }
  }
`;

const DELETE_EXPENSE_MUTATION = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

type Expense = {
  id: string;
  amount: string;
  note: string | null;
  subcategory: { id: string; name: string } | null;
};

type ExpenseDay = {
  date: string;
  total: string;
  expenses: Expense[];
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function HistoryScreen() {
  const { period } = usePeriod();

  const { data, loading, refetch } = useQuery<{ expenseHistory: ExpenseDay[] }>(
    EXPENSE_HISTORY_QUERY,
    {
      variables: { periodId: period?.id },
      skip: !period?.id,
      fetchPolicy: "network-only",
    }
  );

  const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const sections = (data?.expenseHistory ?? []).map((day: ExpenseDay) => ({
    title: day.date,
    total: day.total,
    data: day.expenses,
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nenhum gasto registrado ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionDate}>{formatDate(section.title)}</Text>
            <Text style={styles.sectionTotal}>
              Total: R$ {parseFloat(section.total).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseCategory}>
                {item.subcategory?.name ?? "Sem categoria"}
              </Text>
              {item.note ? <Text style={styles.expenseNote}>{item.note}</Text> : null}
            </View>
            <View style={styles.expenseRight}>
              <Text style={styles.expenseAmount}>
                R$ {parseFloat(item.amount).toFixed(2).replace(".", ",")}
              </Text>
              <TouchableOpacity
                onPress={() => deleteExpense({ variables: { id: item.id } })}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
  },
  list: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  sectionTotal: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
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
  expenseRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
});
