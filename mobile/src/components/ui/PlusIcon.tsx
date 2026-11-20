import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, type PaletteColor } from "../../theme";

/** The "+" glyph in front of "Lançar". */
export function PlusIcon({ tone = "onAccent", size = 18 }: { tone?: PaletteColor; size?: number }) {
  return <MaterialCommunityIcons name="plus" size={size} color={palette[tone]} />;
}
