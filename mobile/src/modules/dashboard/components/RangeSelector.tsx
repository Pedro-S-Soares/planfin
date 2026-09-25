import { Pressable, Text, View } from "react-native";
import type { RangeKey } from "../types";
import { Colors, Radius } from "../../../theme/tokens";

type RangeSelectorProps = {
  options: { key: RangeKey; label: string }[];
  value: RangeKey;
  onChange: (key: RangeKey) => void;
};

export function RangeSelector({ options, value, onChange }: RangeSelectorProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Intervalo"
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 4,
        gap: 2,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.md,
        alignSelf: "flex-start",
      }}
    >
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.key)}
            style={{
              minHeight: 40,
              justifyContent: "center",
              paddingHorizontal: 14,
              borderRadius: Radius.sm,
              backgroundColor: selected ? Colors.primary : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: selected ? "700" : "600", color: selected ? Colors.surface : Colors.textSec }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
