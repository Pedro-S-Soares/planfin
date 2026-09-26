import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { diffDays, addDays, formatDay } from "../analytics";
import { AxisTextStyle, ChartColors } from "../charts/chart-tokens";
import type { DateWindow, Fact } from "../types";
import type { MoneyFormat } from "../use-money";
import { Colors, Radius } from "../../../theme/tokens";

type ExpenseStripProps = {
  facts: Fact[];
  window: DateWindow;
  today: string;
  color: string;
  width: number;
  format: MoneyFormat;
};

const MAX_LANES = 6;
const LANE_H = 58;
const TOOLTIP_W = 190;

export function ExpenseStrip({ facts, window, today, color, width, format }: ExpenseStripProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totals = new Map<string, { total: number; count: number }>();
  facts.forEach((f) => {
    const t = totals.get(f.subcategoryName) ?? { total: 0, count: 0 };
    totals.set(f.subcategoryName, { total: t.total + f.amount, count: t.count + 1 });
  });
  const ranked = [...totals.entries()].sort((a, b) => b[1].total - a[1].total);
  const lanes = ranked.slice(0, MAX_LANES).map(([name]) => name);
  const laneOf = (f: Fact) => lanes.indexOf(f.subcategoryName);

  const floating = width >= 560;
  const left = floating ? 150 : 96;
  const pw = width - left - 12;
  const days = diffDays(window.from, window.to) + 1;
  const x = (date: string) => left + ((diffDays(window.from, date) + 0.5) / days) * pw;
  const height = lanes.length * LANE_H + 32;
  const max = Math.max(...facts.map((f) => f.amount), 1);
  const radius = (v: number) => 4 + Math.sqrt(v / max) * Math.min(18, LANE_H / 2 - 6);
  const visible = facts.filter((f) => lanes.includes(f.subcategoryName)).sort((a, b) => b.amount - a.amount);
  const jitter = (id: string) => ((id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % 17) / 8 - 1;
  const cy = (f: Fact) => LANE_H * (laneOf(f) + 0.5) + jitter(f.id) * 8;

  const selected = visible.find((f) => f.id === selectedId) ?? visible[0];
  if (!selected) return null;

  const tickEvery = Math.max(1, Math.ceil(days / Math.max(2, Math.floor(pw / 80))));
  const ticks = Array.from({ length: Math.ceil(days / tickEvery) }, (_, i) => addDays(window.from, i * tickEvery));
  const futureX = today < window.to ? x(today) + (pw / days) * 0.5 : null;

  return (
    <View style={{ width, height: floating ? height : height + 76 }} accessibilityLabel="Lançamentos da categoria, um círculo por gasto">
      <Svg width={width} height={height} style={{ position: "absolute" }}>
        {futureX !== null ? (
          <Rect x={futureX} y={0} width={left + pw - futureX} height={lanes.length * LANE_H} fill="#F7F6FC" />
        ) : null}
        <Path
          d={lanes.map((_, i) => `M${left},${i * LANE_H}H${left + pw}`).join("") + `M${left},${lanes.length * LANE_H}H${left + pw}`}
          stroke={ChartColors.grid}
          strokeWidth={1}
        />
        {visible.map((f) => (
          <Circle
            key={f.id}
            cx={x(f.date)}
            cy={cy(f)}
            r={radius(f.amount)}
            fill={color}
            fillOpacity={0.85}
            stroke={Colors.surface}
            strokeWidth={2}
          />
        ))}
        <Circle cx={x(selected.date)} cy={cy(selected)} r={radius(selected.amount) + 3} fill="none" stroke={Colors.text} strokeWidth={2} />
      </Svg>

      {visible.map((f) => {
        const r = Math.max(radius(f.amount), 12);
        return (
          <Pressable
            key={f.id}
            accessibilityLabel={`${formatDay(f.date)}, ${f.subcategoryName}: ${format.money(f.amount)}`}
            onHoverIn={() => setSelectedId(f.id)}
            onPress={() => setSelectedId(f.id)}
            style={{ position: "absolute", left: x(f.date) - r, top: cy(f) - r, width: r * 2, height: r * 2, borderRadius: r }}
          />
        );
      })}

      {lanes.map((name, i) => {
        const t = totals.get(name);
        return (
          <View key={name} style={{ position: "absolute", left: 0, width: left - 12, top: i * LANE_H + LANE_H / 2 - 17 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>{name}</Text>
            <Text numberOfLines={1} style={{ fontSize: 11, color: Colors.textSec }}>
              {format.money(t?.total ?? 0)} · {t?.count ?? 0} lanç.
            </Text>
          </View>
        );
      })}
      {ticks.map((d) => (
        <Text key={d} style={[AxisTextStyle, { top: lanes.length * LANE_H + 8, width: 60, left: x(d) - 30, textAlign: "center" }]}>
          {formatDay(d)}
        </Text>
      ))}

      <View
        pointerEvents="none"
        style={{
          position: floating ? "absolute" : "relative",
          width: floating ? TOOLTIP_W : "100%",
          padding: 10,
          borderRadius: Radius.sm,
          backgroundColor: ChartColors.tooltipBg,
          top: floating ? Math.max(0, Math.min(cy(selected) - 34, height - 100)) : height,
          left: !floating ? 0 : Math.max(
            0,
            x(selected.date) + radius(selected.amount) + 10 + TOOLTIP_W < width
              ? x(selected.date) + radius(selected.amount) + 10
              : x(selected.date) - radius(selected.amount) - 10 - TOOLTIP_W,
          ),
        }}
      >
        <Text style={{ fontSize: 12, color: ChartColors.tooltipMuted }}>{formatDay(selected.date, true)}</Text>
        <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.surface }}>{format.money(selected.amount)}</Text>
        <Text style={{ fontSize: 12, color: ChartColors.tooltipMuted }}>
          {selected.subcategoryName} · {selected.authorName}
        </Text>
      </View>
    </View>
  );
}
