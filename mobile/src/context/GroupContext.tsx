import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { apolloClient } from "../lib/apollo";
import {
  ACTIVE_GROUP,
  MY_GROUPS,
  SWITCH_ACTIVE_GROUP,
  CREATE_GROUP,
  REDEEM_INVITE_CODE,
  LEAVE_GROUP,
  type Group,
} from "../graphql/groups";

type GroupContextValue = {
  activeGroup: Group | null;
  groups: Group[];
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  switchGroup: (id: string) => Promise<Group | null>;
  createGroup: (name: string) => Promise<Group | null>;
  redeemCode: (code: string) => Promise<Group | null>;
  leaveGroup: (id: string) => Promise<boolean>;
};

const GroupContext = createContext<GroupContextValue | null>(null);

type ActiveGroupData = { activeGroup: Group | null };
type MyGroupsData = { myGroups: Group[] };

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const activeQuery = useQuery<ActiveGroupData>(ACTIVE_GROUP, {
    fetchPolicy: "network-only",
  });

  const groupsQuery = useQuery<MyGroupsData>(MY_GROUPS, {
    fetchPolicy: "network-only",
  });

  const [switchMutation] = useMutation<
    { switchActiveGroup: Group },
    { id: string }
  >(SWITCH_ACTIVE_GROUP);

  const [createMutation] = useMutation<
    { createGroup: Group },
    { name: string }
  >(CREATE_GROUP);

  const [redeemMutation] = useMutation<
    { redeemInviteCode: { group: Group; invite: { id: string; code: string } } },
    { code: string }
  >(REDEEM_INVITE_CODE);

  const [leaveMutation] = useMutation<{ leaveGroup: boolean }, { id: string }>(
    LEAVE_GROUP,
  );

  const refetch = useCallback(async () => {
    await Promise.all([activeQuery.refetch(), groupsQuery.refetch()]);
  }, [activeQuery, groupsQuery]);

  const invalidateAfterSwitch = useCallback(async () => {
    // Drop any cached data scoped to the previous group (periods, expenses,
    // categories). resetStore re-runs all active queries with the new group.
    await apolloClient.resetStore();
  }, []);

  const switchGroup = useCallback(
    async (id: string) => {
      const { data } = await switchMutation({ variables: { id } });
      const group = data?.switchActiveGroup ?? null;
      await invalidateAfterSwitch();
      return group;
    },
    [switchMutation, invalidateAfterSwitch],
  );

  const createGroup = useCallback(
    async (name: string) => {
      const { data } = await createMutation({ variables: { name } });
      const group = data?.createGroup ?? null;
      await invalidateAfterSwitch();
      return group;
    },
    [createMutation, invalidateAfterSwitch],
  );

  const redeemCode = useCallback(
    async (code: string) => {
      const { data } = await redeemMutation({ variables: { code } });
      const group = data?.redeemInviteCode?.group ?? null;
      await invalidateAfterSwitch();
      return group;
    },
    [redeemMutation, invalidateAfterSwitch],
  );

  const leaveGroup = useCallback(
    async (id: string) => {
      const { data } = await leaveMutation({ variables: { id } });
      const success = !!data?.leaveGroup;
      if (success) {
        await invalidateAfterSwitch();
      }
      return success;
    },
    [leaveMutation, invalidateAfterSwitch],
  );

  const value = useMemo<GroupContextValue>(
    () => ({
      activeGroup: activeQuery.data?.activeGroup ?? null,
      groups: groupsQuery.data?.myGroups ?? [],
      isLoading: activeQuery.loading || groupsQuery.loading,
      refetch,
      switchGroup,
      createGroup,
      redeemCode,
      leaveGroup,
    }),
    [
      activeQuery.data,
      activeQuery.loading,
      groupsQuery.data,
      groupsQuery.loading,
      refetch,
      switchGroup,
      createGroup,
      redeemCode,
      leaveGroup,
    ],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup(): GroupContextValue {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroup must be used within GroupProvider");
  return ctx;
}
