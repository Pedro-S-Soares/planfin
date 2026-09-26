import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AxisTextStyle, ChartColors } from "../charts/chart-tokens";
import { circlePath, hLines, niceTicks, polyline } from "../charts/scale";
import type { MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

type Month = { key: string; label: string; total: number; partial: boolean };
type TrendChartProps = { months: Month[]; color: string; width: number; format: MoneyFormat };

const HEIGHT = 280;
const LEFT = 56;
const TOP = 36;
const BOTTOM = 28;

export function TrendChart({ months, color, width, format }: TrendChartProps) {
  const right = width >= 560 ? 80 : 12;
  const pw = width - LEFT - right;
  const ph = HEIGHT - TOP - BOTTOM;
  const complete = months.filter((m) => !m.partial);
  const average = complete.length > 0 ? complete.reduce((a, m) => a + m.total, 0) / complete.length : 0;
  const ticks = niceTicks(Math.max(...months.map((m) => m.total), average, 1) * 1.05);
  const yMax = ticks[ticks.length - 1];
  const x = (i: number) => LEFT + 16 + (i / Math.max(months.length - 1, 1)) * (pw - 32);
  const y = (v: number) => TOP + ph * (1 - v / yMax);

  const points = months.map((m, i): [number, number] => [x(i), y(m.total)]);
  const line = polyline(points);
  const maxIndex = months.reduce((best, m, i) => (m.total > months[best].total ? i : best), 0);
  const last = months.length - 1;
  const callouts = [...new Set([maxIndex, last])].map((i) => ({
    i,
    note: i === last && months[i].partial ? "mês em andamento" : i === maxIndex ? "maior mês" : "",
  }));

  return (
    <View style={{ width, height: HEIGHT }} accessibilityLabel="Gasto mensal na categoria">
      <Svg width={width} height={HEIGHT} style={{ position: "absolute" }}>
        <Path d={hLines(ticks, y, LEFT, LEFT + pw)} stroke={ChartColors.grid} strokeWidth={1} />
        {average > 0 ? (
          <Path d={hLines([average], y, LEFT, LEFT + pw)} stroke={ChartColors.reference} strokeWidth={1.5} strokeDasharray="4 4" />
        ) : null}
        <Path d={`${line}L${x(last)},${y(0)}L${x(0)},${y(0)}Z`} fill={color} fillOpacity={0.07} />
        <Path d={line} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        <Path d={points.map(([px, py]) => circlePath(px, py, 5)).join("")} fill={color} stroke={Colors.surface} strokeWidth={2} />
      </Svg>
      {ticks.map((t) => (
        <Text key={t} style={[AxisTextStyle, { left: 0, width: 48, textAlign: "right", top: y(t) - 7 }]}>
          {format.compact(t)}
        </Text>
      ))}
      {months.map((m, i) =>
        (pw - 32) / Math.max(months.length - 1, 1) < 36 && (months.length - 1 - i) % 2 === 1 ? null : (
        <Text key={m.key} style={[AxisTextStyle, { top: HEIGHT - 20, width: 40, left: x(i) - 20, textAlign: "center", fontWeight: "600" }]}>
          {m.label}
        </Text>
        ),
      )}
      {callouts.map(({ i, note }) => (
        <View key={i} pointerEvents="none" style={{ position: "absolute", width: 120, left: x(i) - 60, top: y(months[i].total) - 38, alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: Colors.text }}>{format.money(months[i].total)}</Text>
          {note ? <Text style={{ fontSize: 11, color: Colors.textSec }}>{note}</Text> : null}
        </View>
      ))}
      {average > 0 && right > 12 ? (
        <View style={{ position: "absolute", left: LEFT + pw + 8, top: y(average) - 16 }}>
          <Text style={{ fontSize: 11, color: Colors.textSec }}>média</Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.text }}>{format.money(average)}</Text>
        </View>
      ) : null}
    </View>
  );
}
