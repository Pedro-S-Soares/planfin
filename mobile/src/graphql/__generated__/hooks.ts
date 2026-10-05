import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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
  /** Money in the account on the invoice due date, after paying it */
  afterInvoices?: Maybe<Scalars['String']['output']>;
  /** Primary account balance today */
  balance?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  /** Recurring bills paid from accounts */
  fixedBills?: Maybe<Array<Maybe<PlanItem>>>;
  hasPrimary?: Maybe<Scalars['Boolean']['output']>;
  /** Expected incomes still to come */
  incomes?: Maybe<Array<Maybe<PlanItem>>>;
  /** Latest due date of the invoices in the window; inflows up to it count before the 'resto' */
  invoiceDueDate?: Maybe<Scalars['String']['output']>;
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


export type MonthPlanQuery = { __typename?: 'RootQueryType', monthPlan?: { __typename?: 'MonthPlan', current?: { __typename?: 'MonthPlanCurrent', endDate?: string | null, hasPrimary?: boolean | null, balance?: string | null, invoiceDueDate?: string | null, afterInvoices?: string | null, leftover?: string | null, salaries?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, incomes?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, invoices?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, fixedBills?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, oneOffBills?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null } | null, next?: { __typename?: 'MonthPlanNext', startDate?: string | null, endDate?: string | null, days?: number | null, remaining?: string | null, salary?: { __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null, benefits?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, fixedBills?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null, installments?: Array<{ __typename?: 'PlanItem', label?: string | null, date?: string | null, amount?: string | null } | null> | null } | null } | null };

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


export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      isAdmin
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const RegisterUserDocument = gql`
    mutation RegisterUser($email: String!, $password: String!, $passwordConfirmation: String!, $inviteToken: String!) {
  registerUser(
    email: $email
    password: $password
    passwordConfirmation: $passwordConfirmation
    inviteToken: $inviteToken
  ) {
    token
    user {
      id
      email
      isAdmin
    }
  }
}
    `;
export type RegisterUserMutationFn = Apollo.MutationFunction<RegisterUserMutation, RegisterUserMutationVariables>;

/**
 * __useRegisterUserMutation__
 *
 * To run a mutation, you first call `useRegisterUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerUserMutation, { data, loading, error }] = useRegisterUserMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *      inviteToken: // value for 'inviteToken'
 *   },
 * });
 */
export function useRegisterUserMutation(baseOptions?: Apollo.MutationHookOptions<RegisterUserMutation, RegisterUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterUserMutation, RegisterUserMutationVariables>(RegisterUserDocument, options);
      }
export type RegisterUserMutationHookResult = ReturnType<typeof useRegisterUserMutation>;
export type RegisterUserMutationResult = Apollo.MutationResult<RegisterUserMutation>;
export type RegisterUserMutationOptions = Apollo.BaseMutationOptions<RegisterUserMutation, RegisterUserMutationVariables>;
export const CreateInviteDocument = gql`
    mutation CreateInvite {
  createInvite {
    id
    token
    usedByEmail
    usedAt
    expiresAt
    revokedAt
    insertedAt
  }
}
    `;
export type CreateInviteMutationFn = Apollo.MutationFunction<CreateInviteMutation, CreateInviteMutationVariables>;

/**
 * __useCreateInviteMutation__
 *
 * To run a mutation, you first call `useCreateInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInviteMutation, { data, loading, error }] = useCreateInviteMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateInviteMutation(baseOptions?: Apollo.MutationHookOptions<CreateInviteMutation, CreateInviteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateInviteMutation, CreateInviteMutationVariables>(CreateInviteDocument, options);
      }
export type CreateInviteMutationHookResult = ReturnType<typeof useCreateInviteMutation>;
export type CreateInviteMutationResult = Apollo.MutationResult<CreateInviteMutation>;
export type CreateInviteMutationOptions = Apollo.BaseMutationOptions<CreateInviteMutation, CreateInviteMutationVariables>;
export const RevokeInviteDocument = gql`
    mutation RevokeInvite($id: ID!) {
  revokeInvite(id: $id)
}
    `;
export type RevokeInviteMutationFn = Apollo.MutationFunction<RevokeInviteMutation, RevokeInviteMutationVariables>;

/**
 * __useRevokeInviteMutation__
 *
 * To run a mutation, you first call `useRevokeInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeInviteMutation, { data, loading, error }] = useRevokeInviteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRevokeInviteMutation(baseOptions?: Apollo.MutationHookOptions<RevokeInviteMutation, RevokeInviteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeInviteMutation, RevokeInviteMutationVariables>(RevokeInviteDocument, options);
      }
export type RevokeInviteMutationHookResult = ReturnType<typeof useRevokeInviteMutation>;
export type RevokeInviteMutationResult = Apollo.MutationResult<RevokeInviteMutation>;
export type RevokeInviteMutationOptions = Apollo.BaseMutationOptions<RevokeInviteMutation, RevokeInviteMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;
export type ForgotPasswordMutationFn = Apollo.MutationFunction<ForgotPasswordMutation, ForgotPasswordMutationVariables>;

/**
 * __useForgotPasswordMutation__
 *
 * To run a mutation, you first call `useForgotPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forgotPasswordMutation, { data, loading, error }] = useForgotPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useForgotPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument, options);
      }
export type ForgotPasswordMutationHookResult = ReturnType<typeof useForgotPasswordMutation>;
export type ForgotPasswordMutationResult = Apollo.MutationResult<ForgotPasswordMutation>;
export type ForgotPasswordMutationOptions = Apollo.BaseMutationOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($token: String!, $password: String!, $passwordConfirmation: String!) {
  resetPassword(
    token: $token
    password: $password
    passwordConfirmation: $passwordConfirmation
  )
}
    `;
export type ResetPasswordMutationFn = Apollo.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, options);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($name: String) {
  updateProfile(name: $name) {
    id
    email
    name
  }
}
    `;
export type UpdateProfileMutationFn = Apollo.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const CreatePeriodDocument = gql`
    mutation CreatePeriod($name: String, $startDate: String!, $endDate: String!, $dailyLimit: String!, $totalBudget: String) {
  createPeriod(
    name: $name
    startDate: $startDate
    endDate: $endDate
    dailyLimit: $dailyLimit
    totalBudget: $totalBudget
  ) {
    id
    name
    status
    dailyLimit
    totalBudget
    remainingTotal
  }
}
    `;
export type CreatePeriodMutationFn = Apollo.MutationFunction<CreatePeriodMutation, CreatePeriodMutationVariables>;

/**
 * __useCreatePeriodMutation__
 *
 * To run a mutation, you first call `useCreatePeriodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePeriodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPeriodMutation, { data, loading, error }] = useCreatePeriodMutation({
 *   variables: {
 *      name: // value for 'name'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      dailyLimit: // value for 'dailyLimit'
 *      totalBudget: // value for 'totalBudget'
 *   },
 * });
 */
export function useCreatePeriodMutation(baseOptions?: Apollo.MutationHookOptions<CreatePeriodMutation, CreatePeriodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePeriodMutation, CreatePeriodMutationVariables>(CreatePeriodDocument, options);
      }
export type CreatePeriodMutationHookResult = ReturnType<typeof useCreatePeriodMutation>;
export type CreatePeriodMutationResult = Apollo.MutationResult<CreatePeriodMutation>;
export type CreatePeriodMutationOptions = Apollo.BaseMutationOptions<CreatePeriodMutation, CreatePeriodMutationVariables>;
export const UpdatePeriodDocument = gql`
    mutation UpdatePeriod($dailyLimit: String, $totalBudget: String) {
  updatePeriod(dailyLimit: $dailyLimit, totalBudget: $totalBudget) {
    id
    dailyLimit
    totalBudget
    remainingTotal
    status
  }
}
    `;
export type UpdatePeriodMutationFn = Apollo.MutationFunction<UpdatePeriodMutation, UpdatePeriodMutationVariables>;

/**
 * __useUpdatePeriodMutation__
 *
 * To run a mutation, you first call `useUpdatePeriodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePeriodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePeriodMutation, { data, loading, error }] = useUpdatePeriodMutation({
 *   variables: {
 *      dailyLimit: // value for 'dailyLimit'
 *      totalBudget: // value for 'totalBudget'
 *   },
 * });
 */
export function useUpdatePeriodMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePeriodMutation, UpdatePeriodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePeriodMutation, UpdatePeriodMutationVariables>(UpdatePeriodDocument, options);
      }
export type UpdatePeriodMutationHookResult = ReturnType<typeof useUpdatePeriodMutation>;
export type UpdatePeriodMutationResult = Apollo.MutationResult<UpdatePeriodMutation>;
export type UpdatePeriodMutationOptions = Apollo.BaseMutationOptions<UpdatePeriodMutation, UpdatePeriodMutationVariables>;
export const CreateExpenseDocument = gql`
    mutation CreateExpense($amount: String!, $date: String!, $note: String, $isExtra: Boolean, $subcategoryId: ID, $type: String, $accountId: ID, $installments: Int, $firstInvoice: String, $amountPerInstallment: Boolean, $countsInBudget: Boolean, $today: String) {
  createExpense(
    amount: $amount
    date: $date
    note: $note
    isExtra: $isExtra
    subcategoryId: $subcategoryId
    type: $type
    accountId: $accountId
    installments: $installments
    firstInvoice: $firstInvoice
    amountPerInstallment: $amountPerInstallment
    countsInBudget: $countsInBudget
    today: $today
  ) {
    id
    amount
    date
    note
    isExtra
    countsInBudget
    installmentCount
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
    `;
export type CreateExpenseMutationFn = Apollo.MutationFunction<CreateExpenseMutation, CreateExpenseMutationVariables>;

/**
 * __useCreateExpenseMutation__
 *
 * To run a mutation, you first call `useCreateExpenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExpenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExpenseMutation, { data, loading, error }] = useCreateExpenseMutation({
 *   variables: {
 *      amount: // value for 'amount'
 *      date: // value for 'date'
 *      note: // value for 'note'
 *      isExtra: // value for 'isExtra'
 *      subcategoryId: // value for 'subcategoryId'
 *      type: // value for 'type'
 *      accountId: // value for 'accountId'
 *      installments: // value for 'installments'
 *      firstInvoice: // value for 'firstInvoice'
 *      amountPerInstallment: // value for 'amountPerInstallment'
 *      countsInBudget: // value for 'countsInBudget'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useCreateExpenseMutation(baseOptions?: Apollo.MutationHookOptions<CreateExpenseMutation, CreateExpenseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateExpenseMutation, CreateExpenseMutationVariables>(CreateExpenseDocument, options);
      }
export type CreateExpenseMutationHookResult = ReturnType<typeof useCreateExpenseMutation>;
export type CreateExpenseMutationResult = Apollo.MutationResult<CreateExpenseMutation>;
export type CreateExpenseMutationOptions = Apollo.BaseMutationOptions<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const UpdateExpenseDocument = gql`
    mutation UpdateExpense($id: ID!, $amount: String, $date: String, $note: String, $isExtra: Boolean, $subcategoryId: ID, $type: String, $accountId: ID) {
  updateExpense(
    id: $id
    amount: $amount
    date: $date
    note: $note
    isExtra: $isExtra
    subcategoryId: $subcategoryId
    type: $type
    accountId: $accountId
  ) {
    id
    amount
    date
    note
    isExtra
    subcategory {
      id
      name
    }
  }
}
    `;
export type UpdateExpenseMutationFn = Apollo.MutationFunction<UpdateExpenseMutation, UpdateExpenseMutationVariables>;

/**
 * __useUpdateExpenseMutation__
 *
 * To run a mutation, you first call `useUpdateExpenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateExpenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateExpenseMutation, { data, loading, error }] = useUpdateExpenseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      amount: // value for 'amount'
 *      date: // value for 'date'
 *      note: // value for 'note'
 *      isExtra: // value for 'isExtra'
 *      subcategoryId: // value for 'subcategoryId'
 *      type: // value for 'type'
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useUpdateExpenseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateExpenseMutation, UpdateExpenseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateExpenseMutation, UpdateExpenseMutationVariables>(UpdateExpenseDocument, options);
      }
export type UpdateExpenseMutationHookResult = ReturnType<typeof useUpdateExpenseMutation>;
export type UpdateExpenseMutationResult = Apollo.MutationResult<UpdateExpenseMutation>;
export type UpdateExpenseMutationOptions = Apollo.BaseMutationOptions<UpdateExpenseMutation, UpdateExpenseMutationVariables>;
export const DeleteExpenseDocument = gql`
    mutation DeleteExpense($id: ID!) {
  deleteExpense(id: $id)
}
    `;
export type DeleteExpenseMutationFn = Apollo.MutationFunction<DeleteExpenseMutation, DeleteExpenseMutationVariables>;

/**
 * __useDeleteExpenseMutation__
 *
 * To run a mutation, you first call `useDeleteExpenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteExpenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteExpenseMutation, { data, loading, error }] = useDeleteExpenseMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteExpenseMutation(baseOptions?: Apollo.MutationHookOptions<DeleteExpenseMutation, DeleteExpenseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteExpenseMutation, DeleteExpenseMutationVariables>(DeleteExpenseDocument, options);
      }
export type DeleteExpenseMutationHookResult = ReturnType<typeof useDeleteExpenseMutation>;
export type DeleteExpenseMutationResult = Apollo.MutationResult<DeleteExpenseMutation>;
export type DeleteExpenseMutationOptions = Apollo.BaseMutationOptions<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const CreateCategoryDocument = gql`
    mutation CreateCategory($name: String!, $type: String, $icon: String) {
  createCategory(name: $name, type: $type, icon: $icon) {
    id
    name
    type
    icon
    subcategories {
      id
      name
    }
  }
}
    `;
export type CreateCategoryMutationFn = Apollo.MutationFunction<CreateCategoryMutation, CreateCategoryMutationVariables>;

/**
 * __useCreateCategoryMutation__
 *
 * To run a mutation, you first call `useCreateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCategoryMutation, { data, loading, error }] = useCreateCategoryMutation({
 *   variables: {
 *      name: // value for 'name'
 *      type: // value for 'type'
 *      icon: // value for 'icon'
 *   },
 * });
 */
