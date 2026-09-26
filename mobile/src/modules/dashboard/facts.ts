import type { DashboardDataQuery } from "../../graphql/__generated__/hooks";
import { assignCategoryColors } from "./palette";
import type { CategoryInfo, Fact } from "./types";

const NO_SUBCATEGORY = "Sem subcategoria";

function authorName(
  author: { id?: string | null; name?: string | null; email?: string | null } | null | undefined,
  currentUserId: string | undefined,
): string {
  if (!author) return "Desconhecido";
  if (currentUserId && author.id === currentUserId) return "Você";
  if (author.name) return author.name;
  return author.email ? author.email.split("@")[0] : "Desconhecido";
}

/** Normalises the API payload into facts + the colour-assigned category map. */
export function buildFacts(
  data: DashboardDataQuery,
  currentUserId: string | undefined,
): { facts: Fact[]; categories: Map<string, CategoryInfo> } {
  const categoryList = (data.categories ?? []).flatMap((c) =>
    c?.id && c.name ? [{ id: c.id, name: c.name }] : [],
  );
  const { byId, resolve } = assignCategoryColors(categoryList);

  const facts = (data.expensesInRange ?? []).flatMap((e): Fact[] => {
    if (!e?.id || !e.date || !e.amount) return [];
    const amount = Number(e.amount);
    if (!Number.isFinite(amount)) return [];
    return [
      {
        id: e.id,
        amount,
        date: e.date,
        isExtra: e.isExtra ?? false,
        categoryId: resolve(e.subcategory?.categoryId),
        subcategoryName: e.subcategory?.name ?? NO_SUBCATEGORY,
        authorId: e.createdBy?.id ?? "unknown",
        authorName: authorName(e.createdBy, currentUserId),
      },
    ];
  });

  return { facts, categories: byId };
}
