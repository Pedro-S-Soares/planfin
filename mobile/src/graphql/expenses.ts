import { gql } from "@apollo/client";

export type ExpenseAuthor = { id: string; email: string };

export type ExpenseWithAuthor = {
  id: string;
  amount: string;
  date: string;
  note: string | null;
  subcategory: { id: string; name: string } | null;
  createdBy: ExpenseAuthor | null;
};

export type ExpenseDayWithAuthors = {
  date: string;
  total: string;
  expenses: ExpenseWithAuthor[];
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
        subcategory {
          id
          name
        }
        createdBy {
          id
          email
        }
      }
    }
  }
`;
