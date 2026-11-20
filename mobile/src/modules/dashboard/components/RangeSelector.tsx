import { Pressable, View } from "react-native";
import type { RangeKey } from "../types";
import { palette, radius } from "../../../theme";
import { Text } from "../../../components/ui/Text";

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
        backgroundColor: palette.sheet,
        borderWidth: 1,
        borderColor: palette.rule,
        borderRadius: radius.control,
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
              borderRadius: radius.control,
              backgroundColor: selected ? palette.accent : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: selected ? "700" : "600", color: selected ? palette.sheet : palette.muted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
