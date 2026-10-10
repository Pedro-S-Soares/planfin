type SubcategoryLike =
  | {
      name?: string | null;
      category?: { name?: string | null } | null;
    }
  | null
  | undefined;

/**
 * How a subcategory is named everywhere: "Categoria - Subcategoria".
 * The same subcategory name can exist in different categories ("Saúde" of the
 * pet and "Saúde" of the house), so the bare name is ambiguous.
 */
export function subcategoryLabel(subcategory: SubcategoryLike, fallback = "Sem categoria"): string {
  const name = subcategory?.name?.trim();
  if (!name) return fallback;
  const category = subcategory?.category?.name?.trim();
  return category ? `${category} - ${name}` : name;
}

/** Same format from the two names, for places that hold them separately. */
export function joinCategoryLabel(category: string | null | undefined, subcategory: string): string {
  return category?.trim() ? `${category.trim()} - ${subcategory}` : subcategory;
}
