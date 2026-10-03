import { Switch, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../../theme/tokens";

type ToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function ToggleRow({ title, description, value, onChange }: ToggleRowProps) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: value ? Colors.primaryLight : Colors.bg,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: value ? Colors.primary : Colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: value ? Colors.primaryText : Colors.text }}>{title}</Text>
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#fff"
      />
    </TouchableOpacity>
  );
}
