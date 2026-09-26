import type { CategoryInfo } from "./types";

export const OTHER_CATEGORY_ID = "__other";
export const OTHER_CATEGORY_NAME = "Outros";
export const OTHER_COLOR = "#8E8CA8";

/**
 * Categorical slots, in fixed order. Validated for colour-vision deficiency
 * separation between neighbours and ≥3:1 contrast on white (dataviz validator).
 * Darker steps of the app's CategoryColors hues, so identities stay familiar.
 */
const SLOTS = ["#EA580C", "#059669", "#0284C7", "#DB2777", "#7C3AED", "#A16207", "#0891B2", "#9F1239"];

/** Seeded categories keep the slot matching their hue in the app's CategoryColors. */
const PREFERRED_SLOT: Record<string, number> = {
  Alimentação: 0,
  Saúde: 1,
  Transporte: 2,
  Compras: 3,
  Lazer: 4,
};

/**
 * Assigns each category a colour that follows the category (never its rank),
 * so filters don't repaint survivors. Categories past the palette fold into "Outros".
 */
export function assignCategoryColors(categories: { id: string; name: string }[]): {
  byId: Map<string, CategoryInfo>;
  /** Maps any category id to the id its facts are grouped under */
  resolve: (categoryId: string | null | undefined) => string;
} {
  const byId = new Map<string, CategoryInfo>();
  const taken = new Set<number>();
  // A user category literally called "Outros" (seeded by default) is the fold bucket itself.
  const isOther = (name: string) => name.trim().toLowerCase() === OTHER_CATEGORY_NAME.toLowerCase();
  const coloured = categories.filter((c) => !isOther(c.name));

  coloured.forEach((c) => {
    const slot = PREFERRED_SLOT[c.name];
    if (slot !== undefined && !taken.has(slot)) {
      taken.add(slot);
      byId.set(c.id, { id: c.id, name: c.name, color: SLOTS[slot] });
    }
  });

  let next = 0;
  coloured.forEach((c) => {
    if (byId.has(c.id)) return;
    while (taken.has(next)) next += 1;
    if (next >= SLOTS.length) return;
    taken.add(next);
    byId.set(c.id, { id: c.id, name: c.name, color: SLOTS[next] });
  });

  byId.set(OTHER_CATEGORY_ID, { id: OTHER_CATEGORY_ID, name: OTHER_CATEGORY_NAME, color: OTHER_COLOR });

  const resolve = (categoryId: string | null | undefined) =>
    categoryId && byId.has(categoryId) ? categoryId : OTHER_CATEGORY_ID;

  return { byId, resolve };
}

/** Mixes a hex colour towards white; t=0 keeps it, t=1 is white. */
export function tint(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c + (255 - c) * t);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
