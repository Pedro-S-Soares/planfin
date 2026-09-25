import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { MonthStack } from "../analytics";
import { AxisTextStyle, ChartColors } from "../charts/chart-tokens";
import { barPath, hLines, niceTicks, rectPath } from "../charts/scale";
import type { CategoryInfo } from "../types";
import type { MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

type MonthlyStackChartProps = {
  months: MonthStack[];
  categoryIds: string[];
  categories: Map<string, CategoryInfo>;
  width: number;
  format: MoneyFormat;
};

const HEIGHT = 280;
const LEFT = 56;
const TOP = 24;
const BOTTOM = 28;
const SEGMENT_GAP = 2;

export function MonthlyStackChart({ months, categoryIds, categories, width, format }: MonthlyStackChartProps) {
  const pw = width - LEFT - 8;
  const ph = HEIGHT - TOP - BOTTOM;
  const slot = pw / months.length;
  const bw = Math.min(64, slot * 0.55);
  const ticks = niceTicks(Math.max(...months.map((m) => m.total), 1) * 1.05);
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => TOP + ph * (1 - v / yMax);

  const paths = new Map<string, string>(categoryIds.map((id) => [id, ""]));
  months.forEach((m, mi) => {
    const x = LEFT + mi * slot + (slot - bw) / 2;
    const present = categoryIds.filter((id) => (m.values.get(id) ?? 0) > 0);
    let base = 0;
    present.forEach((id, i) => {
      const v = m.values.get(id) ?? 0;
      const top = y(base + v);
      const bottom = y(base);
      const isLast = i === present.length - 1;
      const d = isLast ? barPath(x, top, bw, bottom - top) : rectPath(x, top + SEGMENT_GAP, bw, bottom - top - SEGMENT_GAP);
      paths.set(id, (paths.get(id) ?? "") + d);
      base += v;
    });
  });

  return (
    <View style={{ width, height: HEIGHT }} accessibilityLabel="Gasto mensal empilhado por categoria">
      <Svg width={width} height={HEIGHT} style={{ position: "absolute" }}>
        <Path d={hLines(ticks, y, LEFT, LEFT + pw)} stroke={ChartColors.grid} strokeWidth={1} />
        {categoryIds.map((id) => (
          <Path key={id} d={paths.get(id) ?? ""} fill={categories.get(id)?.color ?? ChartColors.reference} />
        ))}
      </Svg>
      {ticks.map((t) => (
        <Text key={t} style={[AxisTextStyle, { left: 0, width: 48, textAlign: "right", top: y(t) - 7 }]}>
          {format.compact(t)}
        </Text>
      ))}
      {months.map((m, mi) => (
        <View
          key={m.key}
          accessibilityLabel={`${m.label}: ${format.money(m.total)}`}
          style={{ position: "absolute", left: LEFT + mi * slot, width: slot, top: 0, height: HEIGHT }}
        >
          {m.total > 0 ? (
            <Text
              numberOfLines={1}
              style={{ position: "absolute", left: -8, right: -8, top: y(m.total) - 20, textAlign: "center", fontSize: slot >= 84 ? 12 : 10, fontWeight: "800", color: Colors.text }}
            >
              {slot >= 84
                ? format.money(m.total)
                : `${(m.total / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`}
            </Text>
          ) : null}
          <Text
            style={{ position: "absolute", left: 0, right: 0, bottom: 4, textAlign: "center", fontSize: 12, fontWeight: "600", color: Colors.textSec }}
          >
            {m.label}
            {m.partial ? "*" : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}
