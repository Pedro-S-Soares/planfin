import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { Colors } from "../../../theme/tokens";
import { ACCOUNT_KIND_ICON } from "../../finance/format";
import type { FinancialAccount } from "../../finance/use-financial-accounts";
import type { AccountFilter, DirectionFilter, HistoryFilters, NatureFilter } from "../history-filters";

interface HistoryFilterBarProps {
  filters: HistoryFilters;
  accounts: FinancialAccount[];
  onChange: (filters: HistoryFilters) => void;
}

const DIRECTION_OPTIONS: { value: DirectionFilter; label: string }[] = [
  { value: "all", label: "Entradas e saídas" },
  { value: "in", label: "Entradas" },
  { value: "out", label: "Saídas" },
];

const NATURE_OPTIONS: { value: NatureFilter; label: string }[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "recurring", label: "↻ Recorrentes" },
  { value: "variable", label: "Variáveis" },
];

function isSameAccount(a: AccountFilter, b: AccountFilter) {
  if (a.kind === "account" && b.kind === "account") return a.id === b.id;
  return a.kind === b.kind;
}

function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}
    >
      {children}
    </ScrollView>
  );
}

export function HistoryFilterBar({ filters, accounts, onChange }: HistoryFilterBarProps) {
  const accountOptions: { value: AccountFilter; label: string; key: string }[] = [
    { value: { kind: "all" }, label: "Todas as contas", key: "all" },
    ...accounts.map((a) => ({
      value: { kind: "account" as const, id: a.id },
      label: `${ACCOUNT_KIND_ICON[a.kind]} ${a.name}`,
      key: a.id,
    })),
    { value: { kind: "none" }, label: "Sem conta", key: "none" },
  ];

  return (
    <View style={{ gap: 8, paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <ChipRow>
        {accountOptions.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={isSameAccount(filters.account, option.value)}
            onPress={() => onChange({ ...filters, account: option.value })}
          />
        ))}
      </ChipRow>
      <ChipRow>
        {DIRECTION_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={filters.direction === option.value}
            onPress={() => onChange({ ...filters, direction: option.value })}
          />
        ))}
      </ChipRow>
      <ChipRow>
        {NATURE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={filters.nature === option.value}
            onPress={() => onChange({ ...filters, nature: option.value })}
          />
        ))}
      </ChipRow>
    </View>
  );
}
