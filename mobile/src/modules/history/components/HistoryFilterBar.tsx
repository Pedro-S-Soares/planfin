import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ledger } from "../../../theme/tokens";
import type { FinancialAccount } from "../../finance/use-financial-accounts";
import {
  DEFAULT_HISTORY_FILTERS,
  type AccountFilter,
  type DirectionFilter,
  type HistoryFilters,
  type NatureFilter,
} from "../history-filters";
import { OptionSheet, type SheetSection } from "./OptionSheet";

interface HistoryFilterBarProps {
  filters: HistoryFilters;
  accounts: FinancialAccount[];
  onChange: (filters: HistoryFilters) => void;
}

type OpenPicker = "none" | "account" | "type";

const DIRECTION_LABEL: Record<DirectionFilter, string> = {
  all: "Entradas e saídas",
  in: "Entradas",
  out: "Saídas",
};

const NATURE_LABEL: Record<NatureFilter, string> = {
  all: "Todos os tipos",
  recurring: "Recorrentes",
  variable: "Variáveis",
};

const DIRECTIONS: DirectionFilter[] = ["all", "in", "out"];
const NATURES: NatureFilter[] = ["all", "recurring", "variable"];

function isSameAccount(a: AccountFilter, b: AccountFilter) {
  if (a.kind === "account" && b.kind === "account") return a.id === b.id;
  return a.kind === b.kind;
}

function accountLabel(filter: AccountFilter, accounts: FinancialAccount[]): string {
  if (filter.kind === "all") return "Todas as contas";
  if (filter.kind === "none") return "Sem conta";
  return accounts.find((a) => a.id === filter.id)?.name ?? "Conta";
}

function DropdownButton({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={{
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isActive ? Ledger.accent : Ledger.rule,
        backgroundColor: isActive ? Ledger.accentSoft : Ledger.sheet,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: "600", color: isActive ? Ledger.accent : Ledger.ink }}>{label}</Text>
      <Text style={{ fontSize: 11, color: isActive ? Ledger.accent : Ledger.muted }}>▾</Text>
    </TouchableOpacity>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Remover filtro ${label}`}
      onPress={onRemove}
      style={{
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: Ledger.accentSoft,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: Ledger.accent }} numberOfLines={1}>{label}</Text>
      <Text style={{ fontSize: 12, color: Ledger.accent }}>✕</Text>
    </TouchableOpacity>
  );
}

/**
 * The history filters in one compact row ("Conta ▾ · Tipo ▾"). Chips appear only for
 * the filters in use, each removable, with "limpar" to drop them all.
 */
export function HistoryFilterBar({ filters, accounts, onChange }: HistoryFilterBarProps) {
  const [openPicker, setOpenPicker] = useState<OpenPicker>("none");
  const closePicker = () => setOpenPicker("none");

  const isAccountActive = filters.account.kind !== "all";
  const isTypeActive = filters.direction !== "all" || filters.nature !== "all";

  const accountFilters: AccountFilter[] = [
    { kind: "all" },
    ...accounts.map((a): AccountFilter => ({ kind: "account", id: a.id })),
    { kind: "none" },
  ];
  const accountSections: SheetSection[] = [
    {
      options: accountFilters.map((filter) => ({
        key: filter.kind === "account" ? filter.id : filter.kind,
        label: accountLabel(filter, accounts),
        isSelected: isSameAccount(filters.account, filter),
        onSelect: () => onChange({ ...filters, account: filter }),
      })),
    },
  ];
  const typeSections: SheetSection[] = [
    {
      title: "Movimento",
      options: DIRECTIONS.map((direction) => ({
        key: direction,
        label: DIRECTION_LABEL[direction],
        isSelected: filters.direction === direction,
        onSelect: () => onChange({ ...filters, direction }),
      })),
    },
    {
      title: "Recorrência",
      options: NATURES.map((nature) => ({
        key: nature,
        label: NATURE_LABEL[nature],
        isSelected: filters.nature === nature,
        onSelect: () => onChange({ ...filters, nature }),
      })),
    },
  ];

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        backgroundColor: Ledger.sheet,
        borderBottomWidth: 1,
        borderBottomColor: Ledger.rule,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <DropdownButton label="Conta" isActive={isAccountActive} onPress={() => setOpenPicker("account")} />
        <Text style={{ color: Ledger.muted }}>·</Text>
        <DropdownButton label="Tipo" isActive={isTypeActive} onPress={() => setOpenPicker("type")} />
      </View>

      {isAccountActive || isTypeActive ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          {isAccountActive ? (
            <ActiveChip
              label={accountLabel(filters.account, accounts)}
              onRemove={() => onChange({ ...filters, account: DEFAULT_HISTORY_FILTERS.account })}
            />
          ) : null}
          {filters.direction !== "all" ? (
            <ActiveChip label={DIRECTION_LABEL[filters.direction]} onRemove={() => onChange({ ...filters, direction: "all" })} />
          ) : null}
          {filters.nature !== "all" ? (
            <ActiveChip label={NATURE_LABEL[filters.nature]} onRemove={() => onChange({ ...filters, nature: "all" })} />
          ) : null}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onChange(DEFAULT_HISTORY_FILTERS)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ paddingHorizontal: 4 }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: Ledger.accent }}>limpar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <OptionSheet title="Conta" sections={accountSections} isOpen={openPicker === "account"} onClose={closePicker} />
      <OptionSheet title="Tipo" sections={typeSections} isOpen={openPicker === "type"} onClose={closePicker} />
    </View>
  );
}
