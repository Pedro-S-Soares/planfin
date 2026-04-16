import { useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from "react-native";
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
    onCompleted: () => {
      refetch();
      refetchPeriod();
    },
    refetchQueries: [{ query: ActivePeriodDocument }],
  });

  const sections = (data?.expenseHistory ?? []).map((day) => ({
    title: day.date,
    total: day.total,
    data: day.expenses,
  }));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-400 text-[15px]">Nenhum gasto registrado ainda.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-14 bg-neutral-100">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="py-3 px-4"
        renderSectionHeader={({ section }) => (
          <View className="flex-row justify-between items-center py-2 px-1 mt-2">
            <Text className="text-sm font-bold text-neutral-700">
              {formatDateBR(section.title)}
            </Text>
            <Text className="text-[13px] text-neutral-500 font-semibold">
              Total: R$ {parseFloat(section.total).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        )}
        renderItem={({ item, section }) => {
          const author = authorLabel(item.createdBy, user?.id);

          return (
            <TouchableOpacity
              className="flex-row justify-between items-center bg-white p-3.5 rounded-lg mb-1.5"
              onPress={() =>
                navigation.navigate("EditExpense", {
                  id: item.id,
                  amount: item.amount,
                  date: item.date ?? section.title,
                  note: item.note ?? undefined,
                  subcategoryId: item.subcategory?.id ?? undefined,
                  categoryId: undefined,
                })
              }
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-700">
                  {item.subcategory?.name ?? "Sem categoria"}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  {author && (
                    <Text className="text-xs text-neutral-400">{author}</Text>
                  )}
                  {item.note ? (
                    <Text className="text-xs text-neutral-400">
                      {author ? " · " : ""}
                      {item.note}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-sm font-semibold text-neutral-700">
                  R$ {parseFloat(item.amount).toFixed(2).replace(".", ",")}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteExpense({ variables: { id: item.id } })}
                  className="p-1"
                >
                  <Text className="text-red-500 text-sm font-semibold">✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
