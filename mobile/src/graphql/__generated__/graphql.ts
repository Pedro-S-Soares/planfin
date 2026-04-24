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

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type BudgetDay = {
  __typename?: 'BudgetDay';
  availableBalance?: Maybe<Scalars['String']['output']>;
  carryover?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  dailyLimit?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
};

export type Category = {
  __typename?: 'Category';
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  subcategories?: Maybe<Array<Maybe<Subcategory>>>;
};

export type Expense = {
  __typename?: 'Expense';
  amount?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<User>;
  date?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  subcategory?: Maybe<Subcategory>;
};

export type ExpenseDay = {
  __typename?: 'ExpenseDay';
  date?: Maybe<Scalars['String']['output']>;
  expenses?: Maybe<Array<Maybe<Expense>>>;
  total?: Maybe<Scalars['String']['output']>;
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

export type Period = {
  __typename?: 'Period';
  dailyLimit?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  today?: Maybe<BudgetDay>;
};

export type PeriodSummary = {
  __typename?: 'PeriodSummary';
  daysCount?: Maybe<Scalars['Int']['output']>;
  difference?: Maybe<Scalars['String']['output']>;
  totalBudgeted?: Maybe<Scalars['String']['output']>;
  totalSpent?: Maybe<Scalars['String']['output']>;
};

export type RedeemInvitePayload = {
  __typename?: 'RedeemInvitePayload';
  group?: Maybe<Group>;
  invite?: Maybe<GroupInvite>;
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  createCategory?: Maybe<Category>;
  createExpense?: Maybe<Expense>;
  createGroup?: Maybe<Group>;
  createPeriod?: Maybe<Period>;
  createSubcategory?: Maybe<Subcategory>;
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  deleteExpense?: Maybe<Scalars['Boolean']['output']>;
  deleteGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteSubcategory?: Maybe<Scalars['Boolean']['output']>;
  forgotPassword?: Maybe<Scalars['Boolean']['output']>;
  generateInviteCode?: Maybe<GroupInvite>;
  leaveGroup?: Maybe<Scalars['Boolean']['output']>;
  login?: Maybe<AuthPayload>;
  logout?: Maybe<Scalars['Boolean']['output']>;
  redeemInviteCode?: Maybe<RedeemInvitePayload>;
  registerUser?: Maybe<AuthPayload>;
  removeMember?: Maybe<Scalars['Boolean']['output']>;
  renameGroup?: Maybe<Group>;
  resetPassword?: Maybe<Scalars['Boolean']['output']>;
  revokeInviteCode?: Maybe<Scalars['Boolean']['output']>;
  switchActiveGroup?: Maybe<Group>;
  updateCategory?: Maybe<Category>;
  updateExpense?: Maybe<Expense>;
  updateProfile?: Maybe<User>;
  updateSubcategory?: Maybe<Subcategory>;
};


export type RootMutationTypeCreateCategoryArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypeCreateExpenseArgs = {
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeCreateGroupArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypeCreatePeriodArgs = {
  dailyLimit: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type RootMutationTypeCreateSubcategoryArgs = {
  categoryId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
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


export type RootMutationTypeDeleteSubcategoryArgs = {
  id: Scalars['ID']['input'];
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


export type RootMutationTypeRedeemInviteCodeArgs = {
  code: Scalars['String']['input'];
};


export type RootMutationTypeRegisterUserArgs = {
  email: Scalars['String']['input'];
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


export type RootMutationTypeRevokeInviteCodeArgs = {
  inviteId: Scalars['ID']['input'];
};


export type RootMutationTypeSwitchActiveGroupArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type RootMutationTypeUpdateExpenseArgs = {
  amount?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeUpdateProfileArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdateSubcategoryArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  activeGroup?: Maybe<Group>;
  activePeriod?: Maybe<Period>;
  categories?: Maybe<Array<Maybe<Category>>>;
  expenseHistory?: Maybe<Array<Maybe<ExpenseDay>>>;
  groupInvites?: Maybe<Array<Maybe<GroupInvite>>>;
  groupMembers?: Maybe<Array<Maybe<GroupMember>>>;
  me?: Maybe<User>;
  myGroups?: Maybe<Array<Maybe<Group>>>;
  periodSummary?: Maybe<PeriodSummary>;
  periods?: Maybe<Array<Maybe<Period>>>;
};


export type RootQueryTypeActivePeriodArgs = {
  today?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeExpenseHistoryArgs = {
  periodId: Scalars['ID']['input'];
};


export type RootQueryTypeGroupInvitesArgs = {
  groupId: Scalars['ID']['input'];
};


export type RootQueryTypeGroupMembersArgs = {
  groupId: Scalars['ID']['input'];
};


export type RootQueryTypePeriodSummaryArgs = {
  periodId: Scalars['ID']['input'];
};

export type Subcategory = {
  __typename?: 'Subcategory';
  categoryId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'RootMutationType', login?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null };

export type RegisterUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
}>;


export type RegisterUserMutation = { __typename?: 'RootMutationType', registerUser?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null };

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
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  dailyLimit: Scalars['String']['input'];
}>;


export type CreatePeriodMutation = { __typename?: 'RootMutationType', createPeriod?: { __typename?: 'Period', id?: string | null, status?: string | null } | null };

export type CreateExpenseMutationVariables = Exact<{
  amount: Scalars['String']['input'];
  date: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CreateExpenseMutation = { __typename?: 'RootMutationType', createExpense?: { __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null } | null, createdBy?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null };

export type UpdateExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  amount?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  subcategoryId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpdateExpenseMutation = { __typename?: 'RootMutationType', updateExpense?: { __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null } | null } | null };

export type DeleteExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteExpenseMutation = { __typename?: 'RootMutationType', deleteExpense?: boolean | null };

export type CreateCategoryMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateCategoryMutation = { __typename?: 'RootMutationType', createCategory?: { __typename?: 'Category', id?: string | null, name?: string | null, subcategories?: Array<{ __typename?: 'Subcategory', id?: string | null, name?: string | null } | null> | null } | null };

export type UpdateCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateCategoryMutation = { __typename?: 'RootMutationType', updateCategory?: { __typename?: 'Category', id?: string | null, name?: string | null } | null };

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
}>;


export type ActivePeriodQuery = { __typename?: 'RootQueryType', activePeriod?: { __typename?: 'Period', id?: string | null, startDate?: string | null, endDate?: string | null, dailyLimit?: string | null, status?: string | null, today?: { __typename?: 'BudgetDay', id?: string | null, date?: string | null, dailyLimit?: string | null, carryover?: string | null, availableBalance?: string | null, closedAt?: string | null } | null } | null };

export type ExpenseHistoryQueryVariables = Exact<{
  periodId: Scalars['ID']['input'];
}>;


export type ExpenseHistoryQuery = { __typename?: 'RootQueryType', expenseHistory?: Array<{ __typename?: 'ExpenseDay', date?: string | null, total?: string | null, expenses?: Array<{ __typename?: 'Expense', id?: string | null, amount?: string | null, date?: string | null, note?: string | null, subcategory?: { __typename?: 'Subcategory', id?: string | null, name?: string | null } | null, createdBy?: { __typename?: 'User', id?: string | null, email?: string | null } | null } | null> | null } | null> | null };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'RootQueryType', categories?: Array<{ __typename?: 'Category', id?: string | null, name?: string | null, subcategories?: Array<{ __typename?: 'Subcategory', id?: string | null, name?: string | null } | null> | null } | null> | null };

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


export type MeQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null } | null };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"passwordConfirmation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"passwordConfirmation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const CreatePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dailyLimit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"dailyLimit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dailyLimit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreatePeriodMutation, CreatePeriodMutationVariables>;
export const CreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}},{"kind":"Argument","name":{"kind":"Name","value":"subcategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const UpdateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}},{"kind":"Argument","name":{"kind":"Name","value":"subcategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subcategoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateExpenseMutation, UpdateExpenseMutationVariables>;
export const DeleteExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subcategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const CreateSubcategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSubcategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubcategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"categoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateSubcategoryMutation, CreateSubcategoryMutationVariables>;
export const DeleteSubcategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSubcategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSubcategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSubcategoryMutation, DeleteSubcategoryMutationVariables>;
export const CreateGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
export const RenameGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RenameGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renameGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RenameGroupMutation, RenameGroupMutationVariables>;
export const DeleteGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const SwitchActiveGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwitchActiveGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"switchActiveGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SwitchActiveGroupMutation, SwitchActiveGroupMutationVariables>;
export const LeaveGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LeaveGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<LeaveGroupMutation, LeaveGroupMutationVariables>;
export const RemoveMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const GenerateInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxUses"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expiresInDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxUses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxUses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"maxUses"}},{"kind":"Field","name":{"kind":"Name","value":"usesCount"}}]}}]}}]} as unknown as DocumentNode<GenerateInviteCodeMutation, GenerateInviteCodeMutationVariables>;
export const RevokeInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}}}]}]}}]} as unknown as DocumentNode<RevokeInviteCodeMutation, RevokeInviteCodeMutationVariables>;
export const RedeemInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RedeemInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redeemInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<RedeemInviteCodeMutation, RedeemInviteCodeMutationVariables>;
export const ActivePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActivePeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activePeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"today"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"dailyLimit"}},{"kind":"Field","name":{"kind":"Name","value":"carryover"}},{"kind":"Field","name":{"kind":"Name","value":"availableBalance"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ActivePeriodQuery, ActivePeriodQueryVariables>;
export const ExpenseHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subcategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ExpenseHistoryQuery, ExpenseHistoryQueryVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subcategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const MyGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<MyGroupsQuery, MyGroupsQueryVariables>;
export const ActiveGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveGroup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeGroup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<ActiveGroupQuery, ActiveGroupQueryVariables>;
export const GroupMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GroupMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isOwner"}}]}}]}}]} as unknown as DocumentNode<GroupMembersQuery, GroupMembersQueryVariables>;
export const GroupInvitesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GroupInvites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupInvites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"maxUses"}},{"kind":"Field","name":{"kind":"Name","value":"usesCount"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}}]}}]} as unknown as DocumentNode<GroupInvitesQuery, GroupInvitesQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;