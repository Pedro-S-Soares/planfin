import { TouchableOpacity, View } from "react-native";
import { palette, radius } from "../../theme";
import { Text } from "./Text";

interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function InlineError({ message = "Erro ao carregar dados.", onRetry }: InlineErrorProps) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: palette.dangerSoft,
      borderRadius: radius.control,
      paddingVertical: 10,
      paddingHorizontal: 12,
    }}>
      <Text style={{ fontSize: 13, color: palette.danger, flex: 1 }}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.7} style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 13, color: palette.accent, fontWeight: "600", textDecorationLine: "underline" }}>
            Tentar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
