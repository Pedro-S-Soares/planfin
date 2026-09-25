import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { formatDay, type PeriodPace } from "../analytics";
import { AxisTextStyle, ChartColors } from "../charts/chart-tokens";
import { barPath, hLines, niceTicks } from "../charts/scale";
import type { MoneyFormat } from "../use-money";
import { Colors, Radius } from "../../../theme/tokens";
import { PACE_LEFT, paceRight } from "./CumulativeChart";

type DailyBarsChartProps = { pace: PeriodPace; width: number; format: MoneyFormat };

const HEIGHT = 150;
const TOP = 10;
const PLOT = 116;
const TOOLTIP_W = 180;

export function DailyBarsChart({ pace, width, format }: DailyBarsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const right = paceRight(width);
  const pw = width - PACE_LEFT - right;
  const slot = pw / pace.totalDays;
  const bw = Math.max(2, Math.min(14, slot * 0.6));
  const limit = pace.dailyLimit;

  const ticks = niceTicks(Math.max(limit, ...pace.daily.map((d) => d.total)) * 1.05, 2);
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => TOP + PLOT * (1 - v / yMax);
  const base = y(0);

  let under = "";
  let over = "";
  pace.daily.forEach((d, i) => {
    const p = barPath(PACE_LEFT + i * slot + (slot - bw) / 2, y(d.total), bw, base - y(d.total));
    if (d.total > limit) over += p;
    else under += p;
  });

  const tip = hovered === null ? null : pace.daily[hovered];
  const tipLeft =
    hovered === null
      ? 0
      : Math.max(0, Math.min(PACE_LEFT + (hovered + 0.5) * slot - TOOLTIP_W / 2, width - TOOLTIP_W));

  return (
    <View style={{ width, height: HEIGHT }}>
      {hovered !== null ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            height: PLOT + TOP,
            left: PACE_LEFT + hovered * slot,
            width: slot,
            borderRadius: 6,
            backgroundColor: ChartColors.hover,
          }}
        />
      ) : null}
      <Svg width={width} height={HEIGHT} style={{ position: "absolute" }}>
        <Path d={hLines(ticks, y, PACE_LEFT, PACE_LEFT + pw)} stroke={ChartColors.grid} strokeWidth={1} />
        <Path d={under} fill={ChartColors.under} />
        <Path d={over} fill={ChartColors.over} />
        <Path
          d={hLines([limit], y, PACE_LEFT, PACE_LEFT + pw + 4)}
          stroke={Colors.text}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      </Svg>

      {ticks.map((t) => (
        <Text key={t} style={[AxisTextStyle, { left: 0, width: 48, textAlign: "right", top: y(t) - 7 }]}>
          {format.compact(t)}
        </Text>
      ))}
      {right > 12 ? (
        <Text style={[AxisTextStyle, { left: PACE_LEFT + pw + 8, top: y(limit) - 7, fontWeight: "700", color: Colors.text }]}>
          limite {format.money(limit)}/dia
        </Text>
      ) : null}
      {pace.daily.map((d, i) =>
        i === 0 || (i + 1) % 5 === 0 ? (
          <Text
            key={d.date}
            style={[AxisTextStyle, { top: base + 6, width: 30, textAlign: "center", left: PACE_LEFT + (i + 0.5) * slot - 15 }]}
          >
            {Number(d.date.slice(8))}
          </Text>
        ) : null,
      )}

      {pace.daily.map((d, i) => (
        <Pressable
          key={d.date}
          accessibilityLabel={`${formatDay(d.date)}: ${format.money(d.total)}`}
          onHoverIn={() => setHovered(i)}
          onHoverOut={() => setHovered((h) => (h === i ? null : h))}
          onPress={() => setHovered((h) => (h === i ? null : i))}
          style={{ position: "absolute", top: 0, height: PLOT + TOP, left: PACE_LEFT + i * slot, width: slot }}
        />
      ))}

      {tip ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: HEIGHT - y(tip.total) + 8,
            left: tipLeft,
            width: TOOLTIP_W,
            padding: 10,
            borderRadius: Radius.sm,
            backgroundColor: ChartColors.tooltipBg,
          }}
        >
          <Text style={{ fontSize: 12, color: ChartColors.tooltipMuted }}>{formatDay(tip.date, true)}</Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.surface }}>{format.money(tip.total)}</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: tip.total > limit ? ChartColors.tooltipBad : ChartColors.tooltipGood,
            }}
          >
            {format.money(Math.abs(tip.total - limit))} {tip.total > limit ? "acima" : "abaixo"} do limite
          </Text>
        </View>
      ) : null}
    </View>
  );
}
