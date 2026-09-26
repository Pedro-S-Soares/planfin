import { Text, View } from "react-native";
import type { WeekdayAverage } from "../analytics";
import { ChartColors } from "../charts/chart-tokens";
import { percent, type MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

const NAMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const LONG = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const WITH_ARTICLE = ["um domingo", "uma segunda", "uma terça", "uma quarta", "uma quinta", "uma sexta", "um sábado"];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Monday first */
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const BAR_MAX = 170;

type WeekdayChartProps = { data: WeekdayAverage[]; format: MoneyFormat };

export function WeekdayChart({ data, format }: WeekdayChartProps) {
  const sorted = [...data].sort((a, b) => b.average - a.average);
  const [top, second] = sorted;
  const lowest = sorted[sorted.length - 1];
  const max = Math.max(top.average, 1);
  const total = data.reduce((a, d) => a + d.total, 0);
  const weekend = data[0].total + data[6].total;
  const ratio = lowest.average > 0 ? top.average / lowest.average : null;

  return (
    <View style={{ gap: 16 }}>
      {total > 0 ? (
        <Text style={{ fontSize: 15, lineHeight: 21, fontWeight: "600", color: Colors.text }}>
          {ratio !== null ? (
            <>
              {capitalize(WITH_ARTICLE[top.weekday])} custa{" "}
              <Text style={{ color: ChartColors.seriesText, fontWeight: "800" }}>
                {ratio.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}×
              </Text>{" "}
              {WITH_ARTICLE[lowest.weekday]}.{" "}
            </>
          ) : null}
          Fins de semana somam{" "}
          <Text style={{ color: ChartColors.seriesText, fontWeight: "800" }}>{percent(weekend / total)}</Text> do gasto.
        </Text>
      ) : null}
      <View
        style={{
          height: BAR_MAX + 24,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        {ORDER.map((i) => {
          const d = data[i];
          const highlight = d.average > 0 && d.average >= second.average;
          return (
            <View
              key={i}
              accessibilityLabel={`${LONG[i]}: média ${format.money(d.average)}`}
              style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.text, minHeight: 16 }}>
                {highlight ? format.money(d.average) : ""}
              </Text>
              <View
                style={{
                  width: "100%",
                  height: Math.max(2, (d.average / max) * BAR_MAX),
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  backgroundColor: highlight ? ChartColors.members[0] : ChartColors.members[2],
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: -8 }}>
        {ORDER.map((i) => (
          <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600", color: Colors.textSec }}>
            {NAMES[i]}
          </Text>
        ))}
      </View>
    </View>
  );
}
