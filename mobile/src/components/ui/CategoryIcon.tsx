import { View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { isIconName } from "./icons/curated-icons";
import { categoryColor } from "../../theme/tokens";

interface CategoryIconProps {
  icon?: string | null;
  name: string;
  size?: number;
  color?: string;
}

// Renders the category's MaterialCommunityIcons glyph, falling back to the
// colored dot when the category has no icon or an unknown icon name.
export function CategoryIcon({ icon, name, size = 18, color }: CategoryIconProps) {
  const tint = color ?? categoryColor(name).dot;

  if (isIconName(icon)) {
    return <MaterialCommunityIcons name={icon} size={size} color={tint} />;
  }

  const dotSize = Math.max(6, Math.round(size / 2));
  return (
    <View style={{ width: dotSize, height: dotSize, borderRadius: 999, backgroundColor: tint }} />
  );
}
