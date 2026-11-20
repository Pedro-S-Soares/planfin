import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet } from "react-native";
import { palette, radius } from "../../theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconButtonProps {
  icon: IconName;
  /** Read by screen readers; an icon alone says nothing. */
  accessibilityLabel: string;
  onPress: () => void;
  /** soft: accent on accent-soft (inline actions). plain: muted glyph on paper (close). */
  tone?: "soft" | "plain";
}

/** A 32px round icon action with a 44px touch area. */
export function IconButton({ icon, accessibilityLabel, onPress, tone = "soft" }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, tone === "soft" ? styles.soft : styles.plain, pressed ? styles.pressed : null]}
    >
      <MaterialCommunityIcons name={icon} size={18} color={tone === "soft" ? palette.accent : palette.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  soft: { backgroundColor: palette.accentSoft },
  plain: { backgroundColor: palette.paper },
  pressed: { opacity: 0.7 },
});
