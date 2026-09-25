import { Text, View } from "react-native";
import type { MembersSplit as MembersSplitData } from "../analytics";
import { ChartColors } from "../charts/chart-tokens";
import type { CategoryInfo } from "../types";
import { percent, type MoneyFormat } from "../use-money";
import { Colors } from "../../../theme/tokens";

type MembersSplitProps = {
  split: MembersSplitData;
  categories: Map<string, CategoryInfo>;
  format: MoneyFormat;
};

const toneFor = (i: number) => ChartColors.members[Math.min(i, ChartColors.members.length - 1)];

function SplitBar({ shares, height }: { shares: number[]; height: number }) {
  const visible = shares.map((share, i) => ({ share, i })).filter((s) => s.share > 0);
  return (
    <View style={{ flexDirection: "row", height, gap: 2, flex: 1 }}>
      {visible.map(({ share, i }, k) => (
        <View
          key={i}
          style={{
            flexGrow: share,
            flexBasis: 0,
            backgroundColor: toneFor(i),
            borderTopLeftRadius: k === 0 ? 4 : 0,
            borderBottomLeftRadius: k === 0 ? 4 : 0,
            borderTopRightRadius: k === visible.length - 1 ? 4 : 0,
            borderBottomRightRadius: k === visible.length - 1 ? 4 : 0,
          }}
        />
      ))}
    </View>
  );
}

export function MembersSplit({ split, categories, format }: MembersSplitProps) {
  if (split.members.length < 2) {
    return (
      <Text style={{ fontSize: 14, color: Colors.textSec }}>
        {split.members.length === 1
          ? `Todos os gastos deste intervalo foram lançados por ${split.members[0].name}.`
          : "Nenhum gasto neste intervalo."}
      </Text>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <SplitBar shares={split.members.map((m) => m.share)} height={28} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {split.members.map((m, i) => (
          <View key={m.authorId} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: toneFor(i) }} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.text }}>{m.name}</Text>
            <Text style={{ fontSize: 13, color: Colors.textSec }}>
              {format.money(m.total)} · {percent(m.share)}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 12 }}>
        {split.byCategory.map((row) => (
          <View key={row.categoryId} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text numberOfLines={1} style={{ width: 96, fontSize: 13, fontWeight: "600", color: Colors.text }}>
              {categories.get(row.categoryId)?.name}
            </Text>
            <Text style={{ width: 36, textAlign: "right", fontSize: 12, fontWeight: "700", color: ChartColors.seriesText }}>
              {percent(row.shares[0])}
            </Text>
            <SplitBar shares={row.shares} height={12} />
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 12, color: Colors.textSec }}>
        O número à esquerda é a parte de {split.members[0].name} em cada categoria.
      </Text>
    </View>
  );
}
