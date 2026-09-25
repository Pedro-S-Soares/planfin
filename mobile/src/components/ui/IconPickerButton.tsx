import { Text, TouchableOpacity } from "react-native";
import { CategoryIcon } from "./CategoryIcon";
import { Colors, Radius } from "../../theme/tokens";

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
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon ? (
        <CategoryIcon icon={icon} name={name} size={20} />
      ) : (
        <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.textTer }}>ícone</Text>
      )}
    </TouchableOpacity>
  );
}