export function useCreateCategoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateCategoryMutation, CreateCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(CreateCategoryDocument, options);
      }
export type CreateCategoryMutationHookResult = ReturnType<typeof useCreateCategoryMutation>;
export type CreateCategoryMutationResult = Apollo.MutationResult<CreateCategoryMutation>;
export type CreateCategoryMutationOptions = Apollo.BaseMutationOptions<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = gql`
    mutation UpdateCategory($id: ID!, $name: String!, $type: String, $icon: String) {
  updateCategory(id: $id, name: $name, type: $type, icon: $icon) {
    id
    name
    type
    icon
  }
}
    `;
export type UpdateCategoryMutationFn = Apollo.MutationFunction<UpdateCategoryMutation, UpdateCategoryMutationVariables>;

/**
 * __useUpdateCategoryMutation__
 *
 * To run a mutation, you first call `useUpdateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCategoryMutation, { data, loading, error }] = useUpdateCategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      type: // value for 'type'
 *      icon: // value for 'icon'
 *   },
 * });
 */
export function useUpdateCategoryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCategoryMutation, UpdateCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCategoryMutation, UpdateCategoryMutationVariables>(UpdateCategoryDocument, options);
      }
export type UpdateCategoryMutationHookResult = ReturnType<typeof useUpdateCategoryMutation>;
export type UpdateCategoryMutationResult = Apollo.MutationResult<UpdateCategoryMutation>;
export type UpdateCategoryMutationOptions = Apollo.BaseMutationOptions<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = gql`
    mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id)
}
    `;
export type DeleteCategoryMutationFn = Apollo.MutationFunction<DeleteCategoryMutation, DeleteCategoryMutationVariables>;

/**
 * __useDeleteCategoryMutation__
 *
 * To run a mutation, you first call `useDeleteCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCategoryMutation, { data, loading, error }] = useDeleteCategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCategoryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCategoryMutation, DeleteCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCategoryMutation, DeleteCategoryMutationVariables>(DeleteCategoryDocument, options);
      }
export type DeleteCategoryMutationHookResult = ReturnType<typeof useDeleteCategoryMutation>;
export type DeleteCategoryMutationResult = Apollo.MutationResult<DeleteCategoryMutation>;
export type DeleteCategoryMutationOptions = Apollo.BaseMutationOptions<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const CreateSubcategoryDocument = gql`
    mutation CreateSubcategory($categoryId: ID!, $name: String!) {
  createSubcategory(categoryId: $categoryId, name: $name) {
    id
    name
  }
}
    `;
export type CreateSubcategoryMutationFn = Apollo.MutationFunction<CreateSubcategoryMutation, CreateSubcategoryMutationVariables>;

/**
 * __useCreateSubcategoryMutation__
 *
 * To run a mutation, you first call `useCreateSubcategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSubcategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSubcategoryMutation, { data, loading, error }] = useCreateSubcategoryMutation({
 *   variables: {
 *      categoryId: // value for 'categoryId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateSubcategoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateSubcategoryMutation, CreateSubcategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSubcategoryMutation, CreateSubcategoryMutationVariables>(CreateSubcategoryDocument, options);
      }
export type CreateSubcategoryMutationHookResult = ReturnType<typeof useCreateSubcategoryMutation>;
export type CreateSubcategoryMutationResult = Apollo.MutationResult<CreateSubcategoryMutation>;
export type CreateSubcategoryMutationOptions = Apollo.BaseMutationOptions<CreateSubcategoryMutation, CreateSubcategoryMutationVariables>;
export const DeleteSubcategoryDocument = gql`
    mutation DeleteSubcategory($id: ID!) {
  deleteSubcategory(id: $id)
}
    `;
export type DeleteSubcategoryMutationFn = Apollo.MutationFunction<DeleteSubcategoryMutation, DeleteSubcategoryMutationVariables>;

/**
 * __useDeleteSubcategoryMutation__
 *
 * To run a mutation, you first call `useDeleteSubcategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSubcategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSubcategoryMutation, { data, loading, error }] = useDeleteSubcategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSubcategoryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSubcategoryMutation, DeleteSubcategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSubcategoryMutation, DeleteSubcategoryMutationVariables>(DeleteSubcategoryDocument, options);
      }
export type DeleteSubcategoryMutationHookResult = ReturnType<typeof useDeleteSubcategoryMutation>;
export type DeleteSubcategoryMutationResult = Apollo.MutationResult<DeleteSubcategoryMutation>;
export type DeleteSubcategoryMutationOptions = Apollo.BaseMutationOptions<DeleteSubcategoryMutation, DeleteSubcategoryMutationVariables>;
export const AnticipateInstallmentsDocument = gql`
    mutation AnticipateInstallments($expenseId: ID!, $amount: String) {
  anticipateInstallments(expenseId: $expenseId, amount: $amount) {
    id
    amount
    note
  }
}
    `;
export type AnticipateInstallmentsMutationFn = Apollo.MutationFunction<AnticipateInstallmentsMutation, AnticipateInstallmentsMutationVariables>;

/**
 * __useAnticipateInstallmentsMutation__
 *
 * To run a mutation, you first call `useAnticipateInstallmentsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAnticipateInstallmentsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [anticipateInstallmentsMutation, { data, loading, error }] = useAnticipateInstallmentsMutation({
 *   variables: {
 *      expenseId: // value for 'expenseId'
 *      amount: // value for 'amount'
 *   },
 * });
 */
export function useAnticipateInstallmentsMutation(baseOptions?: Apollo.MutationHookOptions<AnticipateInstallmentsMutation, AnticipateInstallmentsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AnticipateInstallmentsMutation, AnticipateInstallmentsMutationVariables>(AnticipateInstallmentsDocument, options);
      }
export type AnticipateInstallmentsMutationHookResult = ReturnType<typeof useAnticipateInstallmentsMutation>;
export type AnticipateInstallmentsMutationResult = Apollo.MutationResult<AnticipateInstallmentsMutation>;
export type AnticipateInstallmentsMutationOptions = Apollo.BaseMutationOptions<AnticipateInstallmentsMutation, AnticipateInstallmentsMutationVariables>;
export const CreateFinancialAccountDocument = gql`
    mutation CreateFinancialAccount($name: String!, $kind: String!, $balance: String, $closingDay: Int, $dueDay: Int, $monthlyCredit: String, $creditDay: Int, $ownerUserId: ID, $today: String) {
  createFinancialAccount(
    name: $name
    kind: $kind
    balance: $balance
    closingDay: $closingDay
    dueDay: $dueDay
    monthlyCredit: $monthlyCredit
    creditDay: $creditDay
    ownerUserId: $ownerUserId
    today: $today
  ) {
    id
    name
    kind
    isPrimary
    balance
    closingDay
    dueDay
  }
}
    `;
export type CreateFinancialAccountMutationFn = Apollo.MutationFunction<CreateFinancialAccountMutation, CreateFinancialAccountMutationVariables>;

/**
 * __useCreateFinancialAccountMutation__
 *
 * To run a mutation, you first call `useCreateFinancialAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFinancialAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFinancialAccountMutation, { data, loading, error }] = useCreateFinancialAccountMutation({
 *   variables: {
 *      name: // value for 'name'
 *      kind: // value for 'kind'
 *      balance: // value for 'balance'
 *      closingDay: // value for 'closingDay'
 *      dueDay: // value for 'dueDay'
 *      monthlyCredit: // value for 'monthlyCredit'
 *      creditDay: // value for 'creditDay'
 *      ownerUserId: // value for 'ownerUserId'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useCreateFinancialAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateFinancialAccountMutation, CreateFinancialAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateFinancialAccountMutation, CreateFinancialAccountMutationVariables>(CreateFinancialAccountDocument, options);
      }
export type CreateFinancialAccountMutationHookResult = ReturnType<typeof useCreateFinancialAccountMutation>;
export type CreateFinancialAccountMutationResult = Apollo.MutationResult<CreateFinancialAccountMutation>;
export type CreateFinancialAccountMutationOptions = Apollo.BaseMutationOptions<CreateFinancialAccountMutation, CreateFinancialAccountMutationVariables>;
export const UpdateFinancialAccountDocument = gql`
    mutation UpdateFinancialAccount($id: ID!, $name: String, $closingDay: Int, $dueDay: Int, $monthlyCredit: String, $creditDay: Int, $ownerUserId: ID) {
  updateFinancialAccount(
    id: $id
    name: $name
    closingDay: $closingDay
    dueDay: $dueDay
    monthlyCredit: $monthlyCredit
    creditDay: $creditDay
    ownerUserId: $ownerUserId
  ) {
    id
    name
    closingDay
    dueDay
    monthlyCredit
    creditDay
  }
}
    `;
export type UpdateFinancialAccountMutationFn = Apollo.MutationFunction<UpdateFinancialAccountMutation, UpdateFinancialAccountMutationVariables>;

/**
 * __useUpdateFinancialAccountMutation__
 *
 * To run a mutation, you first call `useUpdateFinancialAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFinancialAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFinancialAccountMutation, { data, loading, error }] = useUpdateFinancialAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      closingDay: // value for 'closingDay'
 *      dueDay: // value for 'dueDay'
 *      monthlyCredit: // value for 'monthlyCredit'
 *      creditDay: // value for 'creditDay'
 *      ownerUserId: // value for 'ownerUserId'
 *   },
 * });
 */
export function useUpdateFinancialAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFinancialAccountMutation, UpdateFinancialAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFinancialAccountMutation, UpdateFinancialAccountMutationVariables>(UpdateFinancialAccountDocument, options);
      }
export type UpdateFinancialAccountMutationHookResult = ReturnType<typeof useUpdateFinancialAccountMutation>;
export type UpdateFinancialAccountMutationResult = Apollo.MutationResult<UpdateFinancialAccountMutation>;
export type UpdateFinancialAccountMutationOptions = Apollo.BaseMutationOptions<UpdateFinancialAccountMutation, UpdateFinancialAccountMutationVariables>;
export const SetInvoiceGoalDocument = gql`
    mutation SetInvoiceGoal($id: ID!, $invoiceGoal: String) {
  updateFinancialAccount(id: $id, invoiceGoal: $invoiceGoal) {
    id
    invoiceGoal
  }
}
    `;
export type SetInvoiceGoalMutationFn = Apollo.MutationFunction<SetInvoiceGoalMutation, SetInvoiceGoalMutationVariables>;

/**
 * __useSetInvoiceGoalMutation__
 *
 * To run a mutation, you first call `useSetInvoiceGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetInvoiceGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setInvoiceGoalMutation, { data, loading, error }] = useSetInvoiceGoalMutation({
 *   variables: {
 *      id: // value for 'id'
 *      invoiceGoal: // value for 'invoiceGoal'
 *   },
 * });
 */
