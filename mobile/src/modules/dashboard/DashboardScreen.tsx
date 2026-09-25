import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import type { AppStackParamList } from "../../../App";
import { ChartColors } from "./charts/chart-tokens";
import { CalendarHeatmap } from "./components/CalendarHeatmap";
import { CategoryRanking } from "./components/CategoryRanking";
import { CategoryTreemap } from "./components/CategoryTreemap";
import { ChartCard, Legend } from "./components/ChartCard";
import { CumulativeChart } from "./components/CumulativeChart";
import { DailyBarsChart } from "./components/DailyBarsChart";
import {
  DashboardError,
  DashboardLoading,
  DashboardPage,
  EmptyNote,
  PageHeader,
  SplitRow,
  useIsWide,
} from "./components/DashboardLayout";
import { KpiRow } from "./components/KpiRow";
import { MembersSplit } from "./components/MembersSplit";
import { MonthlyStackChart } from "./components/MonthlyStackChart";
import { RangeSelector } from "./components/RangeSelector";
import { WeekdayChart } from "./components/WeekdayChart";
import { RANGE_OPTIONS, useDashboardController } from "./use-dashboard-controller";
import { useMoney } from "./use-money";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function DashboardScreen() {
  usePageTitle("Planfin - Dashboard");
  const navigation = useNavigation<Navigation>();
  const format = useMoney();
  const wide = useIsWide();
  const { data, range, setRange, view, categories } = useDashboardController();

  if (data.status === "loading") return <DashboardLoading />;
  if (data.status === "error" || !view || !categories) {
    return <DashboardError onRetry={data.status === "error" ? data.refetch : () => undefined} />;
  }

  const { pace } = view;
  const hasSpend = view.total > 0;
  const noSpend = <EmptyNote>Nenhum gasto neste intervalo.</EmptyNote>;

  return (
    <DashboardPage>
      <PageHeader
        eyebrow={
          <Text style={{ fontSize: 13, fontWeight: "700", letterSpacing: 0.8, color: ChartColors.seriesText, textTransform: "uppercase" }}>
            {view.windowLabel}
          </Text>
        }
        title="Para onde está indo o dinheiro"
        subtitle={view.comparedToPrevious ? "Variações comparam com o intervalo anterior de mesmo tamanho" : undefined}
        aside={<RangeSelector options={RANGE_OPTIONS} value={range} onChange={setRange} />}
      />

      {pace ? <KpiRow pace={pace} format={format} /> : null}

      <SplitRow
        main={
          pace ? (
            <ChartCard
              title="Ritmo do período"
              subtitle="Gasto acumulado contra o ritmo que fecha exatamente no orçamento"
              aside={
                <Legend
                  items={[
                    { label: "Acumulado", color: ChartColors.series, shape: "line" },
                    { label: "Projeção", color: ChartColors.series, shape: "dashed" },
                    { label: "Ritmo ideal", color: ChartColors.reference, shape: "dashed" },
                  ]}
                />
              }
            >
              {(width) => (
                <View style={{ gap: 12 }}>
                  <CumulativeChart pace={pace} width={width} format={format} />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text }}>Gasto por dia</Text>
                    <Legend
                      items={[
                        { label: "Dentro do limite", color: ChartColors.under },
                        { label: "Acima do limite diário", color: ChartColors.over },
                        { label: `Limite ${format.money(pace.dailyLimit)}/dia`, color: Colors.text, shape: "dashed" },
                      ]}
                    />
                  </View>
                  <DailyBarsChart pace={pace} width={width} format={format} />
                </View>
              )}
            </ChartCard>
          ) : null
        }
        side={
          <ChartCard title="Onde vai o dinheiro" subtitle={view.comparedToPrevious ? "Por categoria · variação vs intervalo anterior · toque para detalhar" : "Por categoria · toque para ver o detalhe"} style={{ flex: 1 }}>
            {() =>
              hasSpend ? (
                <CategoryRanking
                  categories={view.ranked}
                  format={format}
                  compared={view.comparedToPrevious}
                  onSelect={(categoryId) => navigation.navigate("CategoryDetail", { categoryId, range })}
                />
              ) : (
                noSpend
              )
            }
          </ChartCard>
        }
      />

      <SplitRow
        main={
          <ChartCard title="Mapa de categorias e subcategorias" subtitle="A área de cada bloco é proporcional ao valor gasto">
            {(width) =>
              hasSpend ? (
                <CategoryTreemap categories={view.ranked} width={width} height={wide ? 340 : 300} format={format} />
              ) : (
                noSpend
              )
            }
          </ChartCard>
        }
        side={
          <ChartCard title="Dia da semana" subtitle="Gasto médio por dia no intervalo" style={{ flex: 1 }}>
            {() => (hasSpend ? <WeekdayChart data={view.weekday} format={format} /> : noSpend)}
          </ChartCard>
        }
      />

      <SplitRow
        main={
          <ChartCard
            title="Evolução mensal por categoria"
            subtitle="Últimos 6 meses · * mês em andamento"
            aside={
              <Legend
                items={view.monthly.categoryIds.flatMap((id) => {
                  const c = categories.get(id);
                  return c ? [{ label: c.name, color: c.color }] : [];
                })}
              />
            }
          >
            {(width) => (
              <MonthlyStackChart
                months={view.monthly.months}
                categoryIds={view.monthly.categoryIds}
                categories={categories}
                width={width}
                format={format}
              />
            )}
          </ChartCard>
        }
        side={
          <ChartCard title="Quem lançou" subtitle="Divisão do gasto entre os membros do grupo" style={{ flex: 1 }}>
            {() => <MembersSplit split={view.members} categories={categories} format={format} />}
          </ChartCard>
        }
      />

      <ChartCard title="Calendário de gastos" subtitle="Últimos 12 meses · cada quadrado é um dia">
        {(width) => (
          <CalendarHeatmap calendar={view.calendar} dailyLimit={view.dailyLimit} width={width} format={format} />
        )}
      </ChartCard>
    </DashboardPage>
  );
}
