import { Text } from "react-native";
import { Ledger } from "../../../theme/tokens";

/** Field label in sentence case (no spaced capitals), as in the "extrato da casa" direction. */
export function FormLabel({ children }: { children: string }) {
  return <Text style={{ fontSize: 14, fontWeight: "600", color: Ledger.muted, marginBottom: 8 }}>{children}</Text>;
}