export function useSetInvoiceGoalMutation(baseOptions?: Apollo.MutationHookOptions<SetInvoiceGoalMutation, SetInvoiceGoalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetInvoiceGoalMutation, SetInvoiceGoalMutationVariables>(SetInvoiceGoalDocument, options);
      }
export type SetInvoiceGoalMutationHookResult = ReturnType<typeof useSetInvoiceGoalMutation>;
export type SetInvoiceGoalMutationResult = Apollo.MutationResult<SetInvoiceGoalMutation>;
export type SetInvoiceGoalMutationOptions = Apollo.BaseMutationOptions<SetInvoiceGoalMutation, SetInvoiceGoalMutationVariables>;
export const MakePrimaryAccountDocument = gql`
    mutation MakePrimaryAccount($id: ID!) {
  makePrimaryAccount(id: $id) {
    id
    isPrimary
  }
}
    `;
export type MakePrimaryAccountMutationFn = Apollo.MutationFunction<MakePrimaryAccountMutation, MakePrimaryAccountMutationVariables>;

/**
 * __useMakePrimaryAccountMutation__
 *
 * To run a mutation, you first call `useMakePrimaryAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMakePrimaryAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [makePrimaryAccountMutation, { data, loading, error }] = useMakePrimaryAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMakePrimaryAccountMutation(baseOptions?: Apollo.MutationHookOptions<MakePrimaryAccountMutation, MakePrimaryAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MakePrimaryAccountMutation, MakePrimaryAccountMutationVariables>(MakePrimaryAccountDocument, options);
      }
export type MakePrimaryAccountMutationHookResult = ReturnType<typeof useMakePrimaryAccountMutation>;
export type MakePrimaryAccountMutationResult = Apollo.MutationResult<MakePrimaryAccountMutation>;
export type MakePrimaryAccountMutationOptions = Apollo.BaseMutationOptions<MakePrimaryAccountMutation, MakePrimaryAccountMutationVariables>;
export const ArchiveFinancialAccountDocument = gql`
    mutation ArchiveFinancialAccount($id: ID!) {
  archiveFinancialAccount(id: $id)
}
    `;
export type ArchiveFinancialAccountMutationFn = Apollo.MutationFunction<ArchiveFinancialAccountMutation, ArchiveFinancialAccountMutationVariables>;

/**
 * __useArchiveFinancialAccountMutation__
 *
 * To run a mutation, you first call `useArchiveFinancialAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveFinancialAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveFinancialAccountMutation, { data, loading, error }] = useArchiveFinancialAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveFinancialAccountMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveFinancialAccountMutation, ArchiveFinancialAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveFinancialAccountMutation, ArchiveFinancialAccountMutationVariables>(ArchiveFinancialAccountDocument, options);
      }
export type ArchiveFinancialAccountMutationHookResult = ReturnType<typeof useArchiveFinancialAccountMutation>;
export type ArchiveFinancialAccountMutationResult = Apollo.MutationResult<ArchiveFinancialAccountMutation>;
export type ArchiveFinancialAccountMutationOptions = Apollo.BaseMutationOptions<ArchiveFinancialAccountMutation, ArchiveFinancialAccountMutationVariables>;
export const SetAccountBalanceDocument = gql`
    mutation SetAccountBalance($id: ID!, $balance: String!, $today: String) {
  setAccountBalance(id: $id, balance: $balance, today: $today) {
    id
    balance
    balanceDate
  }
}
    `;
export type SetAccountBalanceMutationFn = Apollo.MutationFunction<SetAccountBalanceMutation, SetAccountBalanceMutationVariables>;

/**
 * __useSetAccountBalanceMutation__
 *
 * To run a mutation, you first call `useSetAccountBalanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetAccountBalanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setAccountBalanceMutation, { data, loading, error }] = useSetAccountBalanceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      balance: // value for 'balance'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useSetAccountBalanceMutation(baseOptions?: Apollo.MutationHookOptions<SetAccountBalanceMutation, SetAccountBalanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetAccountBalanceMutation, SetAccountBalanceMutationVariables>(SetAccountBalanceDocument, options);
      }
export type SetAccountBalanceMutationHookResult = ReturnType<typeof useSetAccountBalanceMutation>;
export type SetAccountBalanceMutationResult = Apollo.MutationResult<SetAccountBalanceMutation>;
export type SetAccountBalanceMutationOptions = Apollo.BaseMutationOptions<SetAccountBalanceMutation, SetAccountBalanceMutationVariables>;
export const CreateTransferDocument = gql`
    mutation CreateTransfer($fromAccountId: ID!, $toAccountId: ID!, $amount: String!, $date: String!, $kind: String, $note: String) {
  createTransfer(
    fromAccountId: $fromAccountId
    toAccountId: $toAccountId
    amount: $amount
    date: $date
    kind: $kind
    note: $note
  ) {
    id
  }
}
    `;
export type CreateTransferMutationFn = Apollo.MutationFunction<CreateTransferMutation, CreateTransferMutationVariables>;

/**
 * __useCreateTransferMutation__
 *
 * To run a mutation, you first call `useCreateTransferMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTransferMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTransferMutation, { data, loading, error }] = useCreateTransferMutation({
 *   variables: {
 *      fromAccountId: // value for 'fromAccountId'
 *      toAccountId: // value for 'toAccountId'
 *      amount: // value for 'amount'
 *      date: // value for 'date'
 *      kind: // value for 'kind'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useCreateTransferMutation(baseOptions?: Apollo.MutationHookOptions<CreateTransferMutation, CreateTransferMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTransferMutation, CreateTransferMutationVariables>(CreateTransferDocument, options);
      }
export type CreateTransferMutationHookResult = ReturnType<typeof useCreateTransferMutation>;
export type CreateTransferMutationResult = Apollo.MutationResult<CreateTransferMutation>;
export type CreateTransferMutationOptions = Apollo.BaseMutationOptions<CreateTransferMutation, CreateTransferMutationVariables>;
export const PayInvoiceDocument = gql`
    mutation PayInvoice($cardId: ID!, $month: String!, $fromAccountId: ID!, $amount: String!, $date: String!) {
  payInvoice(
    cardId: $cardId
    month: $month
    fromAccountId: $fromAccountId
    amount: $amount
    date: $date
  ) {
    month
    status
    paid
    remaining
  }
}
    `;
export type PayInvoiceMutationFn = Apollo.MutationFunction<PayInvoiceMutation, PayInvoiceMutationVariables>;

/**
 * __usePayInvoiceMutation__
 *
 * To run a mutation, you first call `usePayInvoiceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePayInvoiceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [payInvoiceMutation, { data, loading, error }] = usePayInvoiceMutation({
 *   variables: {
 *      cardId: // value for 'cardId'
 *      month: // value for 'month'
 *      fromAccountId: // value for 'fromAccountId'
 *      amount: // value for 'amount'
 *      date: // value for 'date'
 *   },
 * });
 */
export function usePayInvoiceMutation(baseOptions?: Apollo.MutationHookOptions<PayInvoiceMutation, PayInvoiceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PayInvoiceMutation, PayInvoiceMutationVariables>(PayInvoiceDocument, options);
      }
export type PayInvoiceMutationHookResult = ReturnType<typeof usePayInvoiceMutation>;
export type PayInvoiceMutationResult = Apollo.MutationResult<PayInvoiceMutation>;
export type PayInvoiceMutationOptions = Apollo.BaseMutationOptions<PayInvoiceMutation, PayInvoiceMutationVariables>;
export const AssignEntriesToAccountDocument = gql`
    mutation AssignEntriesToAccount($accountId: ID!, $fromDate: String!) {
  assignEntriesToAccount(accountId: $accountId, fromDate: $fromDate)
}
    `;
export type AssignEntriesToAccountMutationFn = Apollo.MutationFunction<AssignEntriesToAccountMutation, AssignEntriesToAccountMutationVariables>;

/**
 * __useAssignEntriesToAccountMutation__
 *
 * To run a mutation, you first call `useAssignEntriesToAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignEntriesToAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignEntriesToAccountMutation, { data, loading, error }] = useAssignEntriesToAccountMutation({
 *   variables: {
 *      accountId: // value for 'accountId'
 *      fromDate: // value for 'fromDate'
 *   },
 * });
 */
export function useAssignEntriesToAccountMutation(baseOptions?: Apollo.MutationHookOptions<AssignEntriesToAccountMutation, AssignEntriesToAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignEntriesToAccountMutation, AssignEntriesToAccountMutationVariables>(AssignEntriesToAccountDocument, options);
      }
export type AssignEntriesToAccountMutationHookResult = ReturnType<typeof useAssignEntriesToAccountMutation>;
export type AssignEntriesToAccountMutationResult = Apollo.MutationResult<AssignEntriesToAccountMutation>;
export type AssignEntriesToAccountMutationOptions = Apollo.BaseMutationOptions<AssignEntriesToAccountMutation, AssignEntriesToAccountMutationVariables>;
export const CreateRecurringBillDocument = gql`
    mutation CreateRecurringBill($name: String!, $amount: String!, $dueDay: Int!, $accountId: ID!, $subcategoryId: ID, $direction: String, $onceMonth: String) {
  createRecurringBill(
    name: $name
    amount: $amount
    dueDay: $dueDay
    accountId: $accountId
    subcategoryId: $subcategoryId
    direction: $direction
    onceMonth: $onceMonth
  ) {
    id
  }
}
    `;
export type CreateRecurringBillMutationFn = Apollo.MutationFunction<CreateRecurringBillMutation, CreateRecurringBillMutationVariables>;

/**
 * __useCreateRecurringBillMutation__
 *
 * To run a mutation, you first call `useCreateRecurringBillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRecurringBillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRecurringBillMutation, { data, loading, error }] = useCreateRecurringBillMutation({
 *   variables: {
 *      name: // value for 'name'
 *      amount: // value for 'amount'
 *      dueDay: // value for 'dueDay'
 *      accountId: // value for 'accountId'
 *      subcategoryId: // value for 'subcategoryId'
 *      direction: // value for 'direction'
 *      onceMonth: // value for 'onceMonth'
 *   },
 * });
 */
export function useCreateRecurringBillMutation(baseOptions?: Apollo.MutationHookOptions<CreateRecurringBillMutation, CreateRecurringBillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRecurringBillMutation, CreateRecurringBillMutationVariables>(CreateRecurringBillDocument, options);
      }
export type CreateRecurringBillMutationHookResult = ReturnType<typeof useCreateRecurringBillMutation>;
export type CreateRecurringBillMutationResult = Apollo.MutationResult<CreateRecurringBillMutation>;
export type CreateRecurringBillMutationOptions = Apollo.BaseMutationOptions<CreateRecurringBillMutation, CreateRecurringBillMutationVariables>;
export const UpdateRecurringBillDocument = gql`
    mutation UpdateRecurringBill($id: ID!, $name: String, $amount: String, $dueDay: Int, $accountId: ID, $subcategoryId: ID, $direction: String, $onceMonth: String) {
  updateRecurringBill(
    id: $id
    name: $name
    amount: $amount
    dueDay: $dueDay
    accountId: $accountId
    subcategoryId: $subcategoryId
    direction: $direction
    onceMonth: $onceMonth
  ) {
    id
  }
}
    `;
export type UpdateRecurringBillMutationFn = Apollo.MutationFunction<UpdateRecurringBillMutation, UpdateRecurringBillMutationVariables>;

/**
 * __useUpdateRecurringBillMutation__
 *
 * To run a mutation, you first call `useUpdateRecurringBillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRecurringBillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRecurringBillMutation, { data, loading, error }] = useUpdateRecurringBillMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      amount: // value for 'amount'
 *      dueDay: // value for 'dueDay'
 *      accountId: // value for 'accountId'
 *      subcategoryId: // value for 'subcategoryId'
 *      direction: // value for 'direction'
 *      onceMonth: // value for 'onceMonth'
 *   },
 * });
 */
export function useUpdateRecurringBillMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRecurringBillMutation, UpdateRecurringBillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRecurringBillMutation, UpdateRecurringBillMutationVariables>(UpdateRecurringBillDocument, options);
      }
export type UpdateRecurringBillMutationHookResult = ReturnType<typeof useUpdateRecurringBillMutation>;
export type UpdateRecurringBillMutationResult = Apollo.MutationResult<UpdateRecurringBillMutation>;
export type UpdateRecurringBillMutationOptions = Apollo.BaseMutationOptions<UpdateRecurringBillMutation, UpdateRecurringBillMutationVariables>;
export const DeleteRecurringBillDocument = gql`
    mutation DeleteRecurringBill($id: ID!) {
  deleteRecurringBill(id: $id)
}
    `;
