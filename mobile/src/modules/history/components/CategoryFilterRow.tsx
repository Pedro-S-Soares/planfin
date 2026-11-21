import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { space } from "../../../theme";
import {
  ALL_CATEGORIES,
  categoryFilterParts,
  isCategoryFilterActive,
  removeCategoryFilterPart,
  type CategoryFilter,
  type FilterCategory,
} from "../category-filter";
import { CategoryFilterSheet } from "./CategoryFilterSheet";
import { ActiveChip, DropdownButton } from "./HistoryFilterBar";

interface CategoryFilterRowProps {
  value: CategoryFilter;
  onChange: (filter: CategoryFilter) => void;
  categories: FilterCategory[];
  preview: (filter: CategoryFilter) => { count: number; total: number };
}

/** "Categoria ▾" with a chip per selection and "Limpar", for lists other than the history (the invoice). */
export function CategoryFilterRow({ value, onChange, categories, preview }: CategoryFilterRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = isCategoryFilterActive(value);

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <DropdownButton label="Categoria" isActive={isActive} onPress={() => setIsOpen(true)} />
        {categoryFilterParts(value, categories).map((part) => (
          <ActiveChip
            key={`${part.kind}-${part.id}`}
            label={part.label}
            onRemove={() => onChange(removeCategoryFilterPart(value, part))}
          />
        ))}
        {isActive ? (
          <Pressable accessibilityRole="button" onPress={() => onChange(ALL_CATEGORIES)} hitSlop={8} style={styles.clear}>
            <AppText variant="label" tone="accent">Limpar</AppText>
          </Pressable>
        ) : null}
      </View>
      <CategoryFilterSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
        value={value}
        onApply={onChange}
        preview={preview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: space.sm,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  clear: {
    paddingHorizontal: space.xs,
  },
});
