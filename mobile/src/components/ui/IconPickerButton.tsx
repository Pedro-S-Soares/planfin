import { TouchableOpacity } from "react-native";
import { CategoryIcon } from "./CategoryIcon";
import { palette, radius } from "../../theme";
import { Text } from "./Text";

interface IconPickerButtonProps {
  icon: string | null;
  name: string;
  size?: number;
  onPress: () => void;
}

// Square trigger that previews the chosen icon and opens the IconPicker.
export function IconPickerButton({ icon, name, size = 40, onPress }: IconPickerButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Escolher ícone"
      style={{
        width: size,
        height: size,
        borderRadius: radius.control,
        borderWidth: 1.5,
        borderColor: palette.rule,
        backgroundColor: palette.sheet,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon ? (
        <CategoryIcon icon={icon} name={name} size={20} />
      ) : (
        <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>ícone</Text>
      )}
    </TouchableOpacity>
  );
}
