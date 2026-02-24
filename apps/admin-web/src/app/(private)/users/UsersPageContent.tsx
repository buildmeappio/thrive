'use client';

import { useState, useTransition, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { DashboardShell } from '@/layouts/dashboard';
import { toast } from 'sonner';
import AddUserModal from '@/domains/user/components/AddUserModal';
import { useUserTable } from '@/domains/user/components/UserTableWithPagination';
import EditUserModal from '@/domains/user/components/EditUserModal';
import DeleteUserModal from '@/domains/user/components/DeleteUserModal';
import type { UserTableRow } from '@/domains/user/types/UserData';
import { toggleUserStatus, deleteUser as deleteUserAction } from '@/domains/user/actions';
import Pagination from '@/components/Pagination';
import UserTable from '@/domains/user/components/UserTableWithPagination';
import { RoleType } from '@/domains/auth/constants/roles';

type UsersPageContentProps = {
  initialUsers: UserTableRow[];
};

const UsersPageContent = ({ initialUsers }: UsersPageContentProps) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserTableRow[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startToggle] = useTransition();
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserTableRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserTableRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = (userId: string, role: RoleType, enabled: boolean) => {
    const previousUsers = users;
    const isDisablingSelf = session?.user?.id === userId && !enabled;

    setUsers(prev =>
      prev.map(user => (user.id === userId ? { ...user, isActive: enabled } : user))
    );
    setTogglingUserId(userId);
    startToggle(async () => {
      console.log(userId, session.user.roleName);
      const result = await toggleUserStatus({
        userId,
        role,
        isActive: enabled,
      });
      if (!result.success) {
        setUsers(previousUsers);
        toast.error(result.error ?? 'Failed to update user status.');
      } else {
        toast.success(
          enabled ? 'User can now access the dashboard.' : 'User login has been disabled.'
        );

        // If user disabled themselves, log them out immediately
        if (isDisablingSelf) {
          toast.info('You have been logged out because your account was disabled.');
          setTimeout(() => {
            signOut({ callbackUrl: '/admin/login', redirect: true });
          }, 1000);
        }
      }
      setTogglingUserId(null);
    });
  };

  const handleUserCreated = (user: UserTableRow) => {
    setUsers(prev => [user, ...prev]);
  };

  const handleEditUser = useCallback((user: UserTableRow) => {
    setEditingUser(user);
  }, []);

  const handleDeleteRequest = useCallback((user: UserTableRow) => {
    setDeletingUser(user);
  }, []);

  const handleUserUpdated = (updatedUser: UserTableRow) => {
    setUsers(prev => prev.map(user => (user.id === updatedUser.id ? updatedUser : user)));
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsDeleting(true);
      const result = await deleteUserAction({ id: deletingUser.id });
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }
      setUsers(prev => prev.filter(user => user.id !== deletingUser.id));
      toast.success('User deleted successfully.');
      setDeletingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const { table, columns } = useUserTable({
    data: users,
    searchQuery,
    togglingUserId,
    currentUserId: session?.user?.id,
    onToggleStatus: handleToggleStatus,
    onEditUser: handleEditUser,
    onDeleteUser: handleDeleteRequest,
  });

  return (
    <DashboardShell>
      {/* Users Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Users
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 py-1 text-white transition-opacity hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2 lg:gap-3 lg:px-6 lg:py-3"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium sm:text-sm lg:text-base">Add User</span>
        </button>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="userSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="dashboard-zoom-mobile mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search Bar */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="w-full flex-1 sm:max-w-md">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="url(#userSearchGradient)"
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
                placeholder="Search by users"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
          <UserTable table={table} columns={columns} />
        </div>

        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
      <EditUserModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={updated => {
          handleUserUpdated(updated);
          setEditingUser(null);
        }}
      />
      <DeleteUserModal
        isOpen={Boolean(deletingUser)}
        userName={deletingUser ? `${deletingUser.firstName} ${deletingUser.lastName}` : undefined}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeletingUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </DashboardShell>
  );
};

export default UsersPageContent;
