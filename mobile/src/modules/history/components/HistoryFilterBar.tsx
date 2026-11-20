import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { layout, palette, radius, space } from "../../../theme";
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-pressed={isActive}
      onPress={onPress}
      style={[styles.dropdown, isActive ? styles.dropdownActive : null]}
    >
      <AppText variant="label" tone={isActive ? "accent" : "ink"}>{label}</AppText>
      <MaterialCommunityIcons name="chevron-down" size={16} color={isActive ? palette.accent : palette.muted} />
    </Pressable>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remover filtro ${label}`}
      onPress={onRemove}
      style={styles.activeChip}
    >
      <AppText variant="label" tone="accent" numberOfLines={1}>{label}</AppText>
      <MaterialCommunityIcons name="close" size={14} color={palette.accent} />
    </Pressable>
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
    <View style={styles.bar}>
      <View style={styles.row}>
        <DropdownButton label="Conta" isActive={isAccountActive} onPress={() => setOpenPicker("account")} />
        <DropdownButton label="Tipo" isActive={isTypeActive} onPress={() => setOpenPicker("type")} />
      </View>

      {isAccountActive || isTypeActive ? (
        <View style={styles.activeRow}>
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
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange(DEFAULT_HISTORY_FILTERS)}
            hitSlop={8}
            style={styles.clear}
          >
            <AppText variant="label" tone="accent">Limpar</AppText>
          </Pressable>
        </View>
      ) : null}

      <OptionSheet title="Conta" sections={accountSections} isOpen={openPicker === "account"} onClose={closePicker} />
      <OptionSheet title="Tipo" sections={typeSections} isOpen={openPicker === "type"} onClose={closePicker} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: layout.gutter,
    paddingVertical: space.sm,
    gap: space.sm,
    backgroundColor: palette.sheet,
    borderBottomWidth: 1,
    borderBottomColor: palette.rule,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  dropdown: {
    height: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.sheet,
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  dropdownActive: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  activeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  activeChip: {
    height: 32,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    backgroundColor: palette.accentSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clear: {
    paddingHorizontal: space.xs,
  },
});
