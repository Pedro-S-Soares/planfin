import { useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useExpenseHistoryQuery,
  useDeleteExpenseMutation,
  ActivePeriodDocument,
  ExpenseHistoryQuery,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { formatDateBR } from "../lib/date";
import type { AppStackParamList } from "../../App";

type ExpenseDay = NonNullable<ExpenseHistoryQuery["expenseHistory"]>[number];
type Expense = NonNullable<NonNullable<ExpenseDay>["expenses"]>[number];

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function HistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const { period, refetch: refetchPeriod } = usePeriod();

  const { data, loading, refetch } = useExpenseHistoryQuery({
    variables: { periodId: period?.id ?? "" },
    skip: !period?.id,
    fetchPolicy: "network-only",
  });

  useFocusEffect(
    useCallback(() => {
      refetchPeriod();
      if (period?.id) refetch();
    }, [refetchPeriod, refetch, period?.id])
  );

  const [deleteExpense] = useDeleteExpenseMutation({
    onCompleted: () => {
      refetch();
      refetchPeriod();
    },
    refetchQueries: [{ query: ActivePeriodDocument }],
  });

  const sections = (data?.expenseHistory ?? []).map((day: ExpenseDay) => ({
    title: day?.date ?? "",
    total: day?.total ?? "0",
    data: (day?.expenses ?? []).filter(Boolean) as NonNullable<Expense>[],
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
        keyExtractor={(item) => item?.id ?? ""}
        contentContainerClassName="py-3 px-4"
        renderSectionHeader={({ section }) => (
          <View className="flex-row justify-between items-center py-2 px-1 mt-2">
            <Text className="text-sm font-bold text-neutral-700">{formatDateBR(section.title)}</Text>
            <Text className="text-[13px] text-neutral-500 font-semibold">
              Total: R$ {parseFloat(section.total).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <TouchableOpacity
            className="flex-row justify-between items-center bg-white p-3.5 rounded-lg mb-1.5"
            onPress={() =>
              navigation.navigate("EditExpense", {
                id: item?.id ?? "",
                amount: item?.amount ?? "0",
                date: item?.date ?? section.title,
                note: item?.note ?? undefined,
                subcategoryId: item?.subcategory?.id ?? undefined,
                categoryId: undefined,
              })
            }
            activeOpacity={0.7}
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-neutral-700">
                {item?.subcategory?.name ?? "Sem categoria"}
              </Text>
              {item?.note ? <Text className="text-xs text-neutral-400 mt-0.5">{item.note}</Text> : null}
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-semibold text-neutral-700">
                R$ {parseFloat(item?.amount ?? "0").toFixed(2).replace(".", ",")}
              </Text>
              <TouchableOpacity
                onPress={() => deleteExpense({ variables: { id: item?.id ?? "" } })}
                className="p-1"
              >
                <Text className="text-red-500 text-sm font-semibold">✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