export type DeleteRecurringBillMutationFn = Apollo.MutationFunction<DeleteRecurringBillMutation, DeleteRecurringBillMutationVariables>;

/**
 * __useDeleteRecurringBillMutation__
 *
 * To run a mutation, you first call `useDeleteRecurringBillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRecurringBillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRecurringBillMutation, { data, loading, error }] = useDeleteRecurringBillMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRecurringBillMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRecurringBillMutation, DeleteRecurringBillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRecurringBillMutation, DeleteRecurringBillMutationVariables>(DeleteRecurringBillDocument, options);
      }
export type DeleteRecurringBillMutationHookResult = ReturnType<typeof useDeleteRecurringBillMutation>;
export type DeleteRecurringBillMutationResult = Apollo.MutationResult<DeleteRecurringBillMutation>;
export type DeleteRecurringBillMutationOptions = Apollo.BaseMutationOptions<DeleteRecurringBillMutation, DeleteRecurringBillMutationVariables>;
export const PayBillDocument = gql`
    mutation PayBill($billId: ID!, $month: String!, $amount: String!, $date: String!) {
  payBill(billId: $billId, month: $month, amount: $amount, date: $date) {
    status
    amount
  }
}
    `;
export type PayBillMutationFn = Apollo.MutationFunction<PayBillMutation, PayBillMutationVariables>;

/**
 * __usePayBillMutation__
 *
 * To run a mutation, you first call `usePayBillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePayBillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [payBillMutation, { data, loading, error }] = usePayBillMutation({
 *   variables: {
 *      billId: // value for 'billId'
 *      month: // value for 'month'
 *      amount: // value for 'amount'
 *      date: // value for 'date'
 *   },
 * });
 */
export function usePayBillMutation(baseOptions?: Apollo.MutationHookOptions<PayBillMutation, PayBillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PayBillMutation, PayBillMutationVariables>(PayBillDocument, options);
      }
export type PayBillMutationHookResult = ReturnType<typeof usePayBillMutation>;
export type PayBillMutationResult = Apollo.MutationResult<PayBillMutation>;
export type PayBillMutationOptions = Apollo.BaseMutationOptions<PayBillMutation, PayBillMutationVariables>;
export const UnpayBillDocument = gql`
    mutation UnpayBill($billId: ID!, $month: String!) {
  unpayBill(billId: $billId, month: $month)
}
    `;
export type UnpayBillMutationFn = Apollo.MutationFunction<UnpayBillMutation, UnpayBillMutationVariables>;

/**
 * __useUnpayBillMutation__
 *
 * To run a mutation, you first call `useUnpayBillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnpayBillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unpayBillMutation, { data, loading, error }] = useUnpayBillMutation({
 *   variables: {
 *      billId: // value for 'billId'
 *      month: // value for 'month'
 *   },
 * });
 */
export function useUnpayBillMutation(baseOptions?: Apollo.MutationHookOptions<UnpayBillMutation, UnpayBillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnpayBillMutation, UnpayBillMutationVariables>(UnpayBillDocument, options);
      }
export type UnpayBillMutationHookResult = ReturnType<typeof useUnpayBillMutation>;
export type UnpayBillMutationResult = Apollo.MutationResult<UnpayBillMutation>;
export type UnpayBillMutationOptions = Apollo.BaseMutationOptions<UnpayBillMutation, UnpayBillMutationVariables>;
export const UpdateFinancialSettingsDocument = gql`
    mutation UpdateFinancialSettings($salaryAmount: String, $salaryBusinessDay: Int, $salaryAccountId: ID, $reserveGoal: String, $today: String) {
  updateFinancialSettings(
    salaryAmount: $salaryAmount
    salaryBusinessDay: $salaryBusinessDay
    salaryAccountId: $salaryAccountId
    reserveGoal: $reserveGoal
    today: $today
  ) {
    salaryAmount
    salaryBusinessDay
    salaryAccountId
    reserveGoal
  }
}
    `;
export type UpdateFinancialSettingsMutationFn = Apollo.MutationFunction<UpdateFinancialSettingsMutation, UpdateFinancialSettingsMutationVariables>;

/**
 * __useUpdateFinancialSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateFinancialSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFinancialSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFinancialSettingsMutation, { data, loading, error }] = useUpdateFinancialSettingsMutation({
 *   variables: {
 *      salaryAmount: // value for 'salaryAmount'
 *      salaryBusinessDay: // value for 'salaryBusinessDay'
 *      salaryAccountId: // value for 'salaryAccountId'
 *      reserveGoal: // value for 'reserveGoal'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useUpdateFinancialSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFinancialSettingsMutation, UpdateFinancialSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFinancialSettingsMutation, UpdateFinancialSettingsMutationVariables>(UpdateFinancialSettingsDocument, options);
      }
export type UpdateFinancialSettingsMutationHookResult = ReturnType<typeof useUpdateFinancialSettingsMutation>;
export type UpdateFinancialSettingsMutationResult = Apollo.MutationResult<UpdateFinancialSettingsMutation>;
export type UpdateFinancialSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateFinancialSettingsMutation, UpdateFinancialSettingsMutationVariables>;
export const SetSalaryDateDocument = gql`
    mutation SetSalaryDate($month: String!, $date: String) {
  setSalaryDate(month: $month, date: $date)
}
    `;
export type SetSalaryDateMutationFn = Apollo.MutationFunction<SetSalaryDateMutation, SetSalaryDateMutationVariables>;

/**
 * __useSetSalaryDateMutation__
 *
 * To run a mutation, you first call `useSetSalaryDateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetSalaryDateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setSalaryDateMutation, { data, loading, error }] = useSetSalaryDateMutation({
 *   variables: {
 *      month: // value for 'month'
 *      date: // value for 'date'
 *   },
 * });
 */
export function useSetSalaryDateMutation(baseOptions?: Apollo.MutationHookOptions<SetSalaryDateMutation, SetSalaryDateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetSalaryDateMutation, SetSalaryDateMutationVariables>(SetSalaryDateDocument, options);
      }
export type SetSalaryDateMutationHookResult = ReturnType<typeof useSetSalaryDateMutation>;
export type SetSalaryDateMutationResult = Apollo.MutationResult<SetSalaryDateMutation>;
export type SetSalaryDateMutationOptions = Apollo.BaseMutationOptions<SetSalaryDateMutation, SetSalaryDateMutationVariables>;
export const RegisterSalaryDocument = gql`
    mutation RegisterSalary($amount: String, $date: String!) {
  registerSalary(amount: $amount, date: $date) {
    id
    amount
  }
}
    `;
export type RegisterSalaryMutationFn = Apollo.MutationFunction<RegisterSalaryMutation, RegisterSalaryMutationVariables>;

/**
 * __useRegisterSalaryMutation__
 *
 * To run a mutation, you first call `useRegisterSalaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterSalaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerSalaryMutation, { data, loading, error }] = useRegisterSalaryMutation({
 *   variables: {
 *      amount: // value for 'amount'
 *      date: // value for 'date'
 *   },
 * });
 */
export function useRegisterSalaryMutation(baseOptions?: Apollo.MutationHookOptions<RegisterSalaryMutation, RegisterSalaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterSalaryMutation, RegisterSalaryMutationVariables>(RegisterSalaryDocument, options);
      }
export type RegisterSalaryMutationHookResult = ReturnType<typeof useRegisterSalaryMutation>;
export type RegisterSalaryMutationResult = Apollo.MutationResult<RegisterSalaryMutation>;
export type RegisterSalaryMutationOptions = Apollo.BaseMutationOptions<RegisterSalaryMutation, RegisterSalaryMutationVariables>;
export const DistributeAllowanceDocument = gql`
    mutation DistributeAllowance($amount: String, $today: String) {
  distributeAllowance(amount: $amount, today: $today) {
    amount
    distributed
    canDistribute
  }
}
    `;
export type DistributeAllowanceMutationFn = Apollo.MutationFunction<DistributeAllowanceMutation, DistributeAllowanceMutationVariables>;

/**
 * __useDistributeAllowanceMutation__
 *
 * To run a mutation, you first call `useDistributeAllowanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDistributeAllowanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [distributeAllowanceMutation, { data, loading, error }] = useDistributeAllowanceMutation({
 *   variables: {
 *      amount: // value for 'amount'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useDistributeAllowanceMutation(baseOptions?: Apollo.MutationHookOptions<DistributeAllowanceMutation, DistributeAllowanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DistributeAllowanceMutation, DistributeAllowanceMutationVariables>(DistributeAllowanceDocument, options);
      }
export type DistributeAllowanceMutationHookResult = ReturnType<typeof useDistributeAllowanceMutation>;
export type DistributeAllowanceMutationResult = Apollo.MutationResult<DistributeAllowanceMutation>;
export type DistributeAllowanceMutationOptions = Apollo.BaseMutationOptions<DistributeAllowanceMutation, DistributeAllowanceMutationVariables>;
export const SetReserveGoalDocument = gql`
    mutation SetReserveGoal($reserveGoal: String) {
  updateFinancialSettings(reserveGoal: $reserveGoal) {
    reserveGoal
  }
}
    `;
export type SetReserveGoalMutationFn = Apollo.MutationFunction<SetReserveGoalMutation, SetReserveGoalMutationVariables>;

/**
 * __useSetReserveGoalMutation__
 *
 * To run a mutation, you first call `useSetReserveGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetReserveGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setReserveGoalMutation, { data, loading, error }] = useSetReserveGoalMutation({
 *   variables: {
 *      reserveGoal: // value for 'reserveGoal'
 *   },
 * });
 */
export function useSetReserveGoalMutation(baseOptions?: Apollo.MutationHookOptions<SetReserveGoalMutation, SetReserveGoalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetReserveGoalMutation, SetReserveGoalMutationVariables>(SetReserveGoalDocument, options);
      }
export type SetReserveGoalMutationHookResult = ReturnType<typeof useSetReserveGoalMutation>;
export type SetReserveGoalMutationResult = Apollo.MutationResult<SetReserveGoalMutation>;
export type SetReserveGoalMutationOptions = Apollo.BaseMutationOptions<SetReserveGoalMutation, SetReserveGoalMutationVariables>;
export const SetInvoiceTotalDocument = gql`
    mutation SetInvoiceTotal($cardId: ID!, $month: String!, $total: String!, $today: String) {
  setInvoiceTotal(cardId: $cardId, month: $month, total: $total, today: $today) {
    month
    total
    remaining
    status
  }
}
    `;
export type SetInvoiceTotalMutationFn = Apollo.MutationFunction<SetInvoiceTotalMutation, SetInvoiceTotalMutationVariables>;

