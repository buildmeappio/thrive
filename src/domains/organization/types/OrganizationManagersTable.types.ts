import { OrganizationManagerRow } from "../actions/getOrganizationManagers";

export type OrganizationManagersTableProps = {
  data: OrganizationManagerRow[];
  searchQuery?: string;
  onRemoveSuperAdmin?: (managerId: string) => void;
  isRemoving?: boolean;
};

export type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
};
