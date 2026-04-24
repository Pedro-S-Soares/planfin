import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Shadow } from "../../theme/tokens";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 48 }: LogoProps) {
  return (
    <LinearGradient
      colors={[Colors.gradStart, Colors.gradEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        alignItems: "center",
        justifyContent: "center",
        ...Shadow.md,
      }}
    >
      <Text style={{ fontSize: size * 0.46, color: "#fff", fontWeight: "800", lineHeight: size * 0.56 }}>
        P
      </Text>
    </LinearGradient>
  );
}
