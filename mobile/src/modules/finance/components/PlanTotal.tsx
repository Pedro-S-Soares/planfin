import { Text, View } from "react-native";
import { Colors } from "../../../theme/tokens";

/** Subtotal line of the plan ("= Resto após pagar a fatura"). */
export function PlanTotal({ label, value, tone, strong }: { label: string; value: string; tone?: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: strong ? 0 : 1, borderBottomColor: Colors.border }}>
      <Text style={{ fontSize: strong ? 15 : 14, fontWeight: strong ? "800" : "700", color: Colors.text }}>= {label}</Text>
      <Text style={{ fontSize: strong ? 15 : 14, fontWeight: "800", color: tone ?? Colors.text }}>{value}</Text>
    </View>
  );
}
