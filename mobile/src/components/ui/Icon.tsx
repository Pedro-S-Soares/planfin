import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, type PaletteColor } from "../../theme";

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  tone?: PaletteColor;
  /** Raw color, for category hues; wins over `tone`. */
  color?: string;
}

/**
 * The app's one icon set (Material Community Icons, the same family as the categories).
 * Decorative: screen readers skip it, the text next to it says what it is.
 */
export function Icon({ name, size = 20, tone = "muted", color }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color ?? palette[tone]}
      accessibilityElementsHidden
      importantForAccessibility="no"
      aria-hidden
    />
  );
}
