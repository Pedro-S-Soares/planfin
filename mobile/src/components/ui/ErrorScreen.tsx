import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Shadow } from "../../theme/tokens";
import { Logo } from "./Logo";

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message = "Algo deu errado.", onRetry }: ErrorScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 }}>
      <Logo size={56} />
      <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.text, textAlign: "center", marginTop: 4 }}>
        {message}
      </Text>
      <Text style={{ fontSize: 14, color: Colors.textSec, textAlign: "center" }}>
        Verifique sua conexão e tente novamente.
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.85} style={{ width: "100%", marginTop: 8 }}>
          <LinearGradient
            colors={[Colors.gradStart, Colors.gradEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 52,
              borderRadius: Radius.md,
              alignItems: "center",
              justifyContent: "center",
              ...Shadow.md,
              shadowColor: Colors.fabShadow,
              shadowOpacity: 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15.5, fontWeight: "700", letterSpacing: -0.15 }}>
              Tentar novamente
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}
