import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@apollo/client/react";
import {
  useDeleteExpenseMutation,
  ActivePeriodDocument,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
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
  const { currency } = useCurrency();

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

  const periodLabel = (() => {
    if (!period?.startDate || !period?.endDate) return null;
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const start = new Date(period.startDate + "T00:00:00");
    const end = new Date(period.endDate + "T00:00:00");
    return `${months[start.getMonth()]} ${start.getFullYear()} – ${months[end.getMonth()]} ${end.getFullYear()}`;
  })();

  const header = (
    <View style={{
      backgroundColor: Colors.surface,
      paddingTop: Platform.OS === "ios" ? 58 : 24,
      paddingBottom: 14,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, letterSpacing: -0.4 }}>
        Histórico
      </Text>
      {periodLabel && (
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
          Período: {periodLabel}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (days.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: Colors.textTer, fontSize: 15 }}>Nenhum gasto registrado ainda.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {header}
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
                Total: {currency.symbol} {parseFloat(day.total ?? "0").toFixed(2).replace(".", ",")}
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
