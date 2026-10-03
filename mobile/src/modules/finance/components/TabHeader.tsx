import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../../theme/tokens";

type TabHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function TabHeader({ title, subtitle, actionLabel, onAction }: TabHeaderProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        paddingTop: Platform.OS === "ios" ? 58 : 24,
        paddingBottom: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, letterSpacing: -0.4 }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          style={{
            backgroundColor: Colors.primaryLight,
            borderRadius: Radius.full,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: Colors.primaryText, fontWeight: "700", fontSize: 13 }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
