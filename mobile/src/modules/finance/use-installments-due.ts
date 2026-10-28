import { useMemo } from "react";
import { useInstallmentsDueQuery, type InstallmentsDueQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { toNumber } from "./format";

type RawInvoice = NonNullable<NonNullable<InstallmentsDueQuery["installmentsDue"]>[number]>;
export type InstallmentEntry = NonNullable<NonNullable<RawInvoice["entries"]>[number]>;

export type InstallmentInvoice = {
  cardId: string;
  month: string;
  dueDate: string | null;
  isPaid: boolean;
  entries: InstallmentEntry[];
  total: number;
};

function normalize(raw: InstallmentsDueQuery["installmentsDue"]): InstallmentInvoice[] {
  return (raw ?? []).flatMap((invoice) => {
    if (!invoice?.cardId || !invoice.month) return [];
    const entries = (invoice.entries ?? []).filter((e): e is InstallmentEntry => e !== null);
    return [{
      cardId: invoice.cardId,
      month: invoice.month,
      dueDate: invoice.dueDate ?? null,
      isPaid: invoice.status === "paid",
      entries,
      total: entries.reduce((sum, e) => sum + toNumber(e.amount), 0),
    }];
  });
}

/** Installments on the card invoices due in `month` (YYYY-MM), one group per invoice. */
export function useInstallmentsDue(month: string) {
  const query = useInstallmentsDueQuery({
    variables: { month, today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });

  const invoices = useMemo(() => normalize(query.data?.installmentsDue), [query.data]);

  return {
    invoices,
    loading: query.loading && !query.data,
    error: query.error,
    refetch: query.refetch,
  };
}