/**
 * __useSetInvoiceTotalMutation__
 *
 * To run a mutation, you first call `useSetInvoiceTotalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetInvoiceTotalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setInvoiceTotalMutation, { data, loading, error }] = useSetInvoiceTotalMutation({
 *   variables: {
 *      cardId: // value for 'cardId'
 *      month: // value for 'month'
 *      total: // value for 'total'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useSetInvoiceTotalMutation(baseOptions?: Apollo.MutationHookOptions<SetInvoiceTotalMutation, SetInvoiceTotalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetInvoiceTotalMutation, SetInvoiceTotalMutationVariables>(SetInvoiceTotalDocument, options);
      }
export type SetInvoiceTotalMutationHookResult = ReturnType<typeof useSetInvoiceTotalMutation>;
export type SetInvoiceTotalMutationResult = Apollo.MutationResult<SetInvoiceTotalMutation>;
export type SetInvoiceTotalMutationOptions = Apollo.BaseMutationOptions<SetInvoiceTotalMutation, SetInvoiceTotalMutationVariables>;
export const ApplyDailyGoalDocument = gql`
    mutation ApplyDailyGoal($daily: String!, $today: String) {
  applyDailyGoal(daily: $daily, today: $today) {
    id
    startDate
    endDate
    dailyLimit
  }
}
    `;
export type ApplyDailyGoalMutationFn = Apollo.MutationFunction<ApplyDailyGoalMutation, ApplyDailyGoalMutationVariables>;

/**
 * __useApplyDailyGoalMutation__
 *
 * To run a mutation, you first call `useApplyDailyGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApplyDailyGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [applyDailyGoalMutation, { data, loading, error }] = useApplyDailyGoalMutation({
 *   variables: {
 *      daily: // value for 'daily'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useApplyDailyGoalMutation(baseOptions?: Apollo.MutationHookOptions<ApplyDailyGoalMutation, ApplyDailyGoalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApplyDailyGoalMutation, ApplyDailyGoalMutationVariables>(ApplyDailyGoalDocument, options);
      }
export type ApplyDailyGoalMutationHookResult = ReturnType<typeof useApplyDailyGoalMutation>;
export type ApplyDailyGoalMutationResult = Apollo.MutationResult<ApplyDailyGoalMutation>;
export type ApplyDailyGoalMutationOptions = Apollo.BaseMutationOptions<ApplyDailyGoalMutation, ApplyDailyGoalMutationVariables>;
export const CreateGroupDocument = gql`
    mutation CreateGroup($name: String!) {
  createGroup(name: $name) {
    id
    name
    ownerId
  }
}
    `;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
      }
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const RenameGroupDocument = gql`
    mutation RenameGroup($id: ID!, $name: String!) {
  renameGroup(id: $id, name: $name) {
    id
    name
  }
}
    `;
export type RenameGroupMutationFn = Apollo.MutationFunction<RenameGroupMutation, RenameGroupMutationVariables>;

/**
 * __useRenameGroupMutation__
 *
 * To run a mutation, you first call `useRenameGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRenameGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [renameGroupMutation, { data, loading, error }] = useRenameGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useRenameGroupMutation(baseOptions?: Apollo.MutationHookOptions<RenameGroupMutation, RenameGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RenameGroupMutation, RenameGroupMutationVariables>(RenameGroupDocument, options);
      }
export type RenameGroupMutationHookResult = ReturnType<typeof useRenameGroupMutation>;
export type RenameGroupMutationResult = Apollo.MutationResult<RenameGroupMutation>;
export type RenameGroupMutationOptions = Apollo.BaseMutationOptions<RenameGroupMutation, RenameGroupMutationVariables>;
export const DeleteGroupDocument = gql`
    mutation DeleteGroup($id: ID!) {
  deleteGroup(id: $id)
}
    `;
export type DeleteGroupMutationFn = Apollo.MutationFunction<DeleteGroupMutation, DeleteGroupMutationVariables>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupMutation, DeleteGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(DeleteGroupDocument, options);
      }
export type DeleteGroupMutationHookResult = ReturnType<typeof useDeleteGroupMutation>;
export type DeleteGroupMutationResult = Apollo.MutationResult<DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const SwitchActiveGroupDocument = gql`
    mutation SwitchActiveGroup($id: ID!) {
  switchActiveGroup(id: $id) {
    id
    name
  }
}
    `;
export type SwitchActiveGroupMutationFn = Apollo.MutationFunction<SwitchActiveGroupMutation, SwitchActiveGroupMutationVariables>;

/**
 * __useSwitchActiveGroupMutation__
 *
 * To run a mutation, you first call `useSwitchActiveGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchActiveGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchActiveGroupMutation, { data, loading, error }] = useSwitchActiveGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSwitchActiveGroupMutation(baseOptions?: Apollo.MutationHookOptions<SwitchActiveGroupMutation, SwitchActiveGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SwitchActiveGroupMutation, SwitchActiveGroupMutationVariables>(SwitchActiveGroupDocument, options);
      }
export type SwitchActiveGroupMutationHookResult = ReturnType<typeof useSwitchActiveGroupMutation>;
export type SwitchActiveGroupMutationResult = Apollo.MutationResult<SwitchActiveGroupMutation>;
export type SwitchActiveGroupMutationOptions = Apollo.BaseMutationOptions<SwitchActiveGroupMutation, SwitchActiveGroupMutationVariables>;
export const LeaveGroupDocument = gql`
    mutation LeaveGroup($id: ID!) {
  leaveGroup(id: $id)
}
    `;
export type LeaveGroupMutationFn = Apollo.MutationFunction<LeaveGroupMutation, LeaveGroupMutationVariables>;

/**
 * __useLeaveGroupMutation__
 *
 * To run a mutation, you first call `useLeaveGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveGroupMutation, { data, loading, error }] = useLeaveGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLeaveGroupMutation(baseOptions?: Apollo.MutationHookOptions<LeaveGroupMutation, LeaveGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveGroupMutation, LeaveGroupMutationVariables>(LeaveGroupDocument, options);
      }
export type LeaveGroupMutationHookResult = ReturnType<typeof useLeaveGroupMutation>;
export type LeaveGroupMutationResult = Apollo.MutationResult<LeaveGroupMutation>;
export type LeaveGroupMutationOptions = Apollo.BaseMutationOptions<LeaveGroupMutation, LeaveGroupMutationVariables>;
export const RemoveMemberDocument = gql`
    mutation RemoveMember($groupId: ID!, $userId: Int!) {
  removeMember(groupId: $groupId, userId: $userId)
}
    `;
export type RemoveMemberMutationFn = Apollo.MutationFunction<RemoveMemberMutation, RemoveMemberMutationVariables>;

/**
 * __useRemoveMemberMutation__
 *
 * To run a mutation, you first call `useRemoveMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberMutation, { data, loading, error }] = useRemoveMemberMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberMutation, RemoveMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMemberMutation, RemoveMemberMutationVariables>(RemoveMemberDocument, options);
      }
export type RemoveMemberMutationHookResult = ReturnType<typeof useRemoveMemberMutation>;
export type RemoveMemberMutationResult = Apollo.MutationResult<RemoveMemberMutation>;
export type RemoveMemberMutationOptions = Apollo.BaseMutationOptions<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const GenerateInviteCodeDocument = gql`
    mutation GenerateInviteCode($groupId: ID!, $expiresInDays: Int, $maxUses: Int) {
  generateInviteCode(
    groupId: $groupId
    expiresInDays: $expiresInDays
    maxUses: $maxUses
  ) {
    id
    code
    expiresAt
    maxUses
    usesCount
  }
}
    `;
export type GenerateInviteCodeMutationFn = Apollo.MutationFunction<GenerateInviteCodeMutation, GenerateInviteCodeMutationVariables>;

/**
 * __useGenerateInviteCodeMutation__
 *
 * To run a mutation, you first call `useGenerateInviteCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateInviteCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateInviteCodeMutation, { data, loading, error }] = useGenerateInviteCodeMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      expiresInDays: // value for 'expiresInDays'
 *      maxUses: // value for 'maxUses'
 *   },
 * });
 */
export function useGenerateInviteCodeMutation(baseOptions?: Apollo.MutationHookOptions<GenerateInviteCodeMutation, GenerateInviteCodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateInviteCodeMutation, GenerateInviteCodeMutationVariables>(GenerateInviteCodeDocument, options);
      }
export type GenerateInviteCodeMutationHookResult = ReturnType<typeof useGenerateInviteCodeMutation>;
export type GenerateInviteCodeMutationResult = Apollo.MutationResult<GenerateInviteCodeMutation>;
export type GenerateInviteCodeMutationOptions = Apollo.BaseMutationOptions<GenerateInviteCodeMutation, GenerateInviteCodeMutationVariables>;
export const RevokeInviteCodeDocument = gql`
    mutation RevokeInviteCode($inviteId: ID!) {
  revokeInviteCode(inviteId: $inviteId)
}
    `;
export type RevokeInviteCodeMutationFn = Apollo.MutationFunction<RevokeInviteCodeMutation, RevokeInviteCodeMutationVariables>;

/**
 * __useRevokeInviteCodeMutation__
 *
 * To run a mutation, you first call `useRevokeInviteCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeInviteCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeInviteCodeMutation, { data, loading, error }] = useRevokeInviteCodeMutation({
 *   variables: {
 *      inviteId: // value for 'inviteId'
 *   },
 * });
 */
export function useRevokeInviteCodeMutation(baseOptions?: Apollo.MutationHookOptions<RevokeInviteCodeMutation, RevokeInviteCodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeInviteCodeMutation, RevokeInviteCodeMutationVariables>(RevokeInviteCodeDocument, options);
      }
export type RevokeInviteCodeMutationHookResult = ReturnType<typeof useRevokeInviteCodeMutation>;
export type RevokeInviteCodeMutationResult = Apollo.MutationResult<RevokeInviteCodeMutation>;
export type RevokeInviteCodeMutationOptions = Apollo.BaseMutationOptions<RevokeInviteCodeMutation, RevokeInviteCodeMutationVariables>;
export const RedeemInviteCodeDocument = gql`
    mutation RedeemInviteCode($code: String!) {
  redeemInviteCode(code: $code) {
    group {
      id
      name
    }
    invite {
      id
      code
    }
  }
}
    `;
export type RedeemInviteCodeMutationFn = Apollo.MutationFunction<RedeemInviteCodeMutation, RedeemInviteCodeMutationVariables>;

/**
 * __useRedeemInviteCodeMutation__
 *
 * To run a mutation, you first call `useRedeemInviteCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRedeemInviteCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [redeemInviteCodeMutation, { data, loading, error }] = useRedeemInviteCodeMutation({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useRedeemInviteCodeMutation(baseOptions?: Apollo.MutationHookOptions<RedeemInviteCodeMutation, RedeemInviteCodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RedeemInviteCodeMutation, RedeemInviteCodeMutationVariables>(RedeemInviteCodeDocument, options);
      }
export type RedeemInviteCodeMutationHookResult = ReturnType<typeof useRedeemInviteCodeMutation>;
export type RedeemInviteCodeMutationResult = Apollo.MutationResult<RedeemInviteCodeMutation>;
export type RedeemInviteCodeMutationOptions = Apollo.BaseMutationOptions<RedeemInviteCodeMutation, RedeemInviteCodeMutationVariables>;
export const ActivePeriodDocument = gql`
    query ActivePeriod($today: String!, $periodId: ID) {
  activePeriod(today: $today, periodId: $periodId) {
    id
    startDate
    endDate
    dailyLimit
    totalBudget
    remainingTotal
    extraBudget
    extraSpent
    extraRemaining
    status
    today {
      id
      date
      dailyLimit
      carryover
      availableBalance
      spent
      closedAt
    }
  }
}
    `;

/**
 * __useActivePeriodQuery__
 *
 * To run a query within a React component, call `useActivePeriodQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivePeriodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivePeriodQuery({
 *   variables: {
 *      today: // value for 'today'
 *      periodId: // value for 'periodId'
 *   },
 * });
 */
export function useActivePeriodQuery(baseOptions: Apollo.QueryHookOptions<ActivePeriodQuery, ActivePeriodQueryVariables> & ({ variables: ActivePeriodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ActivePeriodQuery, ActivePeriodQueryVariables>(ActivePeriodDocument, options);
      }
export function useActivePeriodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ActivePeriodQuery, ActivePeriodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ActivePeriodQuery, ActivePeriodQueryVariables>(ActivePeriodDocument, options);
        }
// @ts-ignore
export function useActivePeriodSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ActivePeriodQuery, ActivePeriodQueryVariables>): Apollo.UseSuspenseQueryResult<ActivePeriodQuery, ActivePeriodQueryVariables>;
export function useActivePeriodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ActivePeriodQuery, ActivePeriodQueryVariables>): Apollo.UseSuspenseQueryResult<ActivePeriodQuery | undefined, ActivePeriodQueryVariables>;
export function useActivePeriodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ActivePeriodQuery, ActivePeriodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ActivePeriodQuery, ActivePeriodQueryVariables>(ActivePeriodDocument, options);
        }
export type ActivePeriodQueryHookResult = ReturnType<typeof useActivePeriodQuery>;
export type ActivePeriodLazyQueryHookResult = ReturnType<typeof useActivePeriodLazyQuery>;
export type ActivePeriodSuspenseQueryHookResult = ReturnType<typeof useActivePeriodSuspenseQuery>;
export type ActivePeriodQueryResult = Apollo.QueryResult<ActivePeriodQuery, ActivePeriodQueryVariables>;
export const GroupPeriodsDocument = gql`
    query GroupPeriods {
  groupPeriods {
    id
    name
    startDate
    endDate
    dailyLimit
    totalBudget
    status
    availableBalance
  }
}
    `;

