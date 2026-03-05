'use client';

import { useState } from 'react';
import UserTable, { useUserTable } from '@/domains/user/components/UserTableWithPagination';
import { UserData } from '../types/UserData';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';
import Pagination from '@/components/Pagination';
import { RoleType } from '@/domains/auth/constants/roles';

type UserPageContentProps = {
  users: UserData[];
};

const UserPageContent = ({ users }: UserPageContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Convert UserData to UserTableRow format
  const userTableRows = users.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    gender: user.gender,
    role: user.role as RoleType,
    isActive: user.isActive,
    mustResetPassword: user.mustResetPassword,
    createdAt: user.createdAt,
  }));

  const handleToggleStatus = async (id: string, role: RoleType, enabled: boolean) => {
    // TODO: Implement status toggle action
    setTogglingUserId(id);
    // Simulate API call
    setTimeout(() => {
      setTogglingUserId(null);
    }, 1000);
  };

  const handleEditUser = (user: (typeof userTableRows)[0]) => {
    // TODO: Implement edit user action
    console.log('Edit user:', user);
  };

  const handleDeleteUser = (user: (typeof userTableRows)[0]) => {
    // TODO: Implement delete user action
    console.log('Delete user:', user);
  };

  const { table, columns } = useUserTable({
    data: userTableRows,
    searchQuery,
    togglingUserId,
    onToggleStatus: handleToggleStatus,
    onEditUser: handleEditUser,
    onDeleteUser: handleDeleteUser,
  });

  return (
    <TenantDashboardShell>
      <div className="dashboard-zoom-mobile mb-4 sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Users
        </h1>
      </div>

      <div className="dashboard-zoom-mobile mb-4 flex flex-col gap-3 sm:gap-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="rounded-lg border border-[#E9EDEE] px-3 py-2 text-sm"
        />

        {/* Table */}
        <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
          <UserTable table={table} columns={columns} />
        </div>

        {/* Pagination */}
        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      </div>
    </TenantDashboardShell>
  );
};

export default UserPageContent;
