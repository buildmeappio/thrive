import { useMemo, useState, useEffect } from 'react';
import { matchesSearch } from '@/utils/search';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { OrganizationUserRow } from '../actions/getOrganizationUsers';
import { createColumns } from '../components/OrganizationManagersTableColumns';

type UseOrganizationManagersTableProps = {
  data: OrganizationUserRow[];
  searchQuery: string;
  statusFilter?: string;
  onResendInvitation?: (invitationId: string) => void;
  onRevokeInvitation?: (invitationId: string) => void;
  onActivateUser?: (userId: string) => void;
  onDeactivateUser?: (userId: string) => void;
  onModifyAccess?: (userId: string) => void;
  isResending?: boolean;
  isRevoking?: boolean;
  isActivating?: boolean;
  isDeactivating?: boolean;
};

export const useOrganizationManagersTable = ({
  data,
  searchQuery,
  statusFilter = 'all',
  onResendInvitation,
  onRevokeInvitation,
  onActivateUser,
  onDeactivateUser,
  onModifyAccess,
  isResending,
  isRevoking,
  isActivating,
  isDeactivating,
}: UseOrganizationManagersTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(d => {
        if (statusFilter === 'invited') {
          return d.status === 'invited';
        }
        if (statusFilter === 'expired') {
          return d.status === 'invited' && d.expiresAt && new Date(d.expiresAt) < new Date();
        }
        if (statusFilter === 'active') {
          return d.status === 'accepted' && d.accountStatus === 'ACTIVE';
        }
        if (statusFilter === 'inactive') {
          return d.status === 'accepted' && d.accountStatus === 'INACTIVE';
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(d =>
        [d.firstName || '', d.lastName || '', d.email || '', d.phone || '', d.role || '']
          .filter(Boolean)
          .some(v => matchesSearch(searchQuery, String(v)))
      );
    }

    return result;
  }, [data, searchQuery, statusFilter]);

  const columns = useMemo<ColumnDef<OrganizationUserRow, unknown>[]>(
    () =>
      createColumns(
        onResendInvitation,
        onRevokeInvitation,
        onActivateUser,
        onDeactivateUser,
        onModifyAccess,
        isResending,
        isRevoking,
        isActivating,
        isDeactivating
      ),
    [
      onResendInvitation,
      onRevokeInvitation,
      onActivateUser,
      onDeactivateUser,
      onModifyAccess,
      isResending,
      isRevoking,
      isActivating,
      isDeactivating,
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return {
    table,
    columns,
  };
};
