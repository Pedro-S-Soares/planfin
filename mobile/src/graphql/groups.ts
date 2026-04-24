import { gql } from "@apollo/client";

export type Group = {
  id: string;
  name: string;
  ownerId: number;
  insertedAt?: string | null;
};

export type GroupMember = {
  id: number;
  email: string;
  joinedAt: string | null;
  isOwner: boolean;
};

export type GroupInvite = {
  id: string;
  code: string;
  expiresAt: string | null;
  maxUses: number | null;
  usesCount: number;
  insertedAt?: string | null;
};

export const MY_GROUPS = gql`
  query MyGroups {
    myGroups {
      id
      name
      ownerId
      insertedAt
    }
  }
`;

export const ACTIVE_GROUP = gql`
  query ActiveGroup {
    activeGroup {
      id
      name
      ownerId
    }
  }
`;

export const GROUP_MEMBERS = gql`
  query GroupMembers($groupId: ID!) {
    groupMembers(groupId: $groupId) {
      id
      email
      joinedAt
      isOwner
    }
  }
`;

export const GROUP_INVITES = gql`
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

export const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!) {
    createGroup(name: $name) {
      id
      name
      ownerId
    }
  }
`;

export const RENAME_GROUP = gql`
  mutation RenameGroup($id: ID!, $name: String!) {
    renameGroup(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(id: $id)
  }
`;

export const SWITCH_ACTIVE_GROUP = gql`
  mutation SwitchActiveGroup($id: ID!) {
    switchActiveGroup(id: $id) {
      id
      name
    }
  }
`;

export const LEAVE_GROUP = gql`
  mutation LeaveGroup($id: ID!) {
    leaveGroup(id: $id)
  }
`;

export const REMOVE_MEMBER = gql`
  mutation RemoveMember($groupId: ID!, $userId: Int!) {
    removeMember(groupId: $groupId, userId: $userId)
  }
`;

export const GENERATE_INVITE_CODE = gql`
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

export const REVOKE_INVITE_CODE = gql`
  mutation RevokeInviteCode($inviteId: ID!) {
    revokeInviteCode(inviteId: $inviteId)
  }
`;

export const REDEEM_INVITE_CODE = gql`
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
