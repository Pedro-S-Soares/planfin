import { Text } from "react-native";
import { Colors } from "../../../theme/tokens";

export function FormLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        color: Colors.textSec,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}
