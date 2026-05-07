import { Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../theme/tokens";

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
      backgroundColor: Colors.dangerLight,
      borderRadius: Radius.sm,
      paddingVertical: 10,
      paddingHorizontal: 12,
    }}>
      <Text style={{ fontSize: 13, color: Colors.danger, flex: 1 }}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.7} style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" }}>
            Tentar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
