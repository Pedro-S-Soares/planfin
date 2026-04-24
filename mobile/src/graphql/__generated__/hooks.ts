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


export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
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
    mutation RegisterUser($email: String!, $password: String!, $passwordConfirmation: String!) {
  registerUser(
    email: $email
    password: $password
    passwordConfirmation: $passwordConfirmation
  ) {
    token
    user {
      id
      email
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
    mutation CreatePeriod($startDate: String!, $endDate: String!, $dailyLimit: String!) {
  createPeriod(startDate: $startDate, endDate: $endDate, dailyLimit: $dailyLimit) {
    id
    status
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
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      dailyLimit: // value for 'dailyLimit'
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
export const CreateExpenseDocument = gql`
    mutation CreateExpense($amount: String!, $date: String!, $note: String, $subcategoryId: ID) {
  createExpense(
    amount: $amount
    date: $date
    note: $note
    subcategoryId: $subcategoryId
  ) {
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
 *      subcategoryId: // value for 'subcategoryId'
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
    mutation UpdateExpense($id: ID!, $amount: String, $date: String, $note: String, $subcategoryId: ID) {
  updateExpense(
    id: $id
    amount: $amount
    date: $date
    note: $note
    subcategoryId: $subcategoryId
  ) {
    id
    amount
    date
    note
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
 *      subcategoryId: // value for 'subcategoryId'
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
    mutation CreateCategory($name: String!) {
  createCategory(name: $name) {
    id
    name
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
    mutation UpdateCategory($id: ID!, $name: String!) {
  updateCategory(id: $id, name: $name) {
    id
    name
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
    query ActivePeriod($today: String!) {
  activePeriod(today: $today) {
    id
    startDate
    endDate
    dailyLimit
    status
    today {
      id
      date
      dailyLimit
      carryover
      availableBalance
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
    query Categories {
  categories {
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