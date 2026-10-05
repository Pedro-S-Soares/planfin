/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AccountMovement = {
  __typename?: 'AccountMovement';
  /** Signed from the account's point of view */
  amount?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  /** entry | transfer */
  kind?: Maybe<Scalars['String']['output']>;
};

/** End-of-cycle left over, split between the allowance accounts */
export type AllowancePlan = {
  __typename?: 'AllowancePlan';
  amount?: Maybe<Scalars['String']['output']>;
  canDistribute?: Maybe<Scalars['Boolean']['output']>;
  cycleEndDate?: Maybe<Scalars['String']['output']>;
  /** Allowance already transferred in this cycle */
  distributed?: Maybe<Scalars['String']['output']>;
  free?: Maybe<Scalars['String']['output']>;
  /** First day the distribution is offered (cycle closing) */
  opensOn?: Maybe<Scalars['String']['output']>;
  shares?: Maybe<Array<Maybe<AllowanceShare>>>;
  /** Part of the free money kept because the next salary can't cover what is on it */
  shortfall?: Maybe<Scalars['String']['output']>;
};

export type AllowanceShare = {
  __typename?: 'AllowanceShare';
  accountId?: Maybe<Scalars['ID']['output']>;
  accountName?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['String']['output']>;
  ownerName?: Maybe<Scalars['String']['output']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

/** A recurring bill in a given month */
export type BillOccurrence = {
  __typename?: 'BillOccurrence';
  /** Real amount when paid, estimate otherwise */
  amount?: Maybe<Scalars['String']['output']>;
  bill?: Maybe<RecurringBill>;
  dueDate?: Maybe<Scalars['String']['output']>;
  expenseId?: Maybe<Scalars['ID']['output']>;
  /** YYYY-MM */
  month?: Maybe<Scalars['String']['output']>;
  /** Due date of the following month */
  nextDueDate?: Maybe<Scalars['String']['output']>;
  /** Date of the payment/charge when paid */
  paidOn?: Maybe<Scalars['String']['output']>;
  /** pending | overdue | paid | skipped */
  status?: Maybe<Scalars['String']['output']>;
};

export type BudgetDay = {
  __typename?: 'BudgetDay';
  availableBalance?: Maybe<Scalars['String']['output']>;
  carryover?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  dailyLimit?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  spent?: Maybe<Scalars['String']['output']>;
};

export type Category = {
  __typename?: 'Category';
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  subcategories?: Maybe<Array<Maybe<Subcategory>>>;
  type?: Maybe<Scalars['String']['output']>;
};

/** Something that must leave the primary account before the next money arrives */
export type Commitment = {
  __typename?: 'Commitment';
  amount?: Maybe<Scalars['String']['output']>;
  billId?: Maybe<Scalars['ID']['output']>;
  cardId?: Maybe<Scalars['ID']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  /** invoice | bill */
  kind?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** Budget proposal for a salary cycle */
export type CycleProposal = {
  __typename?: 'CycleProposal';
  /** Fixed bills paid from accounts */
  accountBills?: Maybe<Scalars['String']['output']>;
  /** salary − bills − installments, before the gordura */
  available?: Maybe<Scalars['String']['output']>;
  /** Fixed bills charged on cards */
  cardBills?: Maybe<Scalars['String']['output']>;
  days?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  /** Installments 2..N landing on the invoice this cycle pays into */
  installments?: Maybe<Scalars['String']['output']>;
  salary?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
};

export type Expense = {
  __typename?: 'Expense';
  account?: Maybe<ExpenseAccount>;
  amount?: Maybe<Scalars['String']['output']>;
  /** false = outside the daily/period budget (installments 2..N, bills, salary) */
  countsInBudget?: Maybe<Scalars['Boolean']['output']>;
  createdBy?: Maybe<User>;
  date?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  installmentCount?: Maybe<Scalars['Int']['output']>;
  installmentGroupId?: Maybe<Scalars['ID']['output']>;
  installmentNumber?: Maybe<Scalars['Int']['output']>;
  isExtra?: Maybe<Scalars['Boolean']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  /** What produced the entry: salary | bill | benefit_credit | invoice_adjustment | anticipation | null */
  source?: Maybe<Scalars['String']['output']>;
  subcategory?: Maybe<Subcategory>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ExpenseAccount = {
  __typename?: 'ExpenseAccount';
  id?: Maybe<Scalars['ID']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ExpenseDay = {
  __typename?: 'ExpenseDay';
  date?: Maybe<Scalars['String']['output']>;
  expenses?: Maybe<Array<Maybe<Expense>>>;
  total?: Maybe<Scalars['String']['output']>;
};

export type FinancePanel = {
  __typename?: 'FinancePanel';
  /** Tenho: live balance of the primary account */
  available?: Maybe<Scalars['String']['output']>;
  commitments?: Maybe<Array<Maybe<Commitment>>>;
  /** Comprometido: invoices and bills due until horizonDate */
  committed?: Maybe<Scalars['String']['output']>;
  /** Posso gastar: available − committed */
  free?: Maybe<Scalars['String']['output']>;
  hasAccounts?: Maybe<Scalars['Boolean']['output']>;
  horizonDate?: Maybe<Scalars['String']['output']>;
  primaryAccountId?: Maybe<Scalars['ID']['output']>;
  salary?: Maybe<SalaryInfo>;
};

/** Checking account, credit card, allowance account or reserve of the group */
export type FinancialAccount = {
  __typename?: 'FinancialAccount';
  /** Live balance (nil for cards) */
  balance?: Maybe<Scalars['String']['output']>;
  balanceDate?: Maybe<Scalars['String']['output']>;
  closingDay?: Maybe<Scalars['Int']['output']>;
  /** Benefit accounts: day of the month the credit arrives */
  creditDay?: Maybe<Scalars['Int']['output']>;
  dueDay?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  /** Target for the card invoice */
  invoiceGoal?: Maybe<Scalars['String']['output']>;
  isPrimary?: Maybe<Scalars['Boolean']['output']>;
  /** checking | credit_card | allowance | reserve | benefit */
  kind?: Maybe<Scalars['String']['output']>;
  /** Benefit accounts: amount credited every month */
  monthlyCredit?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nextCreditDate?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
};

export type FinancialSettings = {
  __typename?: 'FinancialSettings';
  reserveGoal?: Maybe<Scalars['String']['output']>;
  salaryAccountId?: Maybe<Scalars['ID']['output']>;
  salaryAmount?: Maybe<Scalars['String']['output']>;
  salaryBusinessDay?: Maybe<Scalars['Int']['output']>;
  /** Next salary dates (with manual overrides applied) */
  upcomingSalaryDates?: Maybe<Array<Maybe<SalaryDate>>>;
};

export type Group = {
  __typename?: 'Group';
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['Int']['output']>;
};

export type GroupInvite = {
  __typename?: 'GroupInvite';
  code?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['String']['output']>;
  maxUses?: Maybe<Scalars['Int']['output']>;
  revokedAt?: Maybe<Scalars['String']['output']>;
  usesCount?: Maybe<Scalars['Int']['output']>;
};

export type GroupMember = {
  __typename?: 'GroupMember';
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  isOwner?: Maybe<Scalars['Boolean']['output']>;
  joinedAt?: Maybe<Scalars['String']['output']>;
};

/** Credit card invoice of a month, computed from the card's entries */
export type Invoice = {
  __typename?: 'Invoice';
  cardId?: Maybe<Scalars['ID']['output']>;
  closingDate?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  entries?: Maybe<Array<Maybe<Expense>>>;
  /** YYYY-MM */
  month?: Maybe<Scalars['String']['output']>;
  paid?: Maybe<Scalars['String']['output']>;
  remaining?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  /** open | closed | partial | paid | overdue */
  status?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['String']['output']>;
};

export type MonthPlan = {
  __typename?: 'MonthPlan';
  current?: Maybe<MonthPlanCurrent>;
  next?: Maybe<MonthPlanNext>;
};

/** This month: today until the eve of next month's salary */
export type MonthPlanCurrent = {
  __typename?: 'MonthPlanCurrent';
  afterInvoices?: Maybe<Scalars['String']['output']>;
  /** Primary account balance today */
  balance?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  /** Recurring bills paid from accounts */
  fixedBills?: Maybe<Array<Maybe<PlanItem>>>;
  hasPrimary?: Maybe<Scalars['Boolean']['output']>;
  /** Expected incomes still to come */
  incomes?: Maybe<Array<Maybe<PlanItem>>>;
  /** Card invoices due in the window */
  invoices?: Maybe<Array<Maybe<PlanItem>>>;
  /** What is left at the month closing (allowance when positive) */
  leftover?: Maybe<Scalars['String']['output']>;
  /** One-off bills paid from accounts */
  oneOffBills?: Maybe<Array<Maybe<PlanItem>>>;
  /** Salaries still to come in the window */
  salaries?: Maybe<Array<Maybe<PlanItem>>>;
};

/** Next month: the cycle opened by next month's salary */
export type MonthPlanNext = {
  __typename?: 'MonthPlanNext';
  /** Meal voucher balances */
  benefits?: Maybe<Array<Maybe<PlanItem>>>;
  days?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  /** Every recurring bill (accounts and cards) */
  fixedBills?: Maybe<Array<Maybe<PlanItem>>>;
  installments?: Maybe<Array<Maybe<PlanItem>>>;
  /** Left for variable spending */
  remaining?: Maybe<Scalars['String']['output']>;
  salary?: Maybe<PlanItem>;
  startDate?: Maybe<Scalars['String']['output']>;
};

export type Period = {
  __typename?: 'Period';
  availableBalance?: Maybe<Scalars['String']['output']>;
  dailyLimit?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  extraBudget?: Maybe<Scalars['String']['output']>;
  extraRemaining?: Maybe<Scalars['String']['output']>;
  extraSpent?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  remainingTotal?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  today?: Maybe<BudgetDay>;
  totalBudget?: Maybe<Scalars['String']['output']>;
};

export type PeriodSummary = {
  __typename?: 'PeriodSummary';
  daysCount?: Maybe<Scalars['Int']['output']>;
  difference?: Maybe<Scalars['String']['output']>;
  totalBudgeted?: Maybe<Scalars['String']['output']>;
  totalSpent?: Maybe<Scalars['String']['output']>;
};

export type PlanItem = {
  __typename?: 'PlanItem';
  amount?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
};

export type RecurringBill = {
  __typename?: 'RecurringBill';
  account?: Maybe<ExpenseAccount>;
  /** Estimated monthly amount */
  amount?: Maybe<Scalars['String']['output']>;
  /** expense | income */
  direction?: Maybe<Scalars['String']['output']>;
  dueDay?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** YYYY-MM when it happens only in that month */
  onceMonth?: Maybe<Scalars['String']['output']>;
  subcategory?: Maybe<Subcategory>;
};

export type RedeemInvitePayload = {
  __typename?: 'RedeemInvitePayload';
  group?: Maybe<Group>;
  invite?: Maybe<GroupInvite>;
};

export type ReserveStatus = {
  __typename?: 'ReserveStatus';
  goal?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['String']['output']>;
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  /** Replace the installments after this one by a single entry on its invoice */
  anticipateInstallments?: Maybe<Expense>;
  /** Use a daily goal from today until the eve of next month's salary */
  applyDailyGoal?: Maybe<Period>;
  archiveFinancialAccount?: Maybe<Scalars['Boolean']['output']>;
  /** Move the entries without account dated on/after fromDate to the account. Returns how many moved. */
  assignEntriesToAccount?: Maybe<Scalars['Int']['output']>;
  createCategory?: Maybe<Category>;
  createExpense?: Maybe<Expense>;
  createFinancialAccount?: Maybe<FinancialAccount>;
  createGroup?: Maybe<Group>;
  createInvite?: Maybe<UserInvite>;
  createPeriod?: Maybe<Period>;
  createRecurringBill?: Maybe<RecurringBill>;
  createSubcategory?: Maybe<Subcategory>;
  createTransfer?: Maybe<Transfer>;
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  deleteExpense?: Maybe<Scalars['Boolean']['output']>;
  deleteGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteRecurringBill?: Maybe<Scalars['Boolean']['output']>;
  deleteSubcategory?: Maybe<Scalars['Boolean']['output']>;
  deleteTransfer?: Maybe<Scalars['Boolean']['output']>;
  /** Transfer the end-of-cycle left over to the allowance accounts in equal parts */
  distributeAllowance?: Maybe<AllowancePlan>;
  forgotPassword?: Maybe<Scalars['Boolean']['output']>;
  generateInviteCode?: Maybe<GroupInvite>;
  leaveGroup?: Maybe<Scalars['Boolean']['output']>;
  login?: Maybe<AuthPayload>;
  logout?: Maybe<Scalars['Boolean']['output']>;
  makePrimaryAccount?: Maybe<FinancialAccount>;
  /** Mark the bill of a month as paid, recording the real amount */
  payBill?: Maybe<BillOccurrence>;
  /** Pay (part of) a card invoice from another account */
  payInvoice?: Maybe<Invoice>;
  redeemInviteCode?: Maybe<RedeemInvitePayload>;
  /** Record the salary as income on the salary account */
  registerSalary?: Maybe<Expense>;
  registerUser?: Maybe<AuthPayload>;
  removeMember?: Maybe<Scalars['Boolean']['output']>;
  renameGroup?: Maybe<Group>;
  resetPassword?: Maybe<Scalars['Boolean']['output']>;
  revokeInvite?: Maybe<Scalars['Boolean']['output']>;
  revokeInviteCode?: Maybe<Scalars['Boolean']['output']>;
  /** Reconcile the account with the bank: its balance today becomes `balance` */
  setAccountBalance?: Maybe<FinancialAccount>;
  /** Set the invoice total to the bank's number; the difference becomes one adjustment entry */
  setInvoiceTotal?: Maybe<Invoice>;
  /** Manual salary date for a month (null date restores the automatic one) */
  setSalaryDate?: Maybe<Scalars['Boolean']['output']>;
  switchActiveGroup?: Maybe<Group>;
  unpayBill?: Maybe<Scalars['Boolean']['output']>;
  updateCategory?: Maybe<Category>;
  updateExpense?: Maybe<Expense>;
  updateFinancialAccount?: Maybe<FinancialAccount>;
  updateFinancialSettings?: Maybe<FinancialSettings>;
  updatePeriod?: Maybe<Period>;
  updateProfile?: Maybe<User>;
  updateRecurringBill?: Maybe<RecurringBill>;
  updateSubcategory?: Maybe<Subcategory>;
};


export type RootMutationTypeAnticipateInstallmentsArgs = {
  amount?: InputMaybe<Scalars['String']['input']>;
  expenseId: Scalars['ID']['input'];
};


export type RootMutationTypeApplyDailyGoalArgs = {
  daily: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeArchiveFinancialAccountArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeAssignEntriesToAccountArgs = {
  accountId: Scalars['ID']['input'];
  fromDate: Scalars['String']['input'];
};


export type RootMutationTypeCreateCategoryArgs = {
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateExpenseArgs = {
  accountId?: InputMaybe<Scalars['ID']['input']>;
  amount: Scalars['String']['input'];
  amountPerInstallment?: InputMaybe<Scalars['Boolean']['input']>;
  countsInBudget?: InputMaybe<Scalars['Boolean']['input']>;
  date: Scalars['String']['input'];
  firstInvoice?: InputMaybe<Scalars['String']['input']>;
  installments?: InputMaybe<Scalars['Int']['input']>;
  isExtra?: InputMaybe<Scalars['Boolean']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateFinancialAccountArgs = {
  balance?: InputMaybe<Scalars['String']['input']>;
  closingDay?: InputMaybe<Scalars['Int']['input']>;
  creditDay?: InputMaybe<Scalars['Int']['input']>;
  dueDay?: InputMaybe<Scalars['Int']['input']>;
  kind: Scalars['String']['input'];
  monthlyCredit?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerUserId?: InputMaybe<Scalars['ID']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateGroupArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypeCreatePeriodArgs = {
  dailyLimit: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  totalBudget?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateRecurringBillArgs = {
  accountId: Scalars['ID']['input'];
  amount: Scalars['String']['input'];
  direction?: InputMaybe<Scalars['String']['input']>;
  dueDay: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  onceMonth?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeCreateSubcategoryArgs = {
  categoryId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type RootMutationTypeCreateTransferArgs = {
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
  fromAccountId: Scalars['ID']['input'];
  kind?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  toAccountId: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteGroupArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRecurringBillArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteSubcategoryArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteTransferArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDistributeAllowanceArgs = {
  amount?: InputMaybe<Scalars['String']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type RootMutationTypeGenerateInviteCodeArgs = {
  expiresInDays?: InputMaybe<Scalars['Int']['input']>;
  groupId: Scalars['ID']['input'];
  maxUses?: InputMaybe<Scalars['Int']['input']>;
};


export type RootMutationTypeLeaveGroupArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type RootMutationTypeMakePrimaryAccountArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypePayBillArgs = {
  amount: Scalars['String']['input'];
  billId: Scalars['ID']['input'];
  date: Scalars['String']['input'];
  month: Scalars['String']['input'];
};


export type RootMutationTypePayInvoiceArgs = {
  amount: Scalars['String']['input'];
  cardId: Scalars['ID']['input'];
  date: Scalars['String']['input'];
  fromAccountId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
};


export type RootMutationTypeRedeemInviteCodeArgs = {
  code: Scalars['String']['input'];
};


export type RootMutationTypeRegisterSalaryArgs = {
  amount?: InputMaybe<Scalars['String']['input']>;
  date: Scalars['String']['input'];
};


export type RootMutationTypeRegisterUserArgs = {
  email: Scalars['String']['input'];
  inviteToken: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type RootMutationTypeRemoveMemberArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['Int']['input'];
};


export type RootMutationTypeRenameGroupArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type RootMutationTypeResetPasswordArgs = {
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type RootMutationTypeRevokeInviteArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeRevokeInviteCodeArgs = {
  inviteId: Scalars['ID']['input'];
};


export type RootMutationTypeSetAccountBalanceArgs = {
  balance: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeSetInvoiceTotalArgs = {
  cardId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
  total: Scalars['String']['input'];
};


export type RootMutationTypeSetSalaryDateArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
};


export type RootMutationTypeSwitchActiveGroupArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUnpayBillArgs = {
  billId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
};


export type RootMutationTypeUpdateCategoryArgs = {
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdateExpenseArgs = {
  accountId?: InputMaybe<Scalars['ID']['input']>;
  amount?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isExtra?: InputMaybe<Scalars['Boolean']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdateFinancialAccountArgs = {
  closingDay?: InputMaybe<Scalars['Int']['input']>;
  creditDay?: InputMaybe<Scalars['Int']['input']>;
  dueDay?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  invoiceGoal?: InputMaybe<Scalars['String']['input']>;
  monthlyCredit?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ownerUserId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeUpdateFinancialSettingsArgs = {
  reserveGoal?: InputMaybe<Scalars['String']['input']>;
  salaryAccountId?: InputMaybe<Scalars['ID']['input']>;
  salaryAmount?: InputMaybe<Scalars['String']['input']>;
  salaryBusinessDay?: InputMaybe<Scalars['Int']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdatePeriodArgs = {
  dailyLimit?: InputMaybe<Scalars['String']['input']>;
  totalBudget?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdateProfileArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdateRecurringBillArgs = {
  accountId?: InputMaybe<Scalars['ID']['input']>;
  amount?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  dueDay?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  onceMonth?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeUpdateSubcategoryArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  accountMovements?: Maybe<Array<Maybe<AccountMovement>>>;
  activeGroup?: Maybe<Group>;
  activePeriod?: Maybe<Period>;
  allowancePlan?: Maybe<AllowancePlan>;
  billOccurrences?: Maybe<Array<Maybe<BillOccurrence>>>;
  categories?: Maybe<Array<Maybe<Category>>>;
  cycleProposal?: Maybe<CycleProposal>;
  expenseHistory?: Maybe<Array<Maybe<ExpenseDay>>>;
  /** Expenses dated within [from, to] (ISO dates, inclusive, max 400 days), across periods */
  expensesInRange?: Maybe<Array<Maybe<Expense>>>;
  financePanel?: Maybe<FinancePanel>;
  financialAccounts?: Maybe<Array<Maybe<FinancialAccount>>>;
  financialSettings?: Maybe<FinancialSettings>;
  groupInvites?: Maybe<Array<Maybe<GroupInvite>>>;
  groupMembers?: Maybe<Array<Maybe<GroupMember>>>;
  groupPeriods?: Maybe<Array<Maybe<Period>>>;
  /** All entries of the installment purchase the expense belongs to */
  installments?: Maybe<Array<Maybe<Expense>>>;
  invoice?: Maybe<Invoice>;
  /** Invoices of a card: closed ones before the current, the current and future ones with installments */
  invoices?: Maybe<Array<Maybe<Invoice>>>;
  listInvites?: Maybe<Array<Maybe<UserInvite>>>;
  me?: Maybe<User>;
  /** The monthly plan; null when the salary is not configured */
  monthPlan?: Maybe<MonthPlan>;
  myGroups?: Maybe<Array<Maybe<Group>>>;
  periodSummary?: Maybe<PeriodSummary>;
  periods?: Maybe<Array<Maybe<Period>>>;
  recurringBills?: Maybe<Array<Maybe<RecurringBill>>>;
  reserveStatus?: Maybe<ReserveStatus>;
};


export type RootQueryTypeAccountMovementsArgs = {
  accountId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeActivePeriodArgs = {
  periodId?: InputMaybe<Scalars['ID']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeAllowancePlanArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeBillOccurrencesArgs = {
  month: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeCategoriesArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeCycleProposalArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeExpenseHistoryArgs = {
  periodId: Scalars['ID']['input'];
};


export type RootQueryTypeExpensesInRangeArgs = {
  from: Scalars['String']['input'];
  to: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeFinancePanelArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeFinancialAccountsArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeFinancialSettingsArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeGroupInvitesArgs = {
  groupId: Scalars['ID']['input'];
};


export type RootQueryTypeGroupMembersArgs = {
  groupId: Scalars['ID']['input'];
};


export type RootQueryTypeInstallmentsArgs = {
  expenseId: Scalars['ID']['input'];
};


export type RootQueryTypeInvoiceArgs = {
  cardId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeInvoicesArgs = {
  cardId: Scalars['ID']['input'];
  past?: InputMaybe<Scalars['Int']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeMonthPlanArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypePeriodSummaryArgs = {
  periodId: Scalars['ID']['input'];
};


export type RootQueryTypeReserveStatusArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};

export type SalaryDate = {
  __typename?: 'SalaryDate';
  date?: Maybe<Scalars['String']['output']>;
  isManual?: Maybe<Scalars['Boolean']['output']>;
  /** YYYY-MM */
  month?: Maybe<Scalars['String']['output']>;
};

export type SalaryInfo = {
  __typename?: 'SalaryInfo';
  amount?: Maybe<Scalars['String']['output']>;
  configured?: Maybe<Scalars['Boolean']['output']>;
  /** First day of the current cycle (this cycle's salary date) */
  cycleStartDate?: Maybe<Scalars['String']['output']>;
  nextSalaryDate?: Maybe<Scalars['String']['output']>;
  /** The salary of the current cycle has not been registered yet */
  pending?: Maybe<Scalars['Boolean']['output']>;
};

export type Subcategory = {
  __typename?: 'Subcategory';
  category?: Maybe<SubcategoryCategory>;
  categoryId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type SubcategoryCategory = {
  __typename?: 'SubcategoryCategory';
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Transfer = {
  __typename?: 'Transfer';
  amount?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  fromAccountId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  invoiceMonth?: Maybe<Scalars['String']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  toAccountId?: Maybe<Scalars['ID']['output']>;
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isAdmin?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type UserInvite = {
  __typename?: 'UserInvite';
  expiresAt?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['String']['output']>;
  invitedBy?: Maybe<User>;
  revokedAt?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  usedAt?: Maybe<Scalars['String']['output']>;
  usedByEmail?: Maybe<Scalars['String']['output']>;
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'RootMutationType', login?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null, isAdmin?: boolean | null } | null } | null };

export type RegisterUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
  inviteToken: Scalars['String']['input'];
}>;


export type RegisterUserMutation = { __typename?: 'RootMutationType', registerUser?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null, isAdmin?: boolean | null } | null } | null };

export type CreateInviteMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateInviteMutation = { __typename?: 'RootMutationType', createInvite?: { __typename?: 'UserInvite', id?: string | null, token?: string | null, usedByEmail?: string | null, usedAt?: string | null, expiresAt?: string | null, revokedAt?: string | null, insertedAt?: string | null } | null };

export type RevokeInviteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RevokeInviteMutation = { __typename?: 'RootMutationType', revokeInvite?: boolean | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'RootMutationType', logout?: boolean | null };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordMutation = { __typename?: 'RootMutationType', forgotPassword?: boolean | null };

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
}>;


export type ResetPasswordMutation = { __typename?: 'RootMutationType', resetPassword?: boolean | null };

export type UpdateProfileMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateProfileMutation = { __typename?: 'RootMutationType', updateProfile?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null } | null };

export type CreatePeriodMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  dailyLimit: Scalars['String']['input'];
  totalBudget?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreatePeriodMutation = { __typename?: 'RootMutationType', createPeriod?: { __typename?: 'Period', id?: string | null, name?: string | null, status?: string | null, dailyLimit?: string | null, totalBudget?: string | null, remainingTotal?: string | null } | null };

export type UpdatePeriodMutationVariables = Exact<{
  dailyLimit?: InputMaybe<Scalars['String']['input']>;
  totalBudget?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdatePeriodMutation = { __typename?: 'RootMutationType', updatePeriod?: { __typename?: 'Period', id?: string | null, dailyLimit?: string | null, totalBudget?: string | null, remainingTotal?: string | null, status?: string | null } | null };

export type CreateExpenseMutationVariables = Exact<{
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  isExtra?: InputMaybe<Scalars['Boolean']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  accountId?: InputMaybe<Scalars['ID']['input']>;
  installments?: InputMaybe<Scalars['Int']['input']>;
  firstInvoice?: InputMaybe<Scalars['String']['input']>;
  amountPerInstallment?: InputMaybe<Scalars['Boolean']['input']>;
  countsInBudget?: InputMaybe<Scalars['Boolean']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateExpenseMutation = { __typename?: 'RootMutationType', createExpense?: { __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, isExtra?: boolean | null, countsInBudget?: boolean | null, installmentCount?: number | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null } | null, createdBy?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null };

export type UpdateExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  amount?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  isExtra?: InputMaybe<Scalars['Boolean']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  accountId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpdateExpenseMutation = { __typename?: 'RootMutationType', updateExpense?: { __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, isExtra?: boolean | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null } | null } | null };

export type DeleteExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteExpenseMutation = { __typename?: 'RootMutationType', deleteExpense?: boolean | null };

export type CreateCategoryMutationVariables = Exact<{
  name: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateCategoryMutation = { __typename?: 'RootMutationType', createCategory?: { __typename?: 'Category', id?: string | null, name?: string | null, type?: string | null, icon?: string | null, subcategories?: Array<{ __typename?: 'Subcategory', id?: string | null, name?: string | null } | null> | null } | null };

export type UpdateCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateCategoryMutation = { __typename?: 'RootMutationType', updateCategory?: { __typename?: 'Category', id?: string | null, name?: string | null, type?: string | null, icon?: string | null } | null };

export type DeleteCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCategoryMutation = { __typename?: 'RootMutationType', deleteCategory?: boolean | null };

export type CreateSubcategoryMutationVariables = Exact<{
  categoryId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type CreateSubcategoryMutation = { __typename?: 'RootMutationType', createSubcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null } | null };

export type DeleteSubcategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSubcategoryMutation = { __typename?: 'RootMutationType', deleteSubcategory?: boolean | null };

export type AnticipateInstallmentsMutationVariables = Exact<{
  expenseId: Scalars['ID']['input'];
  amount?: InputMaybe<Scalars['String']['input']>;
}>;


export type AnticipateInstallmentsMutation = { __typename?: 'RootMutationType', anticipateInstallments?: { __typename?: 'Expense', id?: string | null, amount?: string | null, note?: string | null } | null };

export type CreateFinancialAccountMutationVariables = Exact<{
  name: Scalars['String']['input'];
  kind: Scalars['String']['input'];
  balance?: InputMaybe<Scalars['String']['input']>;
  closingDay?: InputMaybe<Scalars['Int']['input']>;
  dueDay?: InputMaybe<Scalars['Int']['input']>;
  monthlyCredit?: InputMaybe<Scalars['String']['input']>;
  creditDay?: InputMaybe<Scalars['Int']['input']>;
  ownerUserId?: InputMaybe<Scalars['ID']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateFinancialAccountMutation = { __typename?: 'RootMutationType', createFinancialAccount?: { __typename?: 'FinancialAccount', id?: string | null, name?: string | null, kind?: string | null, isPrimary?: boolean | null, balance?: string | null, closingDay?: number | null, dueDay?: number | null } | null };

export type UpdateFinancialAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  closingDay?: InputMaybe<Scalars['Int']['input']>;
  dueDay?: InputMaybe<Scalars['Int']['input']>;
  monthlyCredit?: InputMaybe<Scalars['String']['input']>;
  creditDay?: InputMaybe<Scalars['Int']['input']>;
  ownerUserId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpdateFinancialAccountMutation = { __typename?: 'RootMutationType', updateFinancialAccount?: { __typename?: 'FinancialAccount', id?: string | null, name?: string | null, closingDay?: number | null, dueDay?: number | null, monthlyCredit?: string | null, creditDay?: number | null } | null };

export type SetInvoiceGoalMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  invoiceGoal?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetInvoiceGoalMutation = { __typename?: 'RootMutationType', updateFinancialAccount?: { __typename?: 'FinancialAccount', id?: string | null, invoiceGoal?: string | null } | null };

export type MakePrimaryAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MakePrimaryAccountMutation = { __typename?: 'RootMutationType', makePrimaryAccount?: { __typename?: 'FinancialAccount', id?: string | null, isPrimary?: boolean | null } | null };

export type ArchiveFinancialAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ArchiveFinancialAccountMutation = { __typename?: 'RootMutationType', archiveFinancialAccount?: boolean | null };

export type SetAccountBalanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  balance: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetAccountBalanceMutation = { __typename?: 'RootMutationType', setAccountBalance?: { __typename?: 'FinancialAccount', id?: string | null, balance?: string | null, balanceDate?: string | null } | null };

export type CreateTransferMutationVariables = Exact<{
  fromAccountId: Scalars['ID']['input'];
  toAccountId: Scalars['ID']['input'];
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
  kind?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTransferMutation = { __typename?: 'RootMutationType', createTransfer?: { __typename?: 'Transfer', id?: string | null } | null };

export type PayInvoiceMutationVariables = Exact<{
  cardId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
  fromAccountId: Scalars['ID']['input'];
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
}>;


export type PayInvoiceMutation = { __typename?: 'RootMutationType', payInvoice?: { __typename?: 'Invoice', month?: string | null, status?: string | null, paid?: string | null, remaining?: string | null } | null };

export type AssignEntriesToAccountMutationVariables = Exact<{
  accountId: Scalars['ID']['input'];
  fromDate: Scalars['String']['input'];
}>;


export type AssignEntriesToAccountMutation = { __typename?: 'RootMutationType', assignEntriesToAccount?: number | null };

export type CreateRecurringBillMutationVariables = Exact<{
  name: Scalars['String']['input'];
  amount: Scalars['String']['input'];
  dueDay: Scalars['Int']['input'];
  accountId: Scalars['ID']['input'];
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  onceMonth?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateRecurringBillMutation = { __typename?: 'RootMutationType', createRecurringBill?: { __typename?: 'RecurringBill', id?: string | null } | null };

export type UpdateRecurringBillMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<Scalars['String']['input']>;
  dueDay?: InputMaybe<Scalars['Int']['input']>;
  accountId?: InputMaybe<Scalars['ID']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  onceMonth?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateRecurringBillMutation = { __typename?: 'RootMutationType', updateRecurringBill?: { __typename?: 'RecurringBill', id?: string | null } | null };

export type DeleteRecurringBillMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteRecurringBillMutation = { __typename?: 'RootMutationType', deleteRecurringBill?: boolean | null };

export type PayBillMutationVariables = Exact<{
  billId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
}>;


export type PayBillMutation = { __typename?: 'RootMutationType', payBill?: { __typename?: 'BillOccurrence', status?: string | null, amount?: string | null } | null };

export type UnpayBillMutationVariables = Exact<{
  billId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
}>;


export type UnpayBillMutation = { __typename?: 'RootMutationType', unpayBill?: boolean | null };

export type UpdateFinancialSettingsMutationVariables = Exact<{
  salaryAmount?: InputMaybe<Scalars['String']['input']>;
  salaryBusinessDay?: InputMaybe<Scalars['Int']['input']>;
  salaryAccountId?: InputMaybe<Scalars['ID']['input']>;
  reserveGoal?: InputMaybe<Scalars['String']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateFinancialSettingsMutation = { __typename?: 'RootMutationType', updateFinancialSettings?: { __typename?: 'FinancialSettings', salaryAmount?: string | null, salaryBusinessDay?: number | null, salaryAccountId?: string | null, reserveGoal?: string | null } | null };

export type SetSalaryDateMutationVariables = Exact<{
  month: Scalars['String']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetSalaryDateMutation = { __typename?: 'RootMutationType', setSalaryDate?: boolean | null };

export type RegisterSalaryMutationVariables = Exact<{
  amount?: InputMaybe<Scalars['String']['input']>;
  date: Scalars['String']['input'];
}>;


export type RegisterSalaryMutation = { __typename?: 'RootMutationType', registerSalary?: { __typename?: 'Expense', id?: string | null, amount?: string | null } | null };

export type DistributeAllowanceMutationVariables = Exact<{
  amount?: InputMaybe<Scalars['String']['input']>;
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type DistributeAllowanceMutation = { __typename?: 'RootMutationType', distributeAllowance?: { __typename?: 'AllowancePlan', amount?: string | null, distributed?: string | null, canDistribute?: boolean | null } | null };

export type SetReserveGoalMutationVariables = Exact<{
  reserveGoal?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetReserveGoalMutation = { __typename?: 'RootMutationType', updateFinancialSettings?: { __typename?: 'FinancialSettings', reserveGoal?: string | null } | null };

export type SetInvoiceTotalMutationVariables = Exact<{
  cardId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
  total: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetInvoiceTotalMutation = { __typename?: 'RootMutationType', setInvoiceTotal?: { __typename?: 'Invoice', month?: string | null, total?: string | null, remaining?: string | null, status?: string | null } | null };

export type ApplyDailyGoalMutationVariables = Exact<{
  daily: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type ApplyDailyGoalMutation = { __typename?: 'RootMutationType', applyDailyGoal?: { __typename?: 'Period', id?: string | null, startDate?: string | null, endDate?: string | null, dailyLimit?: string | null } | null };

export type CreateGroupMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateGroupMutation = { __typename?: 'RootMutationType', createGroup?: { __typename?: 'Group', id?: string | null, name?: string | null, ownerId?: number | null } | null };

export type RenameGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type RenameGroupMutation = { __typename?: 'RootMutationType', renameGroup?: { __typename?: 'Group', id?: string | null, name?: string | null } | null };

export type DeleteGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'RootMutationType', deleteGroup?: boolean | null };

export type SwitchActiveGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SwitchActiveGroupMutation = { __typename?: 'RootMutationType', switchActiveGroup?: { __typename?: 'Group', id?: string | null, name?: string | null } | null };

export type LeaveGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type LeaveGroupMutation = { __typename?: 'RootMutationType', leaveGroup?: boolean | null };

export type RemoveMemberMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['Int']['input'];
}>;


export type RemoveMemberMutation = { __typename?: 'RootMutationType', removeMember?: boolean | null };

export type GenerateInviteCodeMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  expiresInDays?: InputMaybe<Scalars['Int']['input']>;
  maxUses?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GenerateInviteCodeMutation = { __typename?: 'RootMutationType', generateInviteCode?: { __typename?: 'GroupInvite', id?: string | null, code?: string | null, expiresAt?: string | null, maxUses?: number | null, usesCount?: number | null } | null };

export type RevokeInviteCodeMutationVariables = Exact<{
  inviteId: Scalars['ID']['input'];
}>;


export type RevokeInviteCodeMutation = { __typename?: 'RootMutationType', revokeInviteCode?: boolean | null };

export type RedeemInviteCodeMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type RedeemInviteCodeMutation = { __typename?: 'RootMutationType', redeemInviteCode?: { __typename?: 'RedeemInvitePayload', group?: { __typename?: 'Group', id?: string | null, name?: string | null } | null, invite?: { __typename?: 'GroupInvite', id?: string | null, code?: string | null } | null } | null };

export type ActivePeriodQueryVariables = Exact<{
  today: Scalars['String']['input'];
  periodId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ActivePeriodQuery = { __typename?: 'RootQueryType', activePeriod?: { __typename?: 'Period', id?: string | null, startDate?: string | null, endDate?: string | null, dailyLimit?: string | null, totalBudget?: string | null, remainingTotal?: string | null, extraBudget?: string | null, extraSpent?: string | null, extraRemaining?: string | null, status?: string | null, today?: { __typename?: 'BudgetDay', id?: string | null, date?: string | null, dailyLimit?: string | null, carryover?: string | null, availableBalance?: string | null, spent?: string | null, closedAt?: string | null } | null } | null };

export type GroupPeriodsQueryVariables = Exact<{ [key: string]: never; }>;


export type GroupPeriodsQuery = { __typename?: 'RootQueryType', groupPeriods?: Array<{ __typename?: 'Period', id?: string | null, name?: string | null, startDate?: string | null, endDate?: string | null, dailyLimit?: string | null, totalBudget?: string | null, status?: string | null, availableBalance?: string | null } | null> | null };

export type ExpenseHistoryQueryVariables = Exact<{
  periodId: Scalars['ID']['input'];
}>;


export type ExpenseHistoryQuery = { __typename?: 'RootQueryType', expenseHistory?: Array<{ __typename?: 'ExpenseDay', date?: string | null, total?: string | null, expenses?: Array<{ __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null, category?: { __typename?: 'SubcategoryCategory', id?: string | null, name?: string | null, icon?: string | null } | null } | null, createdBy?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null> | null } | null> | null };

export type CategoriesQueryVariables = Exact<{
  type?: InputMaybe<Scalars['String']['input']>;
}>;


export type CategoriesQuery = { __typename?: 'RootQueryType', categories?: Array<{ __typename?: 'Category', id?: string | null, name?: string | null, type?: string | null, icon?: string | null, subcategories?: Array<{ __typename?: 'Subcategory', id?: string | null, name?: string | null } | null> | null } | null> | null };

export type InstallmentsQueryVariables = Exact<{
  expenseId: Scalars['ID']['input'];
}>;


export type InstallmentsQuery = { __typename?: 'RootQueryType', installments?: Array<{ __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, installmentNumber?: number | null, installmentCount?: number | null } | null> | null };

export type DashboardDataQueryVariables = Exact<{
  from: Scalars['String']['input'];
  to: Scalars['String']['input'];
}>;


export type DashboardDataQuery = { __typename?: 'RootQueryType', expensesInRange?: Array<{ __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, isExtra?: boolean | null, createdBy?: { __typename?: 'User', id?: string | null, name?: string | null, email?: string | null } | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null, categoryId?: string | null } | null } | null> | null, categories?: Array<{ __typename?: 'Category', id?: string | null, name?: string | null, subcategories?: Array<{ __typename?: 'Subcategory', id?: string | null, name?: string | null } | null> | null } | null> | null };

export type FinancialAccountsQueryVariables = Exact<{
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinancialAccountsQuery = { __typename?: 'RootQueryType', financialAccounts?: Array<{ __typename?: 'FinancialAccount', id?: string | null, name?: string | null, kind?: string | null, isPrimary?: boolean | null, balance?: string | null, balanceDate?: string | null, closingDay?: number | null, dueDay?: number | null, invoiceGoal?: string | null, monthlyCredit?: string | null, creditDay?: number | null, nextCreditDate?: string | null, owner?: { __typename?: 'User', id?: string | null, name?: string | null, email?: string | null } | null } | null> | null };

export type InvoicesQueryVariables = Exact<{
  cardId: Scalars['ID']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
  past?: InputMaybe<Scalars['Int']['input']>;
}>;


export type InvoicesQuery = { __typename?: 'RootQueryType', invoices?: Array<{ __typename?: 'Invoice', cardId?: string | null, month?: string | null, startDate?: string | null, closingDate?: string | null, dueDate?: string | null, total?: string | null, paid?: string | null, remaining?: string | null, status?: string | null } | null> | null };

export type InvoiceQueryVariables = Exact<{
  cardId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type InvoiceQuery = { __typename?: 'RootQueryType', invoice?: { __typename?: 'Invoice', cardId?: string | null, month?: string | null, startDate?: string | null, closingDate?: string | null, dueDate?: string | null, total?: string | null, paid?: string | null, remaining?: string | null, status?: string | null, entries?: Array<{ __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, type?: string | null, isExtra?: boolean | null, countsInBudget?: boolean | null, installmentNumber?: number | null, installmentCount?: number | null, source?: string | null, account?: { __typename?: 'ExpenseAccount', id?: string | null, name?: string | null, kind?: string | null } | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null, category?: { __typename?: 'SubcategoryCategory', id?: string | null, name?: string | null, icon?: string | null } | null } | null, createdBy?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null> | null } | null };

export type AccountMovementsQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AccountMovementsQuery = { __typename?: 'RootQueryType', accountMovements?: Array<{ __typename?: 'AccountMovement', id?: string | null, kind?: string | null, date?: string | null, description?: string | null, amount?: string | null } | null> | null };

export type FinancePanelQueryVariables = Exact<{
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinancePanelQuery = { __typename?: 'RootQueryType', financePanel?: { __typename?: 'FinancePanel', hasAccounts?: boolean | null, primaryAccountId?: string | null, available?: string | null, committed?: string | null, free?: string | null, horizonDate?: string | null, commitments?: Array<{ __typename?: 'Commitment', kind?: string | null, label?: string | null, dueDate?: string | null, amount?: string | null, status?: string | null, cardId?: string | null, billId?: string | null, month?: string | null } | null> | null, salary?: { __typename?: 'SalaryInfo', configured?: boolean | null, amount?: string | null, cycleStartDate?: string | null, nextSalaryDate?: string | null, pending?: boolean | null } | null } | null };

export type RecurringBillsQueryVariables = Exact<{ [key: string]: never; }>;


export type RecurringBillsQuery = { __typename?: 'RootQueryType', recurringBills?: Array<{ __typename?: 'RecurringBill', id?: string | null, name?: string | null, amount?: string | null, dueDay?: number | null, direction?: string | null, onceMonth?: string | null, account?: { __typename?: 'ExpenseAccount', id?: string | null, name?: string | null, kind?: string | null } | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null, categoryId?: string | null } | null } | null> | null };

export type BillOccurrencesQueryVariables = Exact<{
  month: Scalars['String']['input'];
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type BillOccurrencesQuery = { __typename?: 'RootQueryType', billOccurrences?: Array<{ __typename?: 'BillOccurrence', month?: string | null, dueDate?: string | null, nextDueDate?: string | null, paidOn?: string | null, status?: string | null, amount?: string | null, expenseId?: string | null, bill?: { __typename?: 'RecurringBill', id?: string | null, name?: string | null, amount?: string | null, dueDay?: number | null, direction?: string | null, onceMonth?: string | null, account?: { __typename?: 'ExpenseAccount', id?: string | null, name?: string | null, kind?: string | null } | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null, categoryId?: string | null } | null } | null } | null> | null };

export type FinancialSettingsQueryVariables = Exact<{
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinancialSettingsQuery = { __typename?: 'RootQueryType', financialSettings?: { __typename?: 'FinancialSettings', salaryAmount?: string | null, salaryBusinessDay?: number | null, salaryAccountId?: string | null, reserveGoal?: string | null, upcomingSalaryDates?: Array<{ __typename?: 'SalaryDate', month?: string | null, date?: string | null, isManual?: boolean | null } | null> | null } | null };

export type AllowancePlanQueryVariables = Exact<{
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllowancePlanQuery = { __typename?: 'RootQueryType', allowancePlan?: { __typename?: 'AllowancePlan', cycleEndDate?: string | null, opensOn?: string | null, free?: string | null, shortfall?: string | null, amount?: string | null, canDistribute?: boolean | null, distributed?: string | null, shares?: Array<{ __typename?: 'AllowanceShare', accountId?: string | null, accountName?: string | null, ownerName?: string | null, amount?: string | null } | null> | null } | null };

export type ReserveStatusQueryVariables = Exact<{
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type ReserveStatusQuery = { __typename?: 'RootQueryType', reserveStatus?: { __typename?: 'ReserveStatus', goal?: string | null, total?: string | null } | null };

export type MonthPlanQueryVariables = Exact<{
  today?: InputMaybe<Scalars['String']['input']>;
}>;


export type MonthPlanQuery = { __typename?: 'RootQueryType', monthPlan?: { __typename?: 'MonthPlan', current?: { __typename?: 'MonthPlanCurrent', endDate?: string | null, hasPrimary?: boolean | null, balance?: string | null, afterInvoices?: string | null, leftover?: string | null, salaries?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, incomes?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, invoices?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, fixedBills?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, oneOffBills?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null } | null, next?: { __typename?: 'MonthPlanNext', startDate?: string | null, endDate?: string | null, days?: number | null, remaining?: string | null, salary?: { __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null, benefits?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, fixedBills?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, installments?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null } | null } | null };

export type MyGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyGroupsQuery = { __typename?: 'RootQueryType', myGroups?: Array<{ __typename?: 'Group', id?: string | null, name?: string | null, ownerId?: number | null, insertedAt?: string | null } | null> | null };

export type ActiveGroupQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveGroupQuery = { __typename?: 'RootQueryType', activeGroup?: { __typename?: 'Group', id?: string | null, name?: string | null, ownerId?: number | null } | null };

export type GroupMembersQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GroupMembersQuery = { __typename?: 'RootQueryType', groupMembers?: Array<{ __typename?: 'GroupMember', id?: number | null, email?: string | null, joinedAt?: string | null, isOwner?: boolean | null } | null> | null };

export type GroupInvitesQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GroupInvitesQuery = { __typename?: 'RootQueryType', groupInvites?: Array<{ __typename?: 'GroupInvite', id?: string | null, code?: string | null, expiresAt?: string | null, maxUses?: number | null, usesCount?: number | null, insertedAt?: string | null } | null> | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, isAdmin?: boolean | null } | null };

export type ListInvitesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListInvitesQuery = { __typename?: 'RootQueryType', listInvites?: Array<{ __typename?: 'UserInvite', id?: string | null, token?: string | null, usedByEmail?: string | null, usedAt?: string | null, expiresAt?: string | null, revokedAt?: string | null, insertedAt?: string | null } | null> | null };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isAdmin"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"passwordConfirmation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}}},{"kind":"Argument","name":{"kind":"Name","value":"inviteToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isAdmin"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const CreateInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInvite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"usedByEmail"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<CreateInviteMutation, CreateInviteMutationVariables>;
export const RevokeInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RevokeInviteMutation, RevokeInviteMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"passwordConfirmation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const CreatePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dailyLimit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"dailyLimit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dailyLimit"}}},{"kind":"Argument","name":{"kind":"Name","value":"totalBudget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"remainingTotal"}}]}}]}}]} as unknown as DocumentNode<CreatePeriodMutation, CreatePeriodMutationVariables>;
export const UpdatePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dailyLimit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dailyLimit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dailyLimit"}}},{"kind":"Argument","name":{"kind":"Name","value":"totalBudget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"remainingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdatePeriodMutation, UpdatePeriodMutationVariables>;
export const CreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isExtra"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"installments"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstInvoice"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amountPerInstallment"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"countsInBudget"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}},{"kind":"Argument","name":{"kind":"Name","value":"isExtra"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isExtra"}}},{"kind":"Argument","name":{"kind":"Name","value":"subcategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"installments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"installments"}}},{"kind":"Argument","name":{"kind":"Name","value":"firstInvoice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstInvoice"}}},{"kind":"Argument","name":{"kind":"Name","value":"amountPerInstallment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amountPerInstallment"}}},{"kind":"Argument","name":{"kind":"Name","value":"countsInBudget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"countsInBudget"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isExtra"}},{"kind":"Field","name":{"kind":"Name","value":"countsInBudget"}},{"kind":"Field","name":{"kind":"Name","value":"installmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const UpdateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isExtra"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}},{"kind":"Argument","name":{"kind":"Name","value":"isExtra"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isExtra"}}},{"kind":"Argument","name":{"kind":"Name","value":"subcategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isExtra"}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateExpenseMutation, UpdateExpenseMutationVariables>;
export const DeleteExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"icon"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"icon"},"value":{"kind":"Variable","name":{"kind":"Name","value":"icon"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"subcategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"icon"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"icon"},"value":{"kind":"Variable","name":{"kind":"Name","value":"icon"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const CreateSubcategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSubcategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubcategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"categoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateSubcategoryMutation, CreateSubcategoryMutationVariables>;
export const DeleteSubcategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSubcategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSubcategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSubcategoryMutation, DeleteSubcategoryMutationVariables>;
export const AnticipateInstallmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AnticipateInstallments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"anticipateInstallments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<AnticipateInstallmentsMutation, AnticipateInstallmentsMutationVariables>;
export const CreateFinancialAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFinancialAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"balance"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"closingDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"monthlyCredit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"creditDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerUserId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFinancialAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"balance"},"value":{"kind":"Variable","name":{"kind":"Name","value":"balance"}}},{"kind":"Argument","name":{"kind":"Name","value":"closingDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"closingDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"dueDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"monthlyCredit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"monthlyCredit"}}},{"kind":"Argument","name":{"kind":"Name","value":"creditDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"creditDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"ownerUserId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerUserId"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"closingDay"}},{"kind":"Field","name":{"kind":"Name","value":"dueDay"}}]}}]}}]} as unknown as DocumentNode<CreateFinancialAccountMutation, CreateFinancialAccountMutationVariables>;
export const UpdateFinancialAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFinancialAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"closingDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"monthlyCredit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"creditDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerUserId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFinancialAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"closingDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"closingDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"dueDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"monthlyCredit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"monthlyCredit"}}},{"kind":"Argument","name":{"kind":"Name","value":"creditDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"creditDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"ownerUserId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerUserId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"closingDay"}},{"kind":"Field","name":{"kind":"Name","value":"dueDay"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyCredit"}},{"kind":"Field","name":{"kind":"Name","value":"creditDay"}}]}}]}}]} as unknown as DocumentNode<UpdateFinancialAccountMutation, UpdateFinancialAccountMutationVariables>;
export const SetInvoiceGoalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetInvoiceGoal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invoiceGoal"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFinancialAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"invoiceGoal"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invoiceGoal"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceGoal"}}]}}]}}]} as unknown as DocumentNode<SetInvoiceGoalMutation, SetInvoiceGoalMutationVariables>;
export const MakePrimaryAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MakePrimaryAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"makePrimaryAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}}]}}]}}]} as unknown as DocumentNode<MakePrimaryAccountMutation, MakePrimaryAccountMutationVariables>;
export const ArchiveFinancialAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveFinancialAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveFinancialAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ArchiveFinancialAccountMutation, ArchiveFinancialAccountMutationVariables>;
export const SetAccountBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAccountBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"balance"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAccountBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"balance"},"value":{"kind":"Variable","name":{"kind":"Name","value":"balance"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDate"}}]}}]}}]} as unknown as DocumentNode<SetAccountBalanceMutation, SetAccountBalanceMutationVariables>;
export const CreateTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromAccountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toAccountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromAccountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromAccountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"toAccountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toAccountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTransferMutation, CreateTransferMutationVariables>;
export const PayInvoiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PayInvoice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromAccountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payInvoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromAccountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromAccountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}}]}}]}}]} as unknown as DocumentNode<PayInvoiceMutation, PayInvoiceMutationVariables>;
export const AssignEntriesToAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignEntriesToAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignEntriesToAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}}]}]}}]} as unknown as DocumentNode<AssignEntriesToAccountMutation, AssignEntriesToAccountMutationVariables>;
export const CreateRecurringBillDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRecurringBill"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"direction"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"onceMonth"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRecurringBill"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"dueDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"subcategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"direction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"direction"}}},{"kind":"Argument","name":{"kind":"Name","value":"onceMonth"},"value":{"kind":"Variable","name":{"kind":"Name","value":"onceMonth"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateRecurringBillMutation, CreateRecurringBillMutationVariables>;
export const UpdateRecurringBillDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRecurringBill"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"direction"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"onceMonth"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRecurringBill"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"dueDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dueDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"subcategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"direction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"direction"}}},{"kind":"Argument","name":{"kind":"Name","value":"onceMonth"},"value":{"kind":"Variable","name":{"kind":"Name","value":"onceMonth"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateRecurringBillMutation, UpdateRecurringBillMutationVariables>;
export const DeleteRecurringBillDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRecurringBill"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRecurringBill"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteRecurringBillMutation, DeleteRecurringBillMutationVariables>;
export const PayBillDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PayBill"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"billId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payBill"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"billId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"billId"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<PayBillMutation, PayBillMutationVariables>;
export const UnpayBillDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnpayBill"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"billId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unpayBill"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"billId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"billId"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}}]}]}}]} as unknown as DocumentNode<UnpayBillMutation, UnpayBillMutationVariables>;
export const UpdateFinancialSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFinancialSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"salaryAmount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"salaryBusinessDay"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"salaryAccountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reserveGoal"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFinancialSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"salaryAmount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"salaryAmount"}}},{"kind":"Argument","name":{"kind":"Name","value":"salaryBusinessDay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"salaryBusinessDay"}}},{"kind":"Argument","name":{"kind":"Name","value":"salaryAccountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"salaryAccountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reserveGoal"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reserveGoal"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"salaryBusinessDay"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"reserveGoal"}}]}}]}}]} as unknown as DocumentNode<UpdateFinancialSettingsMutation, UpdateFinancialSettingsMutationVariables>;
export const SetSalaryDateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetSalaryDate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSalaryDate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}]}]}}]} as unknown as DocumentNode<SetSalaryDateMutation, SetSalaryDateMutationVariables>;
export const RegisterSalaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterSalary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerSalary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<RegisterSalaryMutation, RegisterSalaryMutationVariables>;
export const DistributeAllowanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DistributeAllowance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distributeAllowance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"distributed"}},{"kind":"Field","name":{"kind":"Name","value":"canDistribute"}}]}}]}}]} as unknown as DocumentNode<DistributeAllowanceMutation, DistributeAllowanceMutationVariables>;
export const SetReserveGoalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetReserveGoal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reserveGoal"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFinancialSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"reserveGoal"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reserveGoal"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reserveGoal"}}]}}]}}]} as unknown as DocumentNode<SetReserveGoalMutation, SetReserveGoalMutationVariables>;
export const SetInvoiceTotalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetInvoiceTotal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"total"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setInvoiceTotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"total"},"value":{"kind":"Variable","name":{"kind":"Name","value":"total"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SetInvoiceTotalMutation, SetInvoiceTotalMutationVariables>;
export const ApplyDailyGoalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApplyDailyGoal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"daily"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applyDailyGoal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"daily"},"value":{"kind":"Variable","name":{"kind":"Name","value":"daily"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}}]}}]}}]} as unknown as DocumentNode<ApplyDailyGoalMutation, ApplyDailyGoalMutationVariables>;
export const CreateGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
export const RenameGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RenameGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renameGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RenameGroupMutation, RenameGroupMutationVariables>;
export const DeleteGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const SwitchActiveGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwitchActiveGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"switchActiveGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SwitchActiveGroupMutation, SwitchActiveGroupMutationVariables>;
export const LeaveGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LeaveGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<LeaveGroupMutation, LeaveGroupMutationVariables>;
export const RemoveMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const GenerateInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxUses"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expiresInDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxUses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxUses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"maxUses"}},{"kind":"Field","name":{"kind":"Name","value":"usesCount"}}]}}]}}]} as unknown as DocumentNode<GenerateInviteCodeMutation, GenerateInviteCodeMutationVariables>;
export const RevokeInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}}}]}]}}]} as unknown as DocumentNode<RevokeInviteCodeMutation, RevokeInviteCodeMutationVariables>;
export const RedeemInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RedeemInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redeemInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<RedeemInviteCodeMutation, RedeemInviteCodeMutationVariables>;
export const ActivePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActivePeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activePeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}},{"kind":"Argument","name":{"kind":"Name","value":"periodId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"remainingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"extraBudget"}},{"kind":"Field","name":{"kind":"Name","value":"extraSpent"}},{"kind":"Field","name":{"kind":"Name","value":"extraRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"today"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"carryover"}},{"kind":"Field","name":{"kind":"Name","value":"availableBalance"}},{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ActivePeriodQuery, ActivePeriodQueryVariables>;
export const GroupPeriodsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GroupPeriods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupPeriods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"availableBalance"}}]}}]}}]} as unknown as DocumentNode<GroupPeriodsQuery, GroupPeriodsQueryVariables>;
export const ExpenseHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"subcategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const InstallmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Installments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"installmentNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installmentCount"}}]}}]}}]} as unknown as DocumentNode<InstallmentsQuery, InstallmentsQueryVariables>;
export const DashboardDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expensesInRange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isExtra"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"StringValue","value":"expense","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subcategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<DashboardDataQuery, DashboardDataQueryVariables>;
export const FinancialAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinancialAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financialAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDate"}},{"kind":"Field","name":{"kind":"Name","value":"closingDay"}},{"kind":"Field","name":{"kind":"Name","value":"dueDay"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceGoal"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyCredit"}},{"kind":"Field","name":{"kind":"Name","value":"creditDay"}},{"kind":"Field","name":{"kind":"Name","value":"nextCreditDate"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<FinancialAccountsQuery, FinancialAccountsQueryVariables>;
export const InvoicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Invoices"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"past"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}},{"kind":"Argument","name":{"kind":"Name","value":"past"},"value":{"kind":"Variable","name":{"kind":"Name","value":"past"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cardId"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"closingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<InvoicesQuery, InvoicesQueryVariables>;
export const InvoiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Invoice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cardId"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"closingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isExtra"}},{"kind":"Field","name":{"kind":"Name","value":"countsInBudget"}},{"kind":"Field","name":{"kind":"Name","value":"installmentNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<InvoiceQuery, InvoiceQueryVariables>;
export const AccountMovementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountMovements"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountMovements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<AccountMovementsQuery, AccountMovementsQueryVariables>;
export const FinancePanelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinancePanel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financePanel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasAccounts"}},{"kind":"Field","name":{"kind":"Name","value":"primaryAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"committed"}},{"kind":"Field","name":{"kind":"Name","value":"free"}},{"kind":"Field","name":{"kind":"Name","value":"horizonDate"}},{"kind":"Field","name":{"kind":"Name","value":"commitments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cardId"}},{"kind":"Field","name":{"kind":"Name","value":"billId"}},{"kind":"Field","name":{"kind":"Name","value":"month"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"configured"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"cycleStartDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextSalaryDate"}},{"kind":"Field","name":{"kind":"Name","value":"pending"}}]}}]}}]}}]} as unknown as DocumentNode<FinancePanelQuery, FinancePanelQueryVariables>;
export const RecurringBillsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecurringBills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recurringBills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDay"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"onceMonth"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}}]}}]}}]}}]} as unknown as DocumentNode<RecurringBillsQuery, RecurringBillsQueryVariables>;
export const BillOccurrencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BillOccurrences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billOccurrences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextDueDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidOn"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseId"}},{"kind":"Field","name":{"kind":"Name","value":"bill"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDay"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"onceMonth"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}}]}}]}}]}}]}}]} as unknown as DocumentNode<BillOccurrencesQuery, BillOccurrencesQueryVariables>;
export const FinancialSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinancialSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financialSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"salaryBusinessDay"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"reserveGoal"}},{"kind":"Field","name":{"kind":"Name","value":"upcomingSalaryDates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}}]}}]}}]}}]} as unknown as DocumentNode<FinancialSettingsQuery, FinancialSettingsQueryVariables>;
export const AllowancePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllowancePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allowancePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cycleEndDate"}},{"kind":"Field","name":{"kind":"Name","value":"opensOn"}},{"kind":"Field","name":{"kind":"Name","value":"free"}},{"kind":"Field","name":{"kind":"Name","value":"shortfall"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"canDistribute"}},{"kind":"Field","name":{"kind":"Name","value":"distributed"}},{"kind":"Field","name":{"kind":"Name","value":"shares"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"ownerName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]} as unknown as DocumentNode<AllowancePlanQuery, AllowancePlanQueryVariables>;
export const ReserveStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReserveStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reserveStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<ReserveStatusQuery, ReserveStatusQueryVariables>;
export const MonthPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MonthPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"hasPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"salaries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"incomes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"afterInvoices"}},{"kind":"Field","name":{"kind":"Name","value":"fixedBills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"oneOffBills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leftover"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"days"}},{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"benefits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fixedBills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"installments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}}]}}]}}]}}]} as unknown as DocumentNode<MonthPlanQuery, MonthPlanQueryVariables>;
export const MyGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<MyGroupsQuery, MyGroupsQueryVariables>;
export const ActiveGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveGroup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeGroup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<ActiveGroupQuery, ActiveGroupQueryVariables>;
export const GroupMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GroupMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isOwner"}}]}}]}}]} as unknown as DocumentNode<GroupMembersQuery, GroupMembersQueryVariables>;
export const GroupInvitesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GroupInvites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupInvites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"maxUses"}},{"kind":"Field","name":{"kind":"Name","value":"usesCount"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<GroupInvitesQuery, GroupInvitesQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isAdmin"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const ListInvitesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListInvites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listInvites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"usedByEmail"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<ListInvitesQuery, ListInvitesQueryVariables>;