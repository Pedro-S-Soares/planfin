import { ReactNode } from "react";
import { Text, View } from "react-native";
import type { PeriodPace } from "../analytics";
import { ChartColors } from "../charts/chart-tokens";
import { percent, type MoneyFormat } from "../use-money";
import { Card } from "../../../components/ui/Card";
import { Colors } from "../../../theme/tokens";

type Tone = "bad" | "good" | "neutral";

function Kpi({ label, value, hint, note, tone = "neutral", children }: {
  label: string;
  value: string;
  hint?: string;
  note: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  const color = tone === "bad" ? ChartColors.overText : tone === "good" ? Colors.successText : Colors.textSec;
  const icon = tone === "bad" ? "▲ " : tone === "good" ? "▼ " : "";
  return (
    <Card padding={22} style={{ flexGrow: 1, flexBasis: 220, gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSec }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.text }}>{value}</Text>
        {hint ? <Text style={{ fontSize: 14, color: Colors.textSec }}>{hint}</Text> : null}
      </View>
      {children}
      <Text style={{ fontSize: 13, fontWeight: tone === "neutral" ? "400" : "700", color }}>
        {icon}
        {note}
      </Text>
    </Card>
  );
}

export function KpiRow({ pace, format }: { pace: PeriodPace; format: MoneyFormat }) {
  const used = pace.budget > 0 ? pace.spent / pace.budget : 0;
  const elapsed = pace.elapsedDays / pace.totalDays;
  const avgDelta = pace.dailyLimit > 0 ? pace.avgPerDay / pace.dailyLimit - 1 : 0;
  const projDelta = pace.projection - pace.budget;
  const finished = pace.elapsedDays >= pace.totalDays;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
      <Kpi
        label="Gasto no período"
        value={format.money(pace.spent)}
        hint={`de ${format.money(pace.budget)}`}
        note={`${percent(used)} usado · traço = ${percent(elapsed)} do período`}
      >
        <View style={{ height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight, marginVertical: 4 }}>
          <View
            style={{
              width: `${Math.min(used, 1) * 100}%`,
              height: 8,
              borderRadius: 4,
              backgroundColor: used > elapsed ? ChartColors.over : Colors.primary,
            }}
          />
          <View style={{ position: "absolute", top: -4, left: `${elapsed * 100}%`, width: 2, height: 16, backgroundColor: Colors.text }} />
        </View>
      </Kpi>
      <Kpi
        label="Média por dia"
        value={format.money(pace.avgPerDay)}
        hint={`limite ${format.money(pace.dailyLimit)}`}
        tone={avgDelta > 0 ? "bad" : "good"}
        note={`${percent(Math.abs(avgDelta))} ${avgDelta > 0 ? "acima" : "abaixo"} do limite diário`}
      />
      <Kpi
        label={finished ? "Total do período" : "Projeção para o fim"}
        value={format.money(pace.projection)}
        hint={finished ? undefined : "no ritmo atual"}
        tone={projDelta > 0 ? "bad" : "good"}
        note={projDelta > 0 ? `${format.money(projDelta)} acima do orçamento` : `${format.money(-projDelta)} de folga`}
      />
      <Kpi
        label="Gastos extras"
        value={format.money(pace.extras.total)}
        hint={`${pace.extras.count} ${pace.extras.count === 1 ? "lançamento" : "lançamentos"}`}
        note={`${percent(pace.spent > 0 ? pace.extras.total / pace.spent : 0)} do total gasto`}
      />
    </View>
  );
}
