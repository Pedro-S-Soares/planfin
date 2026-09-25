import { Text, View } from "react-native";
import type { CategoryTotal } from "../analytics";
import { tint } from "../palette";
import { inset, squarify } from "../treemap";
import { percent, type MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

type CategoryTreemapProps = { categories: CategoryTotal[]; width: number; height: number; format: MoneyFormat };

const GAP = 2;
const BAND = 30;

export function CategoryTreemap({ categories, width, height, format }: CategoryTreemapProps) {
  const blocks = squarify(
    categories.map((c) => ({ value: c.total, item: c })),
    { x: 0, y: 0, w: width, h: height },
  ).map((b) => ({ ...inset(b, GAP), item: b.item }));

  return (
    <View style={{ width, height }} accessibilityLabel="Mapa de gastos por categoria e subcategoria">
      {blocks.map((b) => {
        const band = b.h >= BAND * 2 && b.w >= 60 ? BAND : 0;
        const tiles = squarify(
          b.item.subcategories.map((s) => ({ value: s.total, item: s })),
          { x: b.x, y: b.y + band, w: b.w, h: b.h - band },
        ).map((t) => ({ ...inset(t, GAP), item: t.item }));

        return (
          <View key={b.item.id}>
            {band > 0 ? (
              <View
                style={{
                  position: "absolute",
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: band - GAP,
                  borderTopWidth: 3,
                  borderTopColor: b.item.color,
                  paddingHorizontal: 6,
                  paddingTop: 5,
                  overflow: "hidden",
                }}
              >
                <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "800", color: Colors.text }}>
                  {b.item.name}
                  <Text style={{ fontWeight: "400", color: Colors.textSec }}> {percent(b.item.share)}</Text>
                </Text>
              </View>
            ) : null}
            {tiles.map((t, i) => {
              const showLabel = t.w >= 72 && t.h >= 44;
              return (
                <View
                  key={t.item.name}
                  accessibilityLabel={`${b.item.name}, ${t.item.name}: ${format.money(t.item.total)}`}
                  style={{
                    position: "absolute",
                    left: t.x,
                    top: t.y,
                    width: t.w,
                    height: t.h,
                    borderRadius: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    overflow: "hidden",
                    backgroundColor: tint(b.item.color, i === 0 ? 0.62 : 0.78),
                  }}
                >
                  {showLabel ? (
                    <>
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>
                        {t.item.name}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 12, color: "#3A3857" }}>
                        {format.money(t.item.total)}
                      </Text>
                    </>
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
