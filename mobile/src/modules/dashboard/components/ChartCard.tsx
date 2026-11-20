import { ReactNode, useState } from "react";
import { LayoutChangeEvent, View, ViewStyle } from "react-native";
import { Block } from "../../../components/ui/Block";
import { palette } from "../../../theme";
import { Text } from "../../../components/ui/Text";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  /** Legend or controls shown to the right of the title */
  aside?: ReactNode;
  style?: ViewStyle;
  /** Receives the measured content width so charts can size themselves */
  children: (width: number) => ReactNode;
};

export function ChartCard({ title, subtitle, aside, style, children }: ChartCardProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.floor(e.nativeEvent.layout.width));

  return (
    <Block padding={24} style={{ gap: 16, ...style }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flexShrink: 1, gap: 4 }}>
          <Text accessibilityRole="header" style={{ fontSize: 17, fontWeight: "800", color: palette.ink }}>
            {title}
          </Text>
          {subtitle ? <Text style={{ fontSize: 13, color: palette.muted }}>{subtitle}</Text> : null}
        </View>
        {aside ? <View style={{ flexShrink: 1, maxWidth: "100%" }}>{aside}</View> : null}
      </View>
      <View onLayout={onLayout}>{width > 0 ? children(width) : <View style={{ height: 120 }} />}</View>
    </Block>
  );
}

type LegendItem = { label: string; color: string; shape?: "square" | "line" | "dashed" };

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {item.shape === "line" || item.shape === "dashed" ? (
            <View
              style={{
                width: 16,
                height: 0,
                borderTopWidth: 2,
                borderColor: item.color,
                borderStyle: item.shape === "dashed" ? "dashed" : "solid",
              }}
            />
          ) : (
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color }} />
          )}
          <Text style={{ fontSize: 12, color: palette.muted }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
