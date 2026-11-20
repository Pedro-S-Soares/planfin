import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { palette, radius, space } from "../../theme";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "secondary" | "destructive";
type ButtonSize = "md" | "sm";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /**
   * primary: solid accent, the one main action of a screen. secondary: accent-soft.
   * destructive: danger text with no fill; the caller always asks for confirmation.
   */
  variant?: ButtonVariant;
  /** md: 48 high (forms, sheets). sm: 36 high (headers, inline actions). */
  size?: ButtonSize;
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  /** Small glyph before the label (e.g. a "+" icon). */
  leading?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const TEXT_TONE = { primary: "onAccent", secondary: "accent", destructive: "danger" } as const;

/** The app's button: no gradients, radius 8, Manrope 16/600. */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  isFullWidth = true,
  isDisabled = false,
  isLoading = false,
  leading,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const isInactive = isDisabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={isInactive}
      aria-busy={isLoading}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        styles[variant],
        isFullWidth ? styles.fullWidth : null,
        pressed ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "primary" ? palette.onAccent : palette[TEXT_TONE[variant]]} />
      ) : (
        <View style={styles.content}>
          {leading}
          <AppText
            variant={size === "sm" ? "label" : "baseStrong"}
            tone={TEXT_TONE[variant]}
            numberOfLines={1}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  md: { height: 48 },
  sm: { height: 36, paddingHorizontal: space.md },
  primary: { backgroundColor: palette.accent },
  secondary: { backgroundColor: palette.accentSoft },
  destructive: { backgroundColor: "transparent" },
  fullWidth: { alignSelf: "stretch" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  content: { flexDirection: "row", alignItems: "center", gap: space.xs },
});
