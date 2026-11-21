import { useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Button } from "../../../components/ui/Button";
import { CategoryIcon } from "../../../components/ui/CategoryIcon";
import { Chip } from "../../../components/ui/Chip";
import { FieldInput } from "../../../components/ui/FieldInput";
import { Sheet, SheetFooter } from "../../../components/ui/Sheet";
import { useCurrency } from "../../../context/CurrencyContext";
import { formatMoney } from "../../../lib/money";
import { categoryColor, layout, palette, radius, space } from "../../../theme";
import {
  ALL_CATEGORIES,
  isCategoryFilterActive,
  searchCategories,
  toggleCategory,
  toggleSubcategory,
  type CategoryFilter,
  type FilterCategory,
} from "../category-filter";

interface CategoryFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FilterCategory[];
  value: CategoryFilter;
  onApply: (filter: CategoryFilter) => void;
  /** How many entries and how much money a selection would show, for the apply button. */
  preview: (filter: CategoryFilter) => { count: number; total: number };
}

const TYPE_TITLE: Record<string, string> = { expense: "Gastos", income: "Receitas" };

/**
 * Picks whole categories and/or single subcategories (several of each). Each category
 * row selects all of it; its subcategories sit right below as chips, so one can be
 * picked in a single tap. The search narrows both levels. Nothing changes behind the
 * sheet until "Mostrar".
 */
export function CategoryFilterSheet({ isOpen, onClose, categories, value, onApply, preview }: CategoryFilterSheetProps) {
  const { currency } = useCurrency();
  const [draft, setDraft] = useState<CategoryFilter>(value);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Each opening starts from what is applied, with the selected categories unfolded.
  useEffect(() => {
    if (!isOpen) return;
    setDraft(value);
    setSearch("");
    setExpanded(
      new Set(
        categories
          .filter((c) => value.categoryIds.includes(c.id) || c.subcategories.some((s) => value.subcategoryIds.includes(s.id)))
          .map((c) => c.id),
      ),
    );
  }, [isOpen, value, categories]);

  const visible = useMemo(() => searchCategories(categories, search), [categories, search]);
  const isSearching = search.trim().length > 0;
  const groups = ["expense", "income"]
    .map((type) => ({ type, items: visible.filter((c) => (c.type ?? "expense") === type) }))
    .filter((g) => g.items.length > 0);
  const { count, total } = preview(draft);

  const toggleExpanded = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Categoria">
      <View style={styles.search}>
        <FieldInput
          accessibilityLabel="Buscar categoria ou subcategoria"
          placeholder="Buscar categoria ou subcategoria"
          value={search}
          onChange={setSearch}
          autoCorrect={false}
        />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {groups.length === 0 ? (
          <AppText variant="body" tone="muted" style={styles.empty}>
            Nenhuma categoria com “{search.trim()}”.
          </AppText>
        ) : null}
        {groups.map((group) => (
          <View key={group.type}>
            <AppText variant="caption" style={styles.groupTitle}>
              {TYPE_TITLE[group.type]}
            </AppText>
            {group.items.map((category) => {
              const isWhole = draft.categoryIds.includes(category.id);
              const pickedSubs = category.subcategories.filter((s) => draft.subcategoryIds.includes(s.id)).length;
              const isOpenRow = isSearching || expanded.has(category.id);
              const color = categoryColor(category.name).dot;
              return (
                <View key={category.id} style={styles.category}>
                  <View style={styles.categoryRow}>
                    <Pressable
                      accessibilityRole="checkbox"
                      aria-checked={isWhole}
                      accessibilityLabel={`${category.name}, todas as subcategorias`}
                      onPress={() => setDraft((d) => toggleCategory(d, category))}
                      style={({ pressed }) => [styles.categoryMain, pressed ? styles.pressed : null]}
                    >
                      <MaterialCommunityIcons
                        name={isWhole ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={22}
                        color={isWhole ? palette.accent : palette.muted}
                      />
                      <CategoryIcon icon={category.icon} name={category.name} color={color} />
                      <View style={styles.categoryText}>
                        <AppText variant={isWhole ? "baseStrong" : "base"} tone={isWhole ? "accent" : "ink"} numberOfLines={1}>
                          {category.name}
                        </AppText>
                        {pickedSubs > 0 ? (
                          <AppText variant="caption" tone="accent">
                            {pickedSubs} {pickedSubs === 1 ? "subcategoria" : "subcategorias"}
                          </AppText>
                        ) : null}
                      </View>
                    </Pressable>
                    {category.subcategories.length > 0 && !isSearching ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${isOpenRow ? "Esconder" : "Mostrar"} subcategorias de ${category.name}`}
                        aria-expanded={isOpenRow}
                        onPress={() => toggleExpanded(category.id)}
                        hitSlop={8}
                        style={styles.expand}
                      >
                        <MaterialCommunityIcons name={isOpenRow ? "chevron-up" : "chevron-down"} size={22} color={palette.muted} />
                      </Pressable>
                    ) : null}
                  </View>
                  {isOpenRow && category.subcategories.length > 0 ? (
                    <View style={styles.subs}>
                      {category.subcategories.map((sub) => (
                        <Chip
                          key={sub.id}
                          label={sub.name}
                          selected={isWhole || draft.subcategoryIds.includes(sub.id)}
                          onPress={() => setDraft((d) => toggleSubcategory(d, category, sub.id))}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <SheetFooter>
        <View style={styles.footerRow}>
          <Button
            label="Limpar"
            variant="secondary"
            isFullWidth={false}
            isDisabled={!isCategoryFilterActive(draft)}
            onPress={() => setDraft(ALL_CATEGORIES)}
          />
          <View style={styles.footerMain}>
            <Button
              label={
                isCategoryFilterActive(draft)
                  ? `Mostrar ${count} ${count === 1 ? "lançamento" : "lançamentos"} · ${formatMoney(total, currency.symbol)}`
                  : "Mostrar todas"
              }
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </View>
        </View>
      </SheetFooter>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  search: {
    paddingHorizontal: layout.gutter,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: space.lg,
  },
  empty: {
    paddingHorizontal: layout.gutter,
    paddingVertical: space.lg,
  },
  groupTitle: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  category: {
    borderBottomWidth: 1,
    borderBottomColor: palette.rule,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryMain: {
    flex: 1,
    minHeight: 52,
    paddingLeft: layout.gutter,
    paddingRight: space.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  categoryText: {
    flex: 1,
  },
  pressed: {
    backgroundColor: palette.paper,
  },
  expand: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: space.sm,
    borderRadius: radius.control,
  },
  subs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    paddingLeft: layout.gutter + 34,
    paddingRight: layout.gutter,
    paddingBottom: space.md,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  footerMain: {
    flex: 1,
  },
});
