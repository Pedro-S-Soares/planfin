import { ActivityIndicator, View } from "react-native";
import { Logo } from "./Logo";
import { palette } from "../../theme";
import { Text } from "./Text";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: palette.paper, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <Logo size={56} />
      <ActivityIndicator color={palette.accent} size="large" />
      {message && (
        <Text style={{ fontSize: 14, color: palette.muted }}>{message}</Text>
      )}
    </View>
  );
}
