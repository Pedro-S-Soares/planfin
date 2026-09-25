import { Text, View } from "react-native";
import type { SubcategoryComparison } from "../analytics";
import { ChartColors } from "../charts/chart-tokens";
import { signedPercent, type MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";
import { Legend } from "./ChartCard";

type SubcategoryCompareProps = { rows: SubcategoryComparison[]; color: string; format: MoneyFormat };

export function SubcategoryCompare({ rows, color, format }: SubcategoryCompareProps) {
  const hasPrevious = rows.some((r) => r.previous !== null);
  const max = Math.max(...rows.map((r) => Math.max(r.current, r.previous ?? 0)), 1);

  return (
    <View style={{ gap: 18 }}>
      <Legend
        items={[
          { label: "Este intervalo", color },
          ...(hasPrevious ? [{ label: "Intervalo anterior (traço)", color: Colors.text, shape: "line" as const }] : []),
        ]}
      />
      {rows.map((r) => {
        const delta = r.previous ? r.current / r.previous - 1 : null;
        return (
          <View key={r.name} style={{ gap: 8 }} accessibilityLabel={`${r.name}: ${format.money(r.current)}`}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: Colors.text }}>{r.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: Colors.text }}>{format.money(r.current)}</Text>
              {hasPrevious ? (
                <Text
                  style={{
                    width: 52,
                    textAlign: "right",
                    fontSize: 12,
                    fontWeight: "700",
                    color: delta !== null && delta > 0.1 ? ChartColors.overText : Colors.textSec,
                  }}
                >
                  {delta === null ? "novo" : signedPercent(delta)}
                </Text>
              ) : null}
            </View>
            <View style={{ height: 12, borderRadius: 6, backgroundColor: ChartColors.track }}>
              <View
                style={{
                  width: `${(r.current / max) * 100}%`,
                  height: 12,
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  backgroundColor: color,
                }}
              />
              {r.previous !== null && r.previous > 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    width: 2,
                    height: 20,
                    left: `${(r.previous / max) * 100}%`,
                    backgroundColor: Colors.text,
                  }}
                />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
