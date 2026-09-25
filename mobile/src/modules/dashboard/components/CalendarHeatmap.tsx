import { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { formatDay, monthLabel, type CalendarYear } from "../analytics";
import { ChartColors } from "../charts/chart-tokens";
import { percent, type MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

type CalendarHeatmapProps = { calendar: CalendarYear; dailyLimit: number; width: number; format: MoneyFormat };

const GAP = 3;
const LABEL_COL = 28;
const STATS_W = 200;

function bucket(value: number, limit: number): number {
  if (value === 0) return 0;
  if (value <= limit / 2) return 1;
  if (value <= limit) return 2;
  if (value <= limit * 2) return 3;
  return 4;
}

export function CalendarHeatmap({ calendar, dailyLimit, width, format }: CalendarHeatmapProps) {
  const scroll = useRef<ScrollView>(null);
  const side = width >= 900;
  const gridWidth = (side ? width - STATS_W - 32 : width) - LABEL_COL;
  const cell = Math.max(10, Math.min(17, Math.floor(gridWidth / calendar.weeks) - GAP));
  const step = cell + GAP;

  const monthMarks = calendar.cells.flatMap((c, i) =>
    c.date.endsWith("-01") ? [{ left: Math.floor(i / 7) * step, label: monthLabel(c.date.slice(0, 7)) }] : [],
  );
  const legend = [
    "sem gasto",
    `até ${format.money(dailyLimit / 2)}`,
    `até o limite (${format.money(dailyLimit)})`,
    `até ${format.money(dailyLimit * 2)}`,
    `acima de ${format.money(dailyLimit * 2)}`,
  ];

  const stats = [
    { value: String(calendar.overLimitDays), label: `dias acima do limite (${percent(calendar.overLimitDays / Math.max(calendar.pastDays, 1))})` },
    { value: `${calendar.longestStreakWithinLimit} dias`, label: "maior sequência dentro do limite" },
    calendar.maxDay
      ? { value: format.money(calendar.maxDay.value), label: `dia mais caro · ${formatDay(calendar.maxDay.date)}` }
      : null,
  ].flatMap((s) => (s ? [s] : []));

  return (
    <View style={{ flexDirection: side ? "row" : "column", gap: side ? 32 : 20 }}>
      <View style={{ gap: 12 }}>
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: LABEL_COL, paddingTop: 20, gap: GAP }}>
              {["", "seg", "", "qua", "", "sex", ""].map((d, i) => (
                <Text key={i} style={{ height: cell, fontSize: 10, lineHeight: cell, color: Colors.textSec }}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={{ paddingTop: 20 }}>
              {monthMarks.map((m) => (
                <Text key={`${m.left}-${m.label}`} style={{ position: "absolute", top: 0, left: m.left, fontSize: 11, color: Colors.textSec }}>
                  {m.label}
                </Text>
              ))}
              <View style={{ flexDirection: "row", gap: GAP }}>
                {Array.from({ length: calendar.weeks }, (_, w) => (
                  <View key={w} style={{ gap: GAP }}>
                    {calendar.cells.slice(w * 7, w * 7 + 7).map((c) => (
                      <View
                        key={c.date}
                        accessibilityLabel={c.value === null ? undefined : `${formatDay(c.date)}: ${format.money(c.value)}`}
                        style={{
                          width: cell,
                          height: cell,
                          borderRadius: 3,
                          backgroundColor: c.value === null ? "transparent" : ChartColors.ramp[bucket(c.value, dailyLimit)],
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          {legend.map((label, i) => (
            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: ChartColors.ramp[i] }} />
              <Text style={{ fontSize: 11, color: Colors.textSec }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View
        style={{
          flex: side ? 1 : undefined,
          flexDirection: side ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: side ? "center" : "flex-start",
          gap: 20,
          paddingLeft: side ? 32 : 0,
          borderLeftWidth: side ? 1 : 0,
          borderLeftColor: Colors.border,
        }}
      >
        {stats.map((s) => (
          <View key={s.label} style={{ minWidth: 140 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.text }}>{s.value}</Text>
            <Text style={{ fontSize: 13, color: Colors.textSec }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
