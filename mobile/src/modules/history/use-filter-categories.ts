import { useMemo } from "react";
import { useCategoriesQuery } from "../../graphql/__generated__/hooks";
import type { FilterCategory } from "./category-filter";

/** Every category of the group (spending and income) with its subcategories, for the category filter. */
export function useFilterCategories(): FilterCategory[] {
  const { data } = useCategoriesQuery({ fetchPolicy: "cache-and-network" });

  return useMemo(
    () =>
      (data?.categories ?? []).flatMap((c) =>
        c?.id && c.name
          ? [
              {
                id: c.id,
                name: c.name,
                icon: c.icon,
                type: c.type,
                subcategories: (c.subcategories ?? []).flatMap((s) => (s?.id && s.name ? [{ id: s.id, name: s.name }] : [])),
              },
            ]
          : [],
      ),
    [data],
  );
}
