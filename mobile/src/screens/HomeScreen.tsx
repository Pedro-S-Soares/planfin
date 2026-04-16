import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
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
import type { AppStackParamList } from "../../App";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

type ExpenseHistoryData = { expenseHistory: ExpenseDayWithAuthors[] };

function authorLabel(author: ExpenseWithAuthor["createdBy"], currentUserId?: string) {
  if (!author) return null;
  if (currentUserId && author.id === currentUserId) return "Você";
  // Show the part before @ for a compact label
  return author.email.split("@")[0];
}

export function HomeScreen() {
  const { period, refetch: refetchPeriod } = usePeriod();
  const { signOut, user } = useAuth();
  const { activeGroup } = useGroup();
  const navigation = useNavigation<Navigation>();

  const balance = period?.today?.availableBalance ?? "0.00";
  const isPositive = parseFloat(balance) >= 0;

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
    <View className="flex-1 bg-neutral-100">
      <View className="flex-row justify-between items-center px-5 pt-14 pb-3 bg-white">
        <TouchableOpacity onPress={() => navigation.navigate("Groups")} className="flex-1">
          <Text className="text-xl font-bold">Planfin</Text>
          {activeGroup && (
            <Text className="text-xs text-neutral-500 mt-0.5">
              📍 {activeGroup.name}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => logout()}>
          <Text className="text-red-500 text-sm font-semibold">Sair</Text>
        </TouchableOpacity>
      </View>

      <View
        className={`m-4 p-6 rounded-2xl items-center ${
          isPositive ? "bg-blue-600" : "bg-red-500"
        }`}
      >
        <Text className="text-white/80 text-sm mb-2">Disponível hoje</Text>
        <Text className="text-white text-[42px] font-bold">
          {isPositive ? "" : "- "}R$ {Math.abs(parseFloat(balance)).toFixed(2).replace(".", ",")}
        </Text>
        {period && (
          <Text className="text-white/70 text-xs mt-2">
            Limite diário: R$ {parseFloat(period.dailyLimit ?? "0").toFixed(2).replace(".", ",")}
          </Text>
        )}
      </View>

      <View className="bg-white mx-4 rounded-xl p-4">
        <Text className="text-base font-semibold mb-3 text-neutral-700">Gastos de hoje</Text>

        {loading ? (
          <ActivityIndicator className="my-5" />
        ) : todayExpenses.length === 0 ? (
          <Text className="text-neutral-400 text-sm text-center py-4">
            Nenhum gasto registrado hoje.
          </Text>
        ) : (
          <FlatList
            data={todayExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const author = authorLabel(item.createdBy, user?.id);

              return (
                <View className="flex-row justify-between items-center py-2.5 border-b border-neutral-100">
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
                  <Text className="text-sm font-semibold text-neutral-700 ml-3">
                    R$ {parseFloat(item.amount).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              );
            }}
            scrollEnabled={false}
          />
        )}
      </View>

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-md"
        onPress={() => navigation.navigate("AddExpense")}
      >
        <Text className="text-white text-[28px] leading-8">+</Text>
      </TouchableOpacity>
    </View>
  );
}
