import { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { useSetPartnerIncomeMutation, type CycleBlockFieldsFragment } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { toISODate } from "../../../lib/date";
import { formatMoney, formatMonth, toNumber } from "../format";
import { palette, radius } from "../../../theme";
import { Text } from "../../../components/ui/Text";
import { TextInput } from "../../../components/ui/TextInput";

type PartnerIncomeRowProps = {
  /** YYYY-MM of the salary that pays the block's invoice. */
  month: string;
  partner: CycleBlockFieldsFragment["partner"];
};

const DEFAULT_LABEL = "Salário da esposa";

/** The partner's salary of the month, typed month by month: it varies a lot. */
export function PartnerIncomeRow({ month, partner }: PartnerIncomeRowProps) {
  const { currency } = useCurrency();
  const saved = partner ? formatCents(Math.round(toNumber(partner.amount) * 100)) : "";
  const [draft, setDraft] = useState<string | null>(null);
  const [save, { loading }] = useSetPartnerIncomeMutation({
    refetchQueries: ["CyclePlan", "BillOccurrences"],
    onCompleted: () => setDraft(null),
    onError: () => undefined, // o toast global avisa o erro
  });

  const label = `${partner?.label ?? DEFAULT_LABEL} · ${formatMonth(month)}`;

  if (partner?.received) {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.rule }}>
        <Text style={{ flex: 1, fontSize: 14, color: palette.ink }}>{label}</Text>
        <Text style={{ fontSize: 13, color: palette.muted }}>Recebido ({formatMoney(partner.amount, currency.symbol)}, já no saldo)</Text>
      </View>
    );
  }

  const value = draft ?? saved;
  const isDirty = draft !== null && draft !== saved;
  const handleSave = () => {
    const cents = parseCents(value);
    save({ variables: { month, amount: cents > 0 ? displayToAPI(value) : null, today: toISODate(new Date()) } });
  };

  return (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.rule }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: 14, color: palette.ink }}>+ {label}</Text>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          width: 130,
          height: 36,
          borderRadius: radius.control,
          borderWidth: 1.5,
          borderColor: isDirty ? palette.accent : palette.rule,
          paddingHorizontal: 8,
          overflow: "hidden",
        }}>
          <Text style={{ fontSize: 13, color: palette.muted, marginRight: 4 }}>{currency.symbol}</Text>
          <TextInput
            value={value}
            placeholder="0,00"
            placeholderTextColor={palette.muted}
            keyboardType="numeric"
            onChangeText={(raw) => setDraft(formatCents(parseInt(raw.replace(/\D/g, ""), 10) || 0))}
            // On web a TextInput keeps its intrinsic width and overflows the row without minWidth/width.
            style={{ flex: 1, minWidth: 0, width: "100%", fontSize: 14, fontWeight: "700", color: palette.income, textAlign: "right" }}
          />
        </View>
      </View>
      {isDirty ? (
        <TouchableOpacity onPress={handleSave} disabled={loading} style={{ alignSelf: "flex-end", marginTop: 6 }}>
          {loading ? (
            <ActivityIndicator size="small" color={palette.accent} />
          ) : (
            <Text style={{ fontSize: 13, fontWeight: "700", color: palette.accent }}>Salvar valor previsto</Text>
          )}
        </TouchableOpacity>
      ) : !partner ? (
        <Text style={{ fontSize: 12, color: palette.muted, marginTop: 2 }}>Digite o valor previsto deste mês.</Text>
      ) : null}
    </View>
  );
}
