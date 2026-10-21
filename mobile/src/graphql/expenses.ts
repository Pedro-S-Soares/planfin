import { gql } from "@apollo/client";

export type ExpenseAuthor = { id: string; email: string };

export type ExpenseWithAuthor = {
  id: string;
  amount: string;
  date: string;
  note: string | null;
  isExtra: boolean | null;
  type: string | null;
  countsInBudget: boolean | null;
  installmentNumber: number | null;
  installmentCount: number | null;
  source: string | null;
  account: { id: string; name: string; kind: string } | null;
  subcategory: {
    id: string;
    name: string;
    category: { id: string; name: string; icon: string | null } | null;
  } | null;
  createdBy: ExpenseAuthor | null;
};

export type HistoryAccountRef = { id: string; name: string; kind: string };

export type HistoryTransfer = {
  id: string;
  amount: string;
  date: string;
  kind: string | null;
  note: string | null;
  fromAccount: HistoryAccountRef | null;
  toAccount: HistoryAccountRef | null;
  createdBy: ExpenseAuthor | null;
};

export type ExpenseDayWithAuthors = {
  date: string;
  total: string;
  expenses: ExpenseWithAuthor[];
  transfers: HistoryTransfer[];
};

export const EXPENSE_HISTORY_WITH_AUTHORS = gql`
  query ExpenseHistoryWithAuthors($periodId: ID!) {
    expenseHistory(periodId: $periodId) {
      date
      total
      expenses {
        id
        amount
        date
        note
        isExtra
        type
        countsInBudget
        installmentNumber
        installmentCount
        source
        account {
          id
          name
          kind
        }
        subcategory {
          id
          name
          category {
            id
            name
            icon
          }
        }
        createdBy {
          id
          email
        }
      }
      transfers {
        id
        amount
        date
        kind
        note
        fromAccount {
          id
          name
          kind
        }
        toAccount {
          id
          name
          kind
        }
        createdBy {
          id
          email
        }
      }
    }
  }
`;
