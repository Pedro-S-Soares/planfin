import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useFinancePanelQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";

/** "Dinheiro livre" panel data, refreshed whenever the screen regains focus. */
export function useFinancePanel() {
  const query = useFinancePanelQuery({
    variables: { today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });
  const { refetch } = query;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return {
    panel: query.data?.financePanel ?? null,
    loading: query.loading && !query.data,
    error: query.error,
    refetch,
  };
}
