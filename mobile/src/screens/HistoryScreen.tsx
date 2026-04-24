import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@apollo/client/react";
import {
  useDeleteExpenseMutation,
  ActivePeriodDocument,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import { formatDateBR } from "../lib/date";
import {
  EXPENSE_HISTORY_WITH_AUTHORS,
  type ExpenseDayWithAuthors,
  type ExpenseWithAuthor,
} from "../graphql/expenses";
import { Card } from "../components/ui/Card";
import { ExpenseRow } from "../components/ui/ExpenseRow";
import { Colors } from "../theme/tokens";
import type { AppStackParamList } from "../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;
type ExpenseHistoryData = { expenseHistory: ExpenseDayWithAuthors[] };

function authorLabel(author: ExpenseWithAuthor["createdBy"], currentUserId?: string) {
  if (!author) return null;
  if (currentUserId && author.id === currentUserId) return "Você";
  return author.email.split("@")[0];
}

export function HistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const { period, refetch: refetchPeriod } = usePeriod();
  const { user } = useAuth();

  const { data, loading, refetch } = useQuery<ExpenseHistoryData>(
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
      if (period?.id) refetch();
    }, [refetchPeriod, refetch, period?.id]),
  );

  const [deleteExpense] = useDeleteExpenseMutation({
    onCompleted: () => { refetch(); refetchPeriod(); },
    refetchQueries: [{ query: ActivePeriodDocument }],
  });

  const days = data?.expenseHistory ?? [];

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (days.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg }}>
        <Text style={{ color: Colors.textTer, fontSize: 15 }}>Nenhum gasto registrado ainda.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <FlatList
        data={days}
        keyExtractor={(day) => day.date}
        contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 16 }}
        renderItem={({ item: day }) => (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingHorizontal: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>
                {formatDateBR(day.date)}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSec, fontWeight: "600" }}>
                Total: R$ {parseFloat(day.total ?? "0").toFixed(2).replace(".", ",")}
              </Text>
            </View>
            <Card padding={12}>
              {day.expenses.map((item) => (
                <ExpenseRow
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate("EditExpense", {
                    id: item.id,
                    amount: item.amount,
                    date: item.date ?? day.date,
                    note: item.note ?? undefined,
                    subcategoryId: item.subcategory?.id ?? undefined,
                    categoryId: undefined,
                  })}
                  onDelete={(id) => deleteExpense({ variables: { id } })}
                  authorLabel={authorLabel(item.createdBy, user?.id)}
                />
              ))}
            </Card>
          </View>
        )}
      />
    </View>
  );
}
