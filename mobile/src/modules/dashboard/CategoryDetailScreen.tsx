import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card } from "../../components/ui/Card";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import type { AppStackParamList } from "../../../App";
import { ChartColors } from "./charts/chart-tokens";
import { ChartCard } from "./components/ChartCard";
import {
  DashboardError,
  DashboardLoading,
  DashboardPage,
  EmptyNote,
  PageHeader,
  SplitRow,
  useIsWide,
} from "./components/DashboardLayout";
import { ExpenseStrip } from "./components/ExpenseStrip";
import { SubcategoryCompare } from "./components/SubcategoryCompare";
import { TrendChart } from "./components/TrendChart";
import { formatDay } from "./analytics";
import { useCategoryDetailController } from "./use-category-detail-controller";
import { percent, signedPercent, useMoney } from "./use-money";

type Props = NativeStackScreenProps<AppStackParamList, "CategoryDetail">;

function Stat({ label, value, note, bad }: { label: string; value: string; note: string; bad?: boolean }) {
  return (
    <Card padding={22} style={{ flexGrow: 1, flexBasis: 200, gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSec }}>{label}</Text>
      <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.text }}>{value}</Text>
      <Text style={{ fontSize: 13, fontWeight: bad ? "700" : "400", color: bad ? ChartColors.overText : Colors.textSec }}>
        {note}
      </Text>
    </Card>
  );
}

export function CategoryDetailScreen({ navigation, route }: Props) {
  const { categoryId, range } = route.params;
  const format = useMoney();
  const wide = useIsWide();
  const { data, view } = useCategoryDetailController(categoryId, range);
  usePageTitle(`Planfin - ${view?.category.name ?? "Categoria"}`);

  if (data.status === "loading") return <DashboardLoading />;
  if (data.status === "error") return <DashboardError onRetry={data.refetch} />;
  if (!view) {
    return (
      <DashboardPage>
        <EmptyNote>Categoria não encontrada.</EmptyNote>
      </DashboardPage>
    );
  }

  const { category } = view;

  return (
    <DashboardPage>
      <PageHeader
        eyebrow={
          <Pressable accessibilityRole="link" onPress={() => navigation.goBack()} style={{ minHeight: 32, justifyContent: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: ChartColors.seriesText }}>‹ Visão geral</Text>
          </Pressable>
        }
        title={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: category.color }} />
            <Text accessibilityRole="header" style={{ fontSize: wide ? 34 : 26, fontWeight: "800", color: Colors.text }}>
              {category.name}
            </Text>
          </View>
        }
        subtitle={view.windowLabel}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        <Stat
          label="Gasto na categoria"
          value={format.money(view.total)}
          bad={view.delta !== null && view.delta > 0}
          note={`${percent(view.share)} do total${view.delta !== null ? ` · ${signedPercent(view.delta)} vs anterior` : ""}`}
        />
        <Stat label="Lançamentos" value={String(view.count)} note="no intervalo" />
        <Stat label="Ticket médio" value={format.money(view.ticket)} note="por lançamento" />
        <Stat
          label="Maior lançamento"
          value={view.largest ? format.money(view.largest.amount) : "—"}
          note={view.largest ? `${view.largest.subcategoryName} · ${formatDay(view.largest.date)}` : "sem lançamentos"}
        />
      </View>

      <SplitRow
        main={
          <ChartCard title="Últimos 12 meses" subtitle={`Gasto mensal em ${category.name}`}>
            {(width) => <TrendChart months={view.monthly} color={category.color} width={width} format={format} />}
          </ChartCard>
        }
        side={
          <ChartCard title="Subcategorias" subtitle="Este intervalo contra o anterior" style={{ flex: 1 }}>
            {() =>
              view.subcategories.length > 0 ? (
                <SubcategoryCompare rows={view.subcategories} color={category.color} format={format} />
              ) : (
                <EmptyNote>Nenhum gasto neste intervalo.</EmptyNote>
              )
            }
          </ChartCard>
        }
      />

      <ChartCard title="Cada lançamento do intervalo" subtitle="Um círculo por gasto · tamanho proporcional ao valor · toque para ver">
        {(width) =>
          view.current.length > 0 ? (
            <ExpenseStrip
              facts={view.current}
              window={view.window}
              today={view.today}
              color={category.color}
              width={width}
              format={format}
            />
          ) : (
            <EmptyNote>Nenhum gasto neste intervalo.</EmptyNote>
          )
        }
      </ChartCard>
    </DashboardPage>
  );
}
