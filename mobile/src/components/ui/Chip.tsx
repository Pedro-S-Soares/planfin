import { Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { isIconName } from "./icons/curated-icons";
import { Colors, Radius } from "../../theme/tokens";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dot?: string;
  // MaterialCommunityIcons glyph name; takes priority over `dot` when valid.
  icon?: string | null;
}

export function Chip({ label, selected, onPress, dot, icon }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 34,
        paddingHorizontal: 13,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: selected ? Colors.primary : Colors.border,
        backgroundColor: selected ? Colors.primaryLight : Colors.surface,
      }}
    >
      {isIconName(icon) ? (
        <MaterialCommunityIcons name={icon} size={15} color={dot ?? Colors.textSec} />
      ) : dot ? (
        <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: dot }} />
      ) : null}
      <Text style={{
        fontSize: 13,
        fontWeight: selected ? "700" : "500",
        color: selected ? Colors.primaryText : Colors.textSec,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
