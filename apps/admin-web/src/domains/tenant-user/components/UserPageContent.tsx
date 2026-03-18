'use client';

import { useState, useCallback } from 'react';
import UserTable, { useUserTable } from '@/domains/user/components/UserTableWithPagination';
import EditUserModal from '@/domains/user/components/EditUserModal';
import type { UserTableRow } from '@/domains/user/types/UserData';
import { UserData } from '../types/UserData';
import Pagination from '@/components/Pagination';
import { RoleType } from '@/domains/auth/constants/roles';

type UserPageContentProps = {
  users: UserData[];
  /** Current logged-in user id – hides edit/delete for this user and disables email when editing others */
  currentUserId?: string | null;
};

const UserPageContent = ({ users, currentUserId }: UserPageContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserTableRow | null>(null);

  // Convert UserData to UserTableRow format and keep in state so we can update after edit
  const [userTableRows, setUserTableRows] = useState<UserTableRow[]>(() =>
    users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      role: user.role as RoleType,
      isActive: user.isActive,
      mustResetPassword: user.mustResetPassword,
      createdAt: user.createdAt,
    }))
  );

  const handleToggleStatus = async (id: string, role: RoleType, enabled: boolean) => {
    // TODO: Implement status toggle action
    setTogglingUserId(id);
    // Simulate API call
    setTimeout(() => {
      setTogglingUserId(null);
    }, 1000);
  };

  const handleEditUser = useCallback((user: UserTableRow) => {
    setEditingUser(user);
  }, []);

  const handleUserUpdated = useCallback((updatedUser: UserTableRow) => {
    setUserTableRows(prev => prev.map(row => (row.id === updatedUser.id ? updatedUser : row)));
    setEditingUser(null);
  }, []);

  const handleDeleteUser = (user: UserTableRow) => {
    // TODO: Implement delete user action
    console.log('Delete user:', user);
  };

  const { table, columns } = useUserTable({
    data: userTableRows,
    searchQuery,
    togglingUserId,
    currentUserId,
    onToggleStatus: handleToggleStatus,
    onEditUser: handleEditUser,
    onDeleteUser: handleDeleteUser,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Users
        </h1>
      </div>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="tenantUserSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search Bar - same width as other pages (chaperone, etc.) */}
        <div className="w-full flex-1 sm:max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="url(#tenantUserSearchGradient)"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
          <UserTable table={table} columns={columns} />
        </div>

        {/* Pagination */}
        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      </div>

      <EditUserModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleUserUpdated}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default UserPageContent;
