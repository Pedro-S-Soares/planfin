import { View, Text, TouchableOpacity } from "react-native";
import { Colors, Radius } from "../../theme/tokens";

type Props = {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

export function ProfileMenuItem({ icon, label, subtitle, onPress, danger }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: Radius.sm,
        backgroundColor: danger ? "#FEF2F2" : Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: danger ? Colors.danger : Colors.text }}>
          {label}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 1 }}>{subtitle}</Text>
        )}
      </View>
      <Text style={{ fontSize: 16, color: Colors.textTer }}>›</Text>
    </TouchableOpacity>
  );
}