/**
 * __useGroupPeriodsQuery__
 *
 * To run a query within a React component, call `useGroupPeriodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupPeriodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupPeriodsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGroupPeriodsQuery(baseOptions?: Apollo.QueryHookOptions<GroupPeriodsQuery, GroupPeriodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GroupPeriodsQuery, GroupPeriodsQueryVariables>(GroupPeriodsDocument, options);
      }
export function useGroupPeriodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupPeriodsQuery, GroupPeriodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GroupPeriodsQuery, GroupPeriodsQueryVariables>(GroupPeriodsDocument, options);
        }
// @ts-ignore
export function useGroupPeriodsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GroupPeriodsQuery, GroupPeriodsQueryVariables>): Apollo.UseSuspenseQueryResult<GroupPeriodsQuery, GroupPeriodsQueryVariables>;
export function useGroupPeriodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupPeriodsQuery, GroupPeriodsQueryVariables>): Apollo.UseSuspenseQueryResult<GroupPeriodsQuery | undefined, GroupPeriodsQueryVariables>;
export function useGroupPeriodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupPeriodsQuery, GroupPeriodsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GroupPeriodsQuery, GroupPeriodsQueryVariables>(GroupPeriodsDocument, options);
        }
export type GroupPeriodsQueryHookResult = ReturnType<typeof useGroupPeriodsQuery>;
export type GroupPeriodsLazyQueryHookResult = ReturnType<typeof useGroupPeriodsLazyQuery>;
export type GroupPeriodsSuspenseQueryHookResult = ReturnType<typeof useGroupPeriodsSuspenseQuery>;
export type GroupPeriodsQueryResult = Apollo.QueryResult<GroupPeriodsQuery, GroupPeriodsQueryVariables>;
export const ExpenseHistoryDocument = gql`
    query ExpenseHistory($periodId: ID!) {
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
  }
}
    `;

/**
 * __useExpenseHistoryQuery__
 *
 * To run a query within a React component, call `useExpenseHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useExpenseHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExpenseHistoryQuery({
 *   variables: {
 *      periodId: // value for 'periodId'
 *   },
 * });
 */
export function useExpenseHistoryQuery(baseOptions: Apollo.QueryHookOptions<ExpenseHistoryQuery, ExpenseHistoryQueryVariables> & ({ variables: ExpenseHistoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>(ExpenseHistoryDocument, options);
      }
export function useExpenseHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>(ExpenseHistoryDocument, options);
        }
// @ts-ignore
export function useExpenseHistorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>;
export function useExpenseHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<ExpenseHistoryQuery | undefined, ExpenseHistoryQueryVariables>;
export function useExpenseHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>(ExpenseHistoryDocument, options);
        }
export type ExpenseHistoryQueryHookResult = ReturnType<typeof useExpenseHistoryQuery>;
export type ExpenseHistoryLazyQueryHookResult = ReturnType<typeof useExpenseHistoryLazyQuery>;
export type ExpenseHistorySuspenseQueryHookResult = ReturnType<typeof useExpenseHistorySuspenseQuery>;
export type ExpenseHistoryQueryResult = Apollo.QueryResult<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>;
export const CategoriesDocument = gql`
    query Categories($type: String) {
  categories(type: $type) {
    id
    name
    type
    icon
    subcategories {
      id
      name
    }
  }
}
    `;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
      }
export function useCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
// @ts-ignore
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<CategoriesQuery, CategoriesQueryVariables>;
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<CategoriesQuery | undefined, CategoriesQueryVariables>;
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesSuspenseQueryHookResult = ReturnType<typeof useCategoriesSuspenseQuery>;
export type CategoriesQueryResult = Apollo.QueryResult<CategoriesQuery, CategoriesQueryVariables>;
export const InstallmentsDocument = gql`
    query Installments($expenseId: ID!) {
  installments(expenseId: $expenseId) {
    id
    amount
    date
    note
    installmentNumber
    installmentCount
  }
}
    `;

/**
 * __useInstallmentsQuery__
 *
 * To run a query within a React component, call `useInstallmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useInstallmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInstallmentsQuery({
 *   variables: {
 *      expenseId: // value for 'expenseId'
 *   },
 * });
 */
export function useInstallmentsQuery(baseOptions: Apollo.QueryHookOptions<InstallmentsQuery, InstallmentsQueryVariables> & ({ variables: InstallmentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InstallmentsQuery, InstallmentsQueryVariables>(InstallmentsDocument, options);
      }
export function useInstallmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InstallmentsQuery, InstallmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InstallmentsQuery, InstallmentsQueryVariables>(InstallmentsDocument, options);
        }
// @ts-ignore
export function useInstallmentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<InstallmentsQuery, InstallmentsQueryVariables>): Apollo.UseSuspenseQueryResult<InstallmentsQuery, InstallmentsQueryVariables>;
export function useInstallmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InstallmentsQuery, InstallmentsQueryVariables>): Apollo.UseSuspenseQueryResult<InstallmentsQuery | undefined, InstallmentsQueryVariables>;
export function useInstallmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InstallmentsQuery, InstallmentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InstallmentsQuery, InstallmentsQueryVariables>(InstallmentsDocument, options);
        }
export type InstallmentsQueryHookResult = ReturnType<typeof useInstallmentsQuery>;
export type InstallmentsLazyQueryHookResult = ReturnType<typeof useInstallmentsLazyQuery>;
export type InstallmentsSuspenseQueryHookResult = ReturnType<typeof useInstallmentsSuspenseQuery>;
export type InstallmentsQueryResult = Apollo.QueryResult<InstallmentsQuery, InstallmentsQueryVariables>;
export const DashboardDataDocument = gql`
    query DashboardData($from: String!, $to: String!) {
  expensesInRange(from: $from, to: $to) {
    id
    amount
    date
    isExtra
    createdBy {
      id
      name
      email
    }
    subcategory {
      id
      name
      categoryId
    }
  }
  categories(type: "expense") {
    id
    name
    subcategories {
      id
      name
    }
  }
}
    `;

/**
 * __useDashboardDataQuery__
 *
 * To run a query within a React component, call `useDashboardDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardDataQuery({
 *   variables: {
 *      from: // value for 'from'
 *      to: // value for 'to'
 *   },
 * });
 */
export function useDashboardDataQuery(baseOptions: Apollo.QueryHookOptions<DashboardDataQuery, DashboardDataQueryVariables> & ({ variables: DashboardDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DashboardDataQuery, DashboardDataQueryVariables>(DashboardDataDocument, options);
      }
export function useDashboardDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DashboardDataQuery, DashboardDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DashboardDataQuery, DashboardDataQueryVariables>(DashboardDataDocument, options);
        }
// @ts-ignore
export function useDashboardDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<DashboardDataQuery, DashboardDataQueryVariables>): Apollo.UseSuspenseQueryResult<DashboardDataQuery, DashboardDataQueryVariables>;
export function useDashboardDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DashboardDataQuery, DashboardDataQueryVariables>): Apollo.UseSuspenseQueryResult<DashboardDataQuery | undefined, DashboardDataQueryVariables>;
export function useDashboardDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DashboardDataQuery, DashboardDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DashboardDataQuery, DashboardDataQueryVariables>(DashboardDataDocument, options);
        }
export type DashboardDataQueryHookResult = ReturnType<typeof useDashboardDataQuery>;
export type DashboardDataLazyQueryHookResult = ReturnType<typeof useDashboardDataLazyQuery>;
export type DashboardDataSuspenseQueryHookResult = ReturnType<typeof useDashboardDataSuspenseQuery>;
export type DashboardDataQueryResult = Apollo.QueryResult<DashboardDataQuery, DashboardDataQueryVariables>;
export const FinancialAccountsDocument = gql`
    query FinancialAccounts($today: String) {
  financialAccounts(today: $today) {
    id
    name
    kind
    isPrimary
    balance
    balanceDate
    closingDay
    dueDay
    invoiceGoal
    monthlyCredit
    creditDay
    nextCreditDate
    owner {
      id
      name
      email
    }
  }
}
    `;

/**
 * __useFinancialAccountsQuery__
 *
 * To run a query within a React component, call `useFinancialAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFinancialAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFinancialAccountsQuery({
 *   variables: {
 *      today: // value for 'today'
 *   },
 * });
 */
export function useFinancialAccountsQuery(baseOptions?: Apollo.QueryHookOptions<FinancialAccountsQuery, FinancialAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FinancialAccountsQuery, FinancialAccountsQueryVariables>(FinancialAccountsDocument, options);
      }
export function useFinancialAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FinancialAccountsQuery, FinancialAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FinancialAccountsQuery, FinancialAccountsQueryVariables>(FinancialAccountsDocument, options);
        }
// @ts-ignore
export function useFinancialAccountsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FinancialAccountsQuery, FinancialAccountsQueryVariables>): Apollo.UseSuspenseQueryResult<FinancialAccountsQuery, FinancialAccountsQueryVariables>;
export function useFinancialAccountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FinancialAccountsQuery, FinancialAccountsQueryVariables>): Apollo.UseSuspenseQueryResult<FinancialAccountsQuery | undefined, FinancialAccountsQueryVariables>;
export function useFinancialAccountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FinancialAccountsQuery, FinancialAccountsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FinancialAccountsQuery, FinancialAccountsQueryVariables>(FinancialAccountsDocument, options);
        }
export type FinancialAccountsQueryHookResult = ReturnType<typeof useFinancialAccountsQuery>;
export type FinancialAccountsLazyQueryHookResult = ReturnType<typeof useFinancialAccountsLazyQuery>;
export type FinancialAccountsSuspenseQueryHookResult = ReturnType<typeof useFinancialAccountsSuspenseQuery>;
export type FinancialAccountsQueryResult = Apollo.QueryResult<FinancialAccountsQuery, FinancialAccountsQueryVariables>;
export const InvoicesDocument = gql`
    query Invoices($cardId: ID!, $today: String, $past: Int) {
  invoices(cardId: $cardId, today: $today, past: $past) {
    cardId
    month
    startDate
    closingDate
    dueDate
    total
    paid
    remaining
    status
  }
}
    `;

/**
 * __useInvoicesQuery__
 *
 * To run a query within a React component, call `useInvoicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInvoicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInvoicesQuery({
 *   variables: {
 *      cardId: // value for 'cardId'
 *      today: // value for 'today'
 *      past: // value for 'past'
 *   },
 * });
 */
export function useInvoicesQuery(baseOptions: Apollo.QueryHookOptions<InvoicesQuery, InvoicesQueryVariables> & ({ variables: InvoicesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
      }
export function useInvoicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
        }
// @ts-ignore
export function useInvoicesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>): Apollo.UseSuspenseQueryResult<InvoicesQuery, InvoicesQueryVariables>;
export function useInvoicesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>): Apollo.UseSuspenseQueryResult<InvoicesQuery | undefined, InvoicesQueryVariables>;
export function useInvoicesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
        }
export type InvoicesQueryHookResult = ReturnType<typeof useInvoicesQuery>;
export type InvoicesLazyQueryHookResult = ReturnType<typeof useInvoicesLazyQuery>;
export type InvoicesSuspenseQueryHookResult = ReturnType<typeof useInvoicesSuspenseQuery>;
export type InvoicesQueryResult = Apollo.QueryResult<InvoicesQuery, InvoicesQueryVariables>;
export const InvoiceDocument = gql`
    query Invoice($cardId: ID!, $month: String!, $today: String) {
  invoice(cardId: $cardId, month: $month, today: $today) {
    cardId
    month
    startDate
    closingDate
    dueDate
    total
    paid
    remaining
    status
    entries {
      id
      amount
      date
      note
      type
      isExtra
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
  }
}
    `;

