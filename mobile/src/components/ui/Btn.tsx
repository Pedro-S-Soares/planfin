import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius, Shadow } from "../../theme/tokens";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "white";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const heights: Record<BtnSize, number> = { sm: 42, md: 52, lg: 56 };
const fontSizes: Record<BtnSize, number> = { sm: 14, md: 15.5, lg: 17 };

export function Btn({
  label,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth = true,
  disabled,
  loading,
}: BtnProps) {
  const h = heights[size];
  const fs = fontSizes[size];
  const isDisabled = disabled || loading;

  const base = {
    height: h,
    borderRadius: Radius.md,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 20,
    width: fullWidth ? ("100%" as const) : undefined,
    opacity: isDisabled ? 0.5 : 1,
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={!isDisabled ? onPress : undefined}
        activeOpacity={0.85}
        disabled={isDisabled}
        style={{ width: fullWidth ? "100%" : undefined }}
      >
        <LinearGradient
          colors={[Colors.gradStart, Colors.gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[base, Shadow.md, { shadowColor: Colors.fabShadow, shadowOpacity: 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: fs, fontWeight: "700", letterSpacing: -0.15 }}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<Exclude<BtnVariant, "primary">, object> = {
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: Colors.primary,
    },
    ghost: {
      backgroundColor: Colors.primaryLight,
    },
    danger: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: Colors.danger,
    },
    white: {
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.25)",
    },
  };

  const variantTextColors: Record<Exclude<BtnVariant, "primary">, string> = {
    secondary: Colors.primary,
    ghost: Colors.primaryText,
    danger: Colors.danger,
    white: "#fff",
  };

  return (
    <TouchableOpacity
      onPress={!isDisabled ? onPress : undefined}
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[base, variantStyles[variant]]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "white" ? "#fff" : Colors.primary} />
      ) : (
        <Text style={{ color: variantTextColors[variant], fontSize: fs, fontWeight: "700", letterSpacing: -0.15 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
