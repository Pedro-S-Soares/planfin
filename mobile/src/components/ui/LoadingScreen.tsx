import { ActivityIndicator, Text, View } from "react-native";
import { Colors } from "../../theme/tokens";
import { Logo } from "./Logo";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <Logo size={56} />
      <ActivityIndicator color={Colors.primary} size="large" />
      {message && (
        <Text style={{ fontSize: 14, color: Colors.textSec }}>{message}</Text>
      )}
    </View>
  );
}
