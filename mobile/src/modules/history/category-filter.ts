import type { EntryType } from "./entry-sheet";

/**
 * Which categories the history / invoice shows: whole categories (every subcategory in
 * them) and single subcategories, in any mix. Both empty = every category.
 */
export type CategoryFilter = { categoryIds: string[]; subcategoryIds: string[] };

export const ALL_CATEGORIES: CategoryFilter = { categoryIds: [], subcategoryIds: [] };

export type FilterCategory = {
  id: string;
  name: string;
  icon?: string | null;
  type?: string | null;
  subcategories: { id: string; name: string }[];
};

type CategorizedEntry = {
  subcategory?: { id?: string | null; category?: { id?: string | null } | null } | null;
};

export function isCategoryFilterActive(filter: CategoryFilter): boolean {
  return filter.categoryIds.length > 0 || filter.subcategoryIds.length > 0;
}

export function matchesCategory(entry: CategorizedEntry, filter: CategoryFilter): boolean {
  if (!isCategoryFilterActive(filter)) return true;
  const subcategoryId = entry.subcategory?.id;
  const categoryId = entry.subcategory?.category?.id;
  return (
    (categoryId != null && filter.categoryIds.includes(categoryId)) ||
    (subcategoryId != null && filter.subcategoryIds.includes(subcategoryId))
  );
}

/** Selecting a whole category replaces its single subcategories; selecting it again removes it. */
export function toggleCategory(filter: CategoryFilter, category: FilterCategory): CategoryFilter {
  const subIds = new Set(category.subcategories.map((s) => s.id));
  const subcategoryIds = filter.subcategoryIds.filter((id) => !subIds.has(id));
  const isSelected = filter.categoryIds.includes(category.id);
  return {
    categoryIds: isSelected
      ? filter.categoryIds.filter((id) => id !== category.id)
      : [...filter.categoryIds, category.id],
    subcategoryIds,
  };
}

/**
 * Toggles one subcategory. With its whole category selected, tapping a subcategory
 * narrows the filter to just that subcategory.
 */
export function toggleSubcategory(filter: CategoryFilter, category: FilterCategory, subcategoryId: string): CategoryFilter {
  if (filter.categoryIds.includes(category.id)) {
    return {
      categoryIds: filter.categoryIds.filter((id) => id !== category.id),
      subcategoryIds: [...filter.subcategoryIds, subcategoryId],
    };
  }
  const isSelected = filter.subcategoryIds.includes(subcategoryId);
  return {
    categoryIds: filter.categoryIds,
    subcategoryIds: isSelected
      ? filter.subcategoryIds.filter((id) => id !== subcategoryId)
      : [...filter.subcategoryIds, subcategoryId],
  };
}

export type CategoryFilterPart = { kind: "category" | "subcategory"; id: string; label: string };

/** One removable chip per selected category or subcategory ("Saúde", "Alimentação › Mercado"). */
export function categoryFilterParts(filter: CategoryFilter, categories: FilterCategory[]): CategoryFilterPart[] {
  const parts: CategoryFilterPart[] = [];
  for (const category of categories) {
    if (filter.categoryIds.includes(category.id)) {
      parts.push({ kind: "category", id: category.id, label: category.name });
    }
    for (const sub of category.subcategories) {
      if (filter.subcategoryIds.includes(sub.id)) {
        parts.push({ kind: "subcategory", id: sub.id, label: `${category.name} › ${sub.name}` });
      }
    }
  }
  return parts;
}

export function removeCategoryFilterPart(filter: CategoryFilter, part: CategoryFilterPart): CategoryFilter {
  return part.kind === "category"
    ? { ...filter, categoryIds: filter.categoryIds.filter((id) => id !== part.id) }
    : { ...filter, subcategoryIds: filter.subcategoryIds.filter((id) => id !== part.id) };
}

/** Short name of the selection for the total: "Mercado", "Mercado e Lanche", "Mercado e mais 2". */
export function categoryFilterLabel(filter: CategoryFilter, categories: FilterCategory[]): string {
  const names = categoryFilterParts(filter, categories).map((p) =>
    p.kind === "subcategory" ? p.label.split(" › ")[1] : p.label,
  );
  if (names.length === 0) return "Todas as categorias";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names[0]} e mais ${names.length - 1}`;
}

/**
 * What a new entry starts with while the list is filtered: the single category or
 * subcategory selected (nothing when several are), and income for an income category.
 */
export function categoryEntryPresets(
  filter: CategoryFilter,
  categories: FilterCategory[],
): { categoryId?: string; subcategoryId?: string; type?: EntryType } {
  const parts = categoryFilterParts(filter, categories);
  if (parts.length !== 1) return {};
  const [part] = parts;
  const category =
    part.kind === "category"
      ? categories.find((c) => c.id === part.id)
      : categories.find((c) => c.subcategories.some((s) => s.id === part.id));
  if (!category) return {};
  return {
    categoryId: category.id,
    subcategoryId: part.kind === "subcategory" ? part.id : undefined,
    type: category.type === "income" ? "income" : "expense",
  };
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/**
 * Categories matching the search, by their name or a subcategory's name. A category
 * found by its own name keeps every subcategory; otherwise only the matching ones.
 */
export function searchCategories(categories: FilterCategory[], query: string): FilterCategory[] {
  const q = normalize(query);
  if (!q) return categories;
  return categories.flatMap((category) => {
    if (normalize(category.name).includes(q)) return [category];
    const subcategories = category.subcategories.filter((s) => normalize(s.name).includes(q));
    return subcategories.length > 0 ? [{ ...category, subcategories }] : [];
  });
}
