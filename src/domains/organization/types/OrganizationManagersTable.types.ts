import { OrganizationUserRow } from "../actions/getOrganizationUsers";

export type OrganizationManagersTableProps = {
  data: OrganizationUserRow[];
  searchQuery?: string;
  onResendInvitation?: (invitationId: string) => void;
  onRevokeInvitation?: (invitationId: string) => void;
  onActivateUser?: (userId: string) => void;
  onDeactivateUser?: (userId: string) => void;
  isResending?: boolean;
  isRevoking?: boolean;
  isActivating?: boolean;
  isDeactivating?: boolean;
};

export type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: "left" | "center" | "right";
};
