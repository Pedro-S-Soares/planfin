import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Btn } from "../../../components/ui/Btn";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import { useReserveStatusQuery, useSetReserveGoalMutation } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { toISODate } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, toNumber } from "../format";

/** Emergency reserve against its optional goal. */
export function ReserveCard() {
  const { currency } = useCurrency();
  const { data } = useReserveStatusQuery({ variables: { today: toISODate(new Date()) }, fetchPolicy: "cache-and-network" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("0,00");
  const [setGoal, { loading }] = useSetReserveGoalMutation({
    refetchQueries: ["ReserveStatus"],
    onCompleted: () => setEditing(false),
  });

  const status = data?.reserveStatus;
  if (!status) return null;
  const total = toNumber(status.total);
  const goal = status.goal ? toNumber(status.goal) : null;
  const progress = goal ? Math.min(1, total / goal) : 0;
  const money = (v: number) => formatMoney(v, currency.symbol);

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>🛟 RESERVA DE EMERGÊNCIA</Text>
      <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, marginTop: 4 }}>{money(total)}</Text>
      {goal ? (
        <>
          <View style={{ height: 8, borderRadius: Radius.full, backgroundColor: Colors.bg, marginTop: 8, overflow: "hidden" }}>
            <View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: Colors.success }} />
          </View>
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 6 }}>
            {Math.round(progress * 100)}% da meta de {money(goal)}
            {total < goal ? ` · faltam ${money(goal - total)}` : " · meta atingida"}
          </Text>
        </>
      ) : null}
      {editing ? (
        <View style={{ marginTop: 12 }}>
          <CurrencyInput value={draft} onChange={setDraft} autoFocus />
          <Btn
            label="Salvar meta"
            size="sm"
            loading={loading}
            onPress={() => setGoal({ variables: { reserveGoal: parseCents(draft) > 0 ? displayToAPI(draft) : null } })}
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            setDraft(formatCents(Math.round((goal ?? 0) * 100)));
            setEditing(true);
          }}
          activeOpacity={0.7}
          style={{ marginTop: 10 }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>
            {goal ? "Alterar meta" : "Definir uma meta (opcional)"}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
