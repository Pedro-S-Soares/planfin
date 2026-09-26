import { Pressable, Text, View } from "react-native";
import type { CategoryTotal } from "../analytics";
import { ChartColors } from "../charts/chart-tokens";
import { percent, signedPercent, type MoneyFormat } from "../use-money";
import { Colors, Radius } from "../../../theme/tokens";

type CategoryRankingProps = {
  categories: CategoryTotal[];
  format: MoneyFormat;
  /** False when there is no earlier window of the same size to compare with */
  compared: boolean;
  onSelect: (categoryId: string) => void;
};

export function CategoryRanking({ categories, format, compared, onSelect }: CategoryRankingProps) {
  const max = Math.max(...categories.map((c) => c.total), 1);

  return (
    <View style={{ gap: 4 }}>
      {categories.map((c) => {
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            accessibilityRole="link"
            accessibilityLabel={`${c.name}: ${format.money(c.total)}, ${percent(c.share)} do total`}
            style={({ pressed }) => ({
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 12,
              marginHorizontal: -12,
              borderRadius: Radius.md,
              backgroundColor: pressed ? ChartColors.track : "transparent",
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c.color }} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: Colors.text }}>{c.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: Colors.text }}>{format.money(c.total)}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: ChartColors.track, overflow: "hidden" }}>
                <View
                  style={{
                    width: `${(c.total / max) * 100}%`,
                    height: 10,
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                    backgroundColor: c.color,
                  }}
                />
              </View>
              <Text style={{ width: 36, textAlign: "right", fontSize: 12, fontWeight: "600", color: Colors.textSec }}>
                {percent(c.share)}
              </Text>
              {compared ? (
              <Text
                style={{
                  width: 52,
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: "700",
                  color: c.delta !== null && c.delta > 0.05 ? ChartColors.overText : Colors.textSec,
                }}
              >
                {c.delta === null ? "novo" : signedPercent(c.delta)}
              </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
