import { useMemo } from "react";
import { useFinancialAccountsQuery, type FinancialAccountsQuery } from "../../graphql/__generated__/hooks";
import { toISODate } from "../../lib/date";
import { isAccountKind, type AccountKind } from "./format";

type RawAccount = NonNullable<NonNullable<FinancialAccountsQuery["financialAccounts"]>[number]>;

export type FinancialAccount = Omit<RawAccount, "kind" | "id" | "name"> & {
  id: string;
  name: string;
  kind: AccountKind;
};

function normalize(raw: FinancialAccountsQuery["financialAccounts"]): FinancialAccount[] {
  return (raw ?? []).flatMap((a) =>
    a?.id && a.name && isAccountKind(a.kind) ? [{ ...a, id: a.id, name: a.name, kind: a.kind }] : [],
  );
}

/** Accounts of the active group with live balances. */
export function useFinancialAccounts() {
  const query = useFinancialAccountsQuery({
    variables: { today: toISODate(new Date()) },
    fetchPolicy: "cache-and-network",
  });

  const accounts = useMemo(() => normalize(query.data?.financialAccounts), [query.data]);
  const cards = useMemo(() => accounts.filter((a) => a.kind === "credit_card"), [accounts]);
  const primary = useMemo(() => accounts.find((a) => a.isPrimary) ?? null, [accounts]);

  return {
    accounts,
    cards,
    primary,
    loading: query.loading && !query.data,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Default account for a new spending entry: the first card, else the primary account. */
export function defaultSpendingAccountId(accounts: FinancialAccount[]): string | null {
  return (
    accounts.find((a) => a.kind === "credit_card")?.id ??
    accounts.find((a) => a.isPrimary)?.id ??
    null
  );
}