/**
 * __useInvoiceQuery__
 *
 * To run a query within a React component, call `useInvoiceQuery` and pass it any options that fit your needs.
 * When your component renders, `useInvoiceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInvoiceQuery({
 *   variables: {
 *      cardId: // value for 'cardId'
 *      month: // value for 'month'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useInvoiceQuery(baseOptions: Apollo.QueryHookOptions<InvoiceQuery, InvoiceQueryVariables> & ({ variables: InvoiceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InvoiceQuery, InvoiceQueryVariables>(InvoiceDocument, options);
      }
export function useInvoiceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InvoiceQuery, InvoiceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InvoiceQuery, InvoiceQueryVariables>(InvoiceDocument, options);
        }
// @ts-ignore
export function useInvoiceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<InvoiceQuery, InvoiceQueryVariables>): Apollo.UseSuspenseQueryResult<InvoiceQuery, InvoiceQueryVariables>;
export function useInvoiceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InvoiceQuery, InvoiceQueryVariables>): Apollo.UseSuspenseQueryResult<InvoiceQuery | undefined, InvoiceQueryVariables>;
export function useInvoiceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InvoiceQuery, InvoiceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InvoiceQuery, InvoiceQueryVariables>(InvoiceDocument, options);
        }
export type InvoiceQueryHookResult = ReturnType<typeof useInvoiceQuery>;
export type InvoiceLazyQueryHookResult = ReturnType<typeof useInvoiceLazyQuery>;
export type InvoiceSuspenseQueryHookResult = ReturnType<typeof useInvoiceSuspenseQuery>;
export type InvoiceQueryResult = Apollo.QueryResult<InvoiceQuery, InvoiceQueryVariables>;
export const AccountMovementsDocument = gql`
    query AccountMovements($accountId: ID!, $limit: Int) {
  accountMovements(accountId: $accountId, limit: $limit) {
    id
    kind
    date
    description
    amount
  }
}
    `;

/**
 * __useAccountMovementsQuery__
 *
 * To run a query within a React component, call `useAccountMovementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountMovementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountMovementsQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useAccountMovementsQuery(baseOptions: Apollo.QueryHookOptions<AccountMovementsQuery, AccountMovementsQueryVariables> & ({ variables: AccountMovementsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountMovementsQuery, AccountMovementsQueryVariables>(AccountMovementsDocument, options);
      }
export function useAccountMovementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountMovementsQuery, AccountMovementsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountMovementsQuery, AccountMovementsQueryVariables>(AccountMovementsDocument, options);
        }
// @ts-ignore
export function useAccountMovementsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AccountMovementsQuery, AccountMovementsQueryVariables>): Apollo.UseSuspenseQueryResult<AccountMovementsQuery, AccountMovementsQueryVariables>;
export function useAccountMovementsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AccountMovementsQuery, AccountMovementsQueryVariables>): Apollo.UseSuspenseQueryResult<AccountMovementsQuery | undefined, AccountMovementsQueryVariables>;
export function useAccountMovementsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AccountMovementsQuery, AccountMovementsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AccountMovementsQuery, AccountMovementsQueryVariables>(AccountMovementsDocument, options);
        }
export type AccountMovementsQueryHookResult = ReturnType<typeof useAccountMovementsQuery>;
export type AccountMovementsLazyQueryHookResult = ReturnType<typeof useAccountMovementsLazyQuery>;
export type AccountMovementsSuspenseQueryHookResult = ReturnType<typeof useAccountMovementsSuspenseQuery>;
export type AccountMovementsQueryResult = Apollo.QueryResult<AccountMovementsQuery, AccountMovementsQueryVariables>;
export const FinancePanelDocument = gql`
    query FinancePanel($today: String) {
  financePanel(today: $today) {
    hasAccounts
    primaryAccountId
    available
    committed
    free
    horizonDate
    commitments {
      kind
      label
      dueDate
      amount
      status
      cardId
      billId
      month
    }
    salary {
      configured
      amount
      cycleStartDate
      nextSalaryDate
      pending
    }
  }
}
    `;

/**
 * __useFinancePanelQuery__
 *
 * To run a query within a React component, call `useFinancePanelQuery` and pass it any options that fit your needs.
 * When your component renders, `useFinancePanelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFinancePanelQuery({
 *   variables: {
 *      today: // value for 'today'
 *   },
 * });
 */
export function useFinancePanelQuery(baseOptions?: Apollo.QueryHookOptions<FinancePanelQuery, FinancePanelQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FinancePanelQuery, FinancePanelQueryVariables>(FinancePanelDocument, options);
      }
export function useFinancePanelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FinancePanelQuery, FinancePanelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FinancePanelQuery, FinancePanelQueryVariables>(FinancePanelDocument, options);
        }
// @ts-ignore
export function useFinancePanelSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FinancePanelQuery, FinancePanelQueryVariables>): Apollo.UseSuspenseQueryResult<FinancePanelQuery, FinancePanelQueryVariables>;
export function useFinancePanelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FinancePanelQuery, FinancePanelQueryVariables>): Apollo.UseSuspenseQueryResult<FinancePanelQuery | undefined, FinancePanelQueryVariables>;
export function useFinancePanelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FinancePanelQuery, FinancePanelQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FinancePanelQuery, FinancePanelQueryVariables>(FinancePanelDocument, options);
        }
export type FinancePanelQueryHookResult = ReturnType<typeof useFinancePanelQuery>;
export type FinancePanelLazyQueryHookResult = ReturnType<typeof useFinancePanelLazyQuery>;
export type FinancePanelSuspenseQueryHookResult = ReturnType<typeof useFinancePanelSuspenseQuery>;
export type FinancePanelQueryResult = Apollo.QueryResult<FinancePanelQuery, FinancePanelQueryVariables>;
export const RecurringBillsDocument = gql`
    query RecurringBills {
  recurringBills {
    id
    name
    amount
    dueDay
    direction
    onceMonth
    account {
      id
      name
      kind
    }
    subcategory {
      id
      name
      categoryId
    }
  }
}
    `;

/**
 * __useRecurringBillsQuery__
 *
 * To run a query within a React component, call `useRecurringBillsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecurringBillsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecurringBillsQuery({
 *   variables: {
 *   },
 * });
 */
export function useRecurringBillsQuery(baseOptions?: Apollo.QueryHookOptions<RecurringBillsQuery, RecurringBillsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecurringBillsQuery, RecurringBillsQueryVariables>(RecurringBillsDocument, options);
      }
export function useRecurringBillsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecurringBillsQuery, RecurringBillsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecurringBillsQuery, RecurringBillsQueryVariables>(RecurringBillsDocument, options);
        }
// @ts-ignore
export function useRecurringBillsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RecurringBillsQuery, RecurringBillsQueryVariables>): Apollo.UseSuspenseQueryResult<RecurringBillsQuery, RecurringBillsQueryVariables>;
export function useRecurringBillsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RecurringBillsQuery, RecurringBillsQueryVariables>): Apollo.UseSuspenseQueryResult<RecurringBillsQuery | undefined, RecurringBillsQueryVariables>;
export function useRecurringBillsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RecurringBillsQuery, RecurringBillsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RecurringBillsQuery, RecurringBillsQueryVariables>(RecurringBillsDocument, options);
        }
export type RecurringBillsQueryHookResult = ReturnType<typeof useRecurringBillsQuery>;
export type RecurringBillsLazyQueryHookResult = ReturnType<typeof useRecurringBillsLazyQuery>;
export type RecurringBillsSuspenseQueryHookResult = ReturnType<typeof useRecurringBillsSuspenseQuery>;
export type RecurringBillsQueryResult = Apollo.QueryResult<RecurringBillsQuery, RecurringBillsQueryVariables>;
export const BillOccurrencesDocument = gql`
    query BillOccurrences($month: String!, $today: String) {
  billOccurrences(month: $month, today: $today) {
    month
    dueDate
    nextDueDate
    paidOn
    status
    amount
    expenseId
    bill {
      id
      name
      amount
      dueDay
      direction
      onceMonth
      account {
        id
        name
        kind
      }
      subcategory {
        id
        name
        categoryId
      }
    }
  }
}
    `;

/**
 * __useBillOccurrencesQuery__
 *
 * To run a query within a React component, call `useBillOccurrencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useBillOccurrencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBillOccurrencesQuery({
 *   variables: {
 *      month: // value for 'month'
 *      today: // value for 'today'
 *   },
 * });
 */
export function useBillOccurrencesQuery(baseOptions: Apollo.QueryHookOptions<BillOccurrencesQuery, BillOccurrencesQueryVariables> & ({ variables: BillOccurrencesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BillOccurrencesQuery, BillOccurrencesQueryVariables>(BillOccurrencesDocument, options);
      }
export function useBillOccurrencesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BillOccurrencesQuery, BillOccurrencesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BillOccurrencesQuery, BillOccurrencesQueryVariables>(BillOccurrencesDocument, options);
        }
// @ts-ignore
export function useBillOccurrencesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<BillOccurrencesQuery, BillOccurrencesQueryVariables>): Apollo.UseSuspenseQueryResult<BillOccurrencesQuery, BillOccurrencesQueryVariables>;
export function useBillOccurrencesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BillOccurrencesQuery, BillOccurrencesQueryVariables>): Apollo.UseSuspenseQueryResult<BillOccurrencesQuery | undefined, BillOccurrencesQueryVariables>;
export function useBillOccurrencesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BillOccurrencesQuery, BillOccurrencesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BillOccurrencesQuery, BillOccurrencesQueryVariables>(BillOccurrencesDocument, options);
        }
export type BillOccurrencesQueryHookResult = ReturnType<typeof useBillOccurrencesQuery>;
export type BillOccurrencesLazyQueryHookResult = ReturnType<typeof useBillOccurrencesLazyQuery>;
export type BillOccurrencesSuspenseQueryHookResult = ReturnType<typeof useBillOccurrencesSuspenseQuery>;
export type BillOccurrencesQueryResult = Apollo.QueryResult<BillOccurrencesQuery, BillOccurrencesQueryVariables>;
export const FinancialSettingsDocument = gql`
    query FinancialSettings($today: String) {
  financialSettings(today: $today) {
    salaryAmount
    salaryBusinessDay
    salaryAccountId
    reserveGoal
    upcomingSalaryDates {
      month
      date
      isManual
    }
  }
}
    `;

/**
 * __useFinancialSettingsQuery__
 *
 * To run a query within a React component, call `useFinancialSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFinancialSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFinancialSettingsQuery({
 *   variables: {
 *      today: // value for 'today'
 *   },
 * });
 */
export function useFinancialSettingsQuery(baseOptions?: Apollo.QueryHookOptions<FinancialSettingsQuery, FinancialSettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FinancialSettingsQuery, FinancialSettingsQueryVariables>(FinancialSettingsDocument, options);
      }
export function useFinancialSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FinancialSettingsQuery, FinancialSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FinancialSettingsQuery, FinancialSettingsQueryVariables>(FinancialSettingsDocument, options);
        }
// @ts-ignore
export function useFinancialSettingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FinancialSettingsQuery, FinancialSettingsQueryVariables>): Apollo.UseSuspenseQueryResult<FinancialSettingsQuery, FinancialSettingsQueryVariables>;
export function useFinancialSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FinancialSettingsQuery, FinancialSettingsQueryVariables>): Apollo.UseSuspenseQueryResult<FinancialSettingsQuery | undefined, FinancialSettingsQueryVariables>;
export function useFinancialSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FinancialSettingsQuery, FinancialSettingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FinancialSettingsQuery, FinancialSettingsQueryVariables>(FinancialSettingsDocument, options);
        }
export type FinancialSettingsQueryHookResult = ReturnType<typeof useFinancialSettingsQuery>;
export type FinancialSettingsLazyQueryHookResult = ReturnType<typeof useFinancialSettingsLazyQuery>;
export type FinancialSettingsSuspenseQueryHookResult = ReturnType<typeof useFinancialSettingsSuspenseQuery>;
export type FinancialSettingsQueryResult = Apollo.QueryResult<FinancialSettingsQuery, FinancialSettingsQueryVariables>;
export const AllowancePlanDocument = gql`
    query AllowancePlan($today: String) {
  allowancePlan(today: $today) {
    cycleEndDate
    opensOn
    free
    shortfall
    amount
    canDistribute
    distributed
    shares {
      accountId
      accountName
      ownerName
      amount
    }
  }
}
    `;

/**
 * __useAllowancePlanQuery__
 *
 * To run a query within a React component, call `useAllowancePlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllowancePlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllowancePlanQuery({
 *   variables: {
 *      today: // value for 'today'
 *   },
 * });
 */
export function useAllowancePlanQuery(baseOptions?: Apollo.QueryHookOptions<AllowancePlanQuery, AllowancePlanQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllowancePlanQuery, AllowancePlanQueryVariables>(AllowancePlanDocument, options);
      }
export function useAllowancePlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllowancePlanQuery, AllowancePlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllowancePlanQuery, AllowancePlanQueryVariables>(AllowancePlanDocument, options);
        }
// @ts-ignore
export function useAllowancePlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AllowancePlanQuery, AllowancePlanQueryVariables>): Apollo.UseSuspenseQueryResult<AllowancePlanQuery, AllowancePlanQueryVariables>;
export function useAllowancePlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllowancePlanQuery, AllowancePlanQueryVariables>): Apollo.UseSuspenseQueryResult<AllowancePlanQuery | undefined, AllowancePlanQueryVariables>;
export function useAllowancePlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllowancePlanQuery, AllowancePlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AllowancePlanQuery, AllowancePlanQueryVariables>(AllowancePlanDocument, options);
        }
