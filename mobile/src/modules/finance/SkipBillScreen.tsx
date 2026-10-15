import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Btn } from "../../components/ui/Btn";
import { FieldInput } from "../../components/ui/FieldInput";
import { useSkipBillMutation } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { formatMonth } from "./format";
import type { AppStackParamList } from "../../../App";

/** Skips one month of a fixed bill without deleting it. */
export function SkipBillScreen() {
  usePageTitle("Planfin - Pular despesa fixa");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "SkipBill">>();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [skipBill, { loading }] = useSkipBillMutation({
    refetchQueries: ["BillOccurrences", "FinancePanel", "MonthPlan", "AllowancePlan"],
    onCompleted: () => navigation.goBack(),
    onError: (e) => setError(e.message),
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{params.name}</Text>
      <Text style={{ fontSize: 13, color: Colors.textSec, marginBottom: 18, lineHeight: 19 }}>
        Em {formatMonth(params.month)} ela não acontece: sai do comprometido e do planejamento
        {params.isCard ? " e não entra na fatura" : ""}. A despesa fixa continua cadastrada e volta no mês seguinte.
      </Text>
      <FieldInput
        label="Motivo (opcional)"
        value={note}
        onChange={setNote}
        placeholder="Ex.: Tobias não vai à creche este mês"
        maxLength={200}
      />
      {error ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <Btn
        label={`Pular ${formatMonth(params.month)}`}
        onPress={() =>
          skipBill({ variables: { billId: params.billId, month: params.month, note: note.trim() || null } })
        }
        loading={loading}
      />
    </ScrollView>
  );
}
