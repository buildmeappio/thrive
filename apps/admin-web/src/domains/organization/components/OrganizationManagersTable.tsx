'use client';

import { OrganizationManagersTableProps } from '../types';
import { useOrganizationManagersTable } from '../hooks/useOrganizationManagersTable';
import OrganizationManagersTableContent from './OrganizationManagersTableContent';

export default function OrganizationManagersTableWithPagination({
  data,
  searchQuery = '',
  onResendInvitation,
  onRevokeInvitation,
  onActivateUser,
  onDeactivateUser,
  isResending = false,
  isRevoking = false,
  isActivating = false,
  isDeactivating = false,
}: OrganizationManagersTableProps) {
  const { table, columns } = useOrganizationManagersTable({
    data,
    searchQuery,
    onResendInvitation,
    onRevokeInvitation,
    onActivateUser,
    onDeactivateUser,
    isResending,
    isRevoking,
    isActivating,
    isDeactivating,
  });

  return (
    <div className="w-full">
      <OrganizationManagersTableContent table={table} columns={columns} />
    </div>
  );
}