export type AllowancePlanQueryHookResult = ReturnType<typeof useAllowancePlanQuery>;
export type AllowancePlanLazyQueryHookResult = ReturnType<typeof useAllowancePlanLazyQuery>;
export type AllowancePlanSuspenseQueryHookResult = ReturnType<typeof useAllowancePlanSuspenseQuery>;
export type AllowancePlanQueryResult = Apollo.QueryResult<AllowancePlanQuery, AllowancePlanQueryVariables>;
export const ReserveStatusDocument = gql`
    query ReserveStatus($today: String) {
  reserveStatus(today: $today) {
    goal
    total
  }
}
    `;

/**
 * __useReserveStatusQuery__
 *
 * To run a query within a React component, call `useReserveStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useReserveStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReserveStatusQuery({
 *   variables: {
 *      today: // value for 'today'
 *   },
 * });
 */
export function useReserveStatusQuery(baseOptions?: Apollo.QueryHookOptions<ReserveStatusQuery, ReserveStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReserveStatusQuery, ReserveStatusQueryVariables>(ReserveStatusDocument, options);
      }
export function useReserveStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReserveStatusQuery, ReserveStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReserveStatusQuery, ReserveStatusQueryVariables>(ReserveStatusDocument, options);
        }
// @ts-ignore
export function useReserveStatusSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ReserveStatusQuery, ReserveStatusQueryVariables>): Apollo.UseSuspenseQueryResult<ReserveStatusQuery, ReserveStatusQueryVariables>;
export function useReserveStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ReserveStatusQuery, ReserveStatusQueryVariables>): Apollo.UseSuspenseQueryResult<ReserveStatusQuery | undefined, ReserveStatusQueryVariables>;
export function useReserveStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ReserveStatusQuery, ReserveStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ReserveStatusQuery, ReserveStatusQueryVariables>(ReserveStatusDocument, options);
        }
export type ReserveStatusQueryHookResult = ReturnType<typeof useReserveStatusQuery>;
export type ReserveStatusLazyQueryHookResult = ReturnType<typeof useReserveStatusLazyQuery>;
export type ReserveStatusSuspenseQueryHookResult = ReturnType<typeof useReserveStatusSuspenseQuery>;
export type ReserveStatusQueryResult = Apollo.QueryResult<ReserveStatusQuery, ReserveStatusQueryVariables>;
export const MonthPlanDocument = gql`
    query MonthPlan($today: String) {
  monthPlan(today: $today) {
    current {
      endDate
      hasPrimary
      balance
      salaries {
        label
        date
        amount
      }
      incomes {
        label
        date
        amount
      }
      invoices {
        label
        date
        amount
      }
      invoiceDueDate
      afterInvoices
      fixedBills {
        label
        date
        amount
      }
      oneOffBills {
        label
        date
        amount
      }
      leftover
    }
    next {
      startDate
      endDate
      days
      salary {
        label
        date
        amount
      }
      benefits {
        label
        date
        amount
      }
      fixedBills {
        label
        date
        amount
      }
      installments {
        label
        date
        amount
      }
      remaining
    }
  }
}
    `;

/**
 * __useMonthPlanQuery__
 *
 * To run a query within a React component, call `useMonthPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useMonthPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMonthPlanQuery({
 *   variables: {
 *      today: // value for 'today'
 *   },
 * });
 */
export function useMonthPlanQuery(baseOptions?: Apollo.QueryHookOptions<MonthPlanQuery, MonthPlanQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MonthPlanQuery, MonthPlanQueryVariables>(MonthPlanDocument, options);
      }
export function useMonthPlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MonthPlanQuery, MonthPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MonthPlanQuery, MonthPlanQueryVariables>(MonthPlanDocument, options);
        }
// @ts-ignore
export function useMonthPlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MonthPlanQuery, MonthPlanQueryVariables>): Apollo.UseSuspenseQueryResult<MonthPlanQuery, MonthPlanQueryVariables>;
export function useMonthPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MonthPlanQuery, MonthPlanQueryVariables>): Apollo.UseSuspenseQueryResult<MonthPlanQuery | undefined, MonthPlanQueryVariables>;
export function useMonthPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MonthPlanQuery, MonthPlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MonthPlanQuery, MonthPlanQueryVariables>(MonthPlanDocument, options);
        }
export type MonthPlanQueryHookResult = ReturnType<typeof useMonthPlanQuery>;
export type MonthPlanLazyQueryHookResult = ReturnType<typeof useMonthPlanLazyQuery>;
export type MonthPlanSuspenseQueryHookResult = ReturnType<typeof useMonthPlanSuspenseQuery>;
export type MonthPlanQueryResult = Apollo.QueryResult<MonthPlanQuery, MonthPlanQueryVariables>;
export const MyGroupsDocument = gql`
    query MyGroups {
  myGroups {
    id
    name
    ownerId
    insertedAt
  }
}
    `;

/**
 * __useMyGroupsQuery__
 *
 * To run a query within a React component, call `useMyGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyGroupsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyGroupsQuery(baseOptions?: Apollo.QueryHookOptions<MyGroupsQuery, MyGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyGroupsQuery, MyGroupsQueryVariables>(MyGroupsDocument, options);
      }
export function useMyGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyGroupsQuery, MyGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyGroupsQuery, MyGroupsQueryVariables>(MyGroupsDocument, options);
        }
// @ts-ignore
export function useMyGroupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyGroupsQuery, MyGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<MyGroupsQuery, MyGroupsQueryVariables>;
export function useMyGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyGroupsQuery, MyGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<MyGroupsQuery | undefined, MyGroupsQueryVariables>;
export function useMyGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyGroupsQuery, MyGroupsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyGroupsQuery, MyGroupsQueryVariables>(MyGroupsDocument, options);
        }
export type MyGroupsQueryHookResult = ReturnType<typeof useMyGroupsQuery>;
export type MyGroupsLazyQueryHookResult = ReturnType<typeof useMyGroupsLazyQuery>;
export type MyGroupsSuspenseQueryHookResult = ReturnType<typeof useMyGroupsSuspenseQuery>;
export type MyGroupsQueryResult = Apollo.QueryResult<MyGroupsQuery, MyGroupsQueryVariables>;
export const ActiveGroupDocument = gql`
    query ActiveGroup {
  activeGroup {
    id
    name
    ownerId
  }
}
    `;

/**
 * __useActiveGroupQuery__
 *
 * To run a query within a React component, call `useActiveGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveGroupQuery({
 *   variables: {
 *   },
 * });
 */
export function useActiveGroupQuery(baseOptions?: Apollo.QueryHookOptions<ActiveGroupQuery, ActiveGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ActiveGroupQuery, ActiveGroupQueryVariables>(ActiveGroupDocument, options);
      }
export function useActiveGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ActiveGroupQuery, ActiveGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ActiveGroupQuery, ActiveGroupQueryVariables>(ActiveGroupDocument, options);
        }
// @ts-ignore
export function useActiveGroupSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ActiveGroupQuery, ActiveGroupQueryVariables>): Apollo.UseSuspenseQueryResult<ActiveGroupQuery, ActiveGroupQueryVariables>;
export function useActiveGroupSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ActiveGroupQuery, ActiveGroupQueryVariables>): Apollo.UseSuspenseQueryResult<ActiveGroupQuery | undefined, ActiveGroupQueryVariables>;
export function useActiveGroupSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ActiveGroupQuery, ActiveGroupQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ActiveGroupQuery, ActiveGroupQueryVariables>(ActiveGroupDocument, options);
        }
export type ActiveGroupQueryHookResult = ReturnType<typeof useActiveGroupQuery>;
export type ActiveGroupLazyQueryHookResult = ReturnType<typeof useActiveGroupLazyQuery>;
export type ActiveGroupSuspenseQueryHookResult = ReturnType<typeof useActiveGroupSuspenseQuery>;
export type ActiveGroupQueryResult = Apollo.QueryResult<ActiveGroupQuery, ActiveGroupQueryVariables>;
export const GroupMembersDocument = gql`
    query GroupMembers($groupId: ID!) {
  groupMembers(groupId: $groupId) {
    id
    email
    joinedAt
    isOwner
  }
}
    `;

/**
 * __useGroupMembersQuery__
 *
 * To run a query within a React component, call `useGroupMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMembersQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupMembersQuery(baseOptions: Apollo.QueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables> & ({ variables: GroupMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, options);
      }
export function useGroupMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, options);
        }
// @ts-ignore
export function useGroupMembersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>): Apollo.UseSuspenseQueryResult<GroupMembersQuery, GroupMembersQueryVariables>;
export function useGroupMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>): Apollo.UseSuspenseQueryResult<GroupMembersQuery | undefined, GroupMembersQueryVariables>;
export function useGroupMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, options);
        }
export type GroupMembersQueryHookResult = ReturnType<typeof useGroupMembersQuery>;
export type GroupMembersLazyQueryHookResult = ReturnType<typeof useGroupMembersLazyQuery>;
export type GroupMembersSuspenseQueryHookResult = ReturnType<typeof useGroupMembersSuspenseQuery>;
export type GroupMembersQueryResult = Apollo.QueryResult<GroupMembersQuery, GroupMembersQueryVariables>;
export const GroupInvitesDocument = gql`
    query GroupInvites($groupId: ID!) {
  groupInvites(groupId: $groupId) {
    id
    code
    expiresAt
    maxUses
    usesCount
    insertedAt
  }
}
    `;

/**
 * __useGroupInvitesQuery__
 *
 * To run a query within a React component, call `useGroupInvitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupInvitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupInvitesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupInvitesQuery(baseOptions: Apollo.QueryHookOptions<GroupInvitesQuery, GroupInvitesQueryVariables> & ({ variables: GroupInvitesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GroupInvitesQuery, GroupInvitesQueryVariables>(GroupInvitesDocument, options);
      }
export function useGroupInvitesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupInvitesQuery, GroupInvitesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GroupInvitesQuery, GroupInvitesQueryVariables>(GroupInvitesDocument, options);
        }
// @ts-ignore
export function useGroupInvitesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GroupInvitesQuery, GroupInvitesQueryVariables>): Apollo.UseSuspenseQueryResult<GroupInvitesQuery, GroupInvitesQueryVariables>;
export function useGroupInvitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupInvitesQuery, GroupInvitesQueryVariables>): Apollo.UseSuspenseQueryResult<GroupInvitesQuery | undefined, GroupInvitesQueryVariables>;
export function useGroupInvitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupInvitesQuery, GroupInvitesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GroupInvitesQuery, GroupInvitesQueryVariables>(GroupInvitesDocument, options);
        }
export type GroupInvitesQueryHookResult = ReturnType<typeof useGroupInvitesQuery>;
export type GroupInvitesLazyQueryHookResult = ReturnType<typeof useGroupInvitesLazyQuery>;
export type GroupInvitesSuspenseQueryHookResult = ReturnType<typeof useGroupInvitesSuspenseQuery>;
export type GroupInvitesQueryResult = Apollo.QueryResult<GroupInvitesQuery, GroupInvitesQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    name
    isAdmin
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const ListInvitesDocument = gql`
    query ListInvites {
  listInvites {
    id
    token
    usedByEmail
    usedAt
    expiresAt
    revokedAt
    insertedAt
  }
}
    `;

/**
 * __useListInvitesQuery__
 *
 * To run a query within a React component, call `useListInvitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListInvitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListInvitesQuery({
 *   variables: {
 *   },
 * });
 */
export function useListInvitesQuery(baseOptions?: Apollo.QueryHookOptions<ListInvitesQuery, ListInvitesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListInvitesQuery, ListInvitesQueryVariables>(ListInvitesDocument, options);
      }
export function useListInvitesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListInvitesQuery, ListInvitesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListInvitesQuery, ListInvitesQueryVariables>(ListInvitesDocument, options);
        }
// @ts-ignore
export function useListInvitesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListInvitesQuery, ListInvitesQueryVariables>): Apollo.UseSuspenseQueryResult<ListInvitesQuery, ListInvitesQueryVariables>;
export function useListInvitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListInvitesQuery, ListInvitesQueryVariables>): Apollo.UseSuspenseQueryResult<ListInvitesQuery | undefined, ListInvitesQueryVariables>;
export function useListInvitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListInvitesQuery, ListInvitesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListInvitesQuery, ListInvitesQueryVariables>(ListInvitesDocument, options);
        }
export type ListInvitesQueryHookResult = ReturnType<typeof useListInvitesQuery>;
export type ListInvitesLazyQueryHookResult = ReturnType<typeof useListInvitesLazyQuery>;
export type ListInvitesSuspenseQueryHookResult = ReturnType<typeof useListInvitesSuspenseQuery>;
export type ListInvitesQueryResult = Apollo.QueryResult<ListInvitesQuery, ListInvitesQueryVariables>;