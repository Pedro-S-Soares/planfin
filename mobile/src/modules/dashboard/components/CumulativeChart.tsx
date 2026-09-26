import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { PeriodPace } from "../analytics";
import { AxisTextStyle, ChartColors } from "../charts/chart-tokens";
import { hLines, niceTicks, polyline } from "../charts/scale";
import type { MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

export const PACE_LEFT = 56;
export const paceRight = (width: number) => (width >= 560 ? 104 : 12);

type CumulativeChartProps = { pace: PeriodPace; width: number; format: MoneyFormat };

const HEIGHT = 240;
const TOP = 16;
const BOTTOM = 12;

export function CumulativeChart({ pace, width, format }: CumulativeChartProps) {
  const right = paceRight(width);
  const pw = width - PACE_LEFT - right;
  const ph = HEIGHT - TOP - BOTTOM;

  let acc = 0;
  const cumulative = pace.daily.slice(0, pace.elapsedDays).map((d) => (acc += d.total));
  const today = acc;
  const hasFuture = pace.elapsedDays < pace.totalDays;

  const ticks = niceTicks(Math.max(pace.budget, pace.projection, today) * 1.05);
  const yMax = ticks[ticks.length - 1];
  const x = (day: number) => PACE_LEFT + (day / pace.totalDays) * pw;
  const y = (v: number) => TOP + ph * (1 - v / yMax);

  const points: [number, number][] = [[x(0), y(0)], ...cumulative.map((v, i): [number, number] => [x(i + 1), y(v)])];
  const line = polyline(points);
  const todayX = x(pace.elapsedDays);
  const todayY = y(today);
  const gap = today - pace.idealToDate;
  const labelOnRight = todayX + 180 < width;

  return (
    <View style={{ width, height: HEIGHT }}>
      <Svg width={width} height={HEIGHT} style={{ position: "absolute" }}>
        <Path d={hLines(ticks, y, PACE_LEFT, PACE_LEFT + pw)} stroke={ChartColors.grid} strokeWidth={1} />
        <Path
          d={hLines([pace.budget], y, PACE_LEFT, PACE_LEFT + pw)}
          stroke={ChartColors.referenceLight}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {points.length > 1 ? (
          <Path d={`${line}L${todayX},${y(0)}Z`} fill={ChartColors.series} fillOpacity={0.07} />
        ) : null}
        <Path
          d={polyline([[x(0), y(0)], [x(pace.totalDays), y(pace.budget)]])}
          stroke={ChartColors.reference}
          strokeWidth={2}
          strokeDasharray="1 5"
          strokeLinecap="round"
        />
        {hasFuture ? (
          <Path
            d={polyline([[todayX, todayY], [x(pace.totalDays), y(pace.projection)]])}
            stroke={ChartColors.series}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        ) : null}
        <Path d={line} stroke={ChartColors.series} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        <Circle cx={todayX} cy={todayY} r={6} fill={ChartColors.series} stroke={Colors.surface} strokeWidth={2} />
        {hasFuture ? (
          <Circle
            cx={x(pace.totalDays)}
            cy={y(pace.projection)}
            r={5}
            fill={Colors.surface}
            stroke={ChartColors.series}
            strokeWidth={2}
          />
        ) : null}
      </Svg>

      {ticks.map((t) => (
        <Text key={t} style={[AxisTextStyle, { left: 0, width: 48, textAlign: "right", top: y(t) - 7 }]}>
          {format.compact(t)}
        </Text>
      ))}
      <Text style={[AxisTextStyle, { left: PACE_LEFT + 6, top: y(pace.budget) - 18, fontWeight: "600" }]}>
        Orçamento {format.money(pace.budget)}
      </Text>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 170,
          top: Math.min(todayY + 12, HEIGHT - 40),
          left: labelOnRight ? todayX + 12 : todayX - 182,
          alignItems: labelOnRight ? "flex-start" : "flex-end",
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.text }}>
          {hasFuture ? "Hoje" : "Fim"} · {format.money(today)}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "700", color: gap > 0 ? ChartColors.overText : Colors.successText }}>
          {gap > 0 ? "+" : "−"}
          {format.money(Math.abs(gap))} vs ritmo ideal
        </Text>
      </View>

      {hasFuture && right > 12 ? (
        <View style={{ position: "absolute", left: x(pace.totalDays) + 12, top: y(pace.projection) - 16 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: ChartColors.seriesText }}>
            {format.money(pace.projection)}
          </Text>
          <Text style={{ fontSize: 11, color: Colors.textSec }}>projeção</Text>
        </View>
      ) : null}
    </View>
  );
}
