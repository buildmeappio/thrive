'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UserTable, { useUserTable } from '@/domains/user/components/UserTableWithPagination';
import type { UserTableRow } from '@/domains/user/types/UserData';
import Pagination from '@/components/Pagination';
import { toggleUserStatus, listInvitations } from '@/domains/user/actions';
import { toast } from 'sonner';
import CreateUserModal from './CreateUserModal';
import InvitationsTable, { useInvitationsTable } from './InvitationsTable';
import type { InvitationRow } from '../actions/listInvitations';
import { cn } from '@/lib/utils';

type UsersPageContentProps = {
  initialUsers: UserTableRow[];
  initialInvitations: InvitationRow[];
};

type TabType = 'users' | 'invitations';

const UsersPageContent = ({ initialUsers, initialInvitations }: UsersPageContentProps) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<UserTableRow[]>(initialUsers);
  const [invitations, setInvitations] = useState<InvitationRow[]>(initialInvitations);
  const [searchQuery, setSearchQuery] = useState('');
  const [, startToggle] = useTransition();
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleStatus = (userId: string, enabled: boolean) => {
    const previousUsers = users;

    setUsers(prev =>
      prev.map(user => (user.id === userId ? { ...user, isActive: enabled } : user))
    );
    setTogglingUserId(userId);
    startToggle(async () => {
      const result = await toggleUserStatus({
        userId,
        isActive: enabled,
      });
      if (!result.success) {
        setUsers(previousUsers);
        toast.error(result.error ?? 'Failed to update user status.');
      } else {
        toast.success(
          enabled ? 'User can now access the dashboard.' : 'User login has been disabled.'
        );
      }
      setTogglingUserId(null);
    });
  };

  const { table, columns } = useUserTable({
    data: users,
    searchQuery,
    togglingUserId,
    currentUserId: session?.user?.id,
    onToggleStatus: handleToggleStatus,
  });

  const { table: invitationsTable, columns: invitationsColumns } = useInvitationsTable({
    data: invitations,
    searchQuery,
  });

  const refreshInvitations = async () => {
    try {
      const data = await listInvitations();
      setInvitations(data);
    } catch (error) {
      toast.error('Failed to refresh invitations');
    }
  };

  useEffect(() => {
    if (activeTab === 'invitations') {
      refreshInvitations();
    }
  }, [activeTab]);

  return (
    <>
      {/* Users Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Users
        </h1>
        {activeTab === 'users' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-[#000093] px-2 py-1 text-white transition-opacity hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2 lg:gap-3 lg:px-6 lg:py-3"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs font-medium sm:text-sm lg:text-base">Create User</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="dashboard-zoom-mobile mb-4 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'users'
              ? 'border-[#000093] text-[#000093]'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          )}
        >
          Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invitations')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'invitations'
              ? 'border-[#000093] text-[#000093]'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          )}
        >
          Invitations
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
                placeholder={activeTab === 'users' ? 'Search by users' : 'Search invitations'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
              <UserTable table={table} columns={columns} />
            </div>

            <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
              <Pagination table={table} />
            </div>
          </>
        ) : (
          <>
            <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
              <InvitationsTable table={invitationsTable} columns={invitationsColumns} />
            </div>

            <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
              <Pagination table={invitationsTable} />
            </div>
          </>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvitationSent={() => {
          refreshInvitations();
        }}
      />
    </>
  );
};

export default UsersPageContent;
