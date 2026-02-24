'use client';

import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { DashboardShell } from '@/layouts/dashboard';
import getOrganizationById from '../server/handlers/getOrganizationById';
import { capitalizeWords, formatText } from '@/utils/text';
import Link from 'next/link';
import InviteSuperAdminModal from './InviteSuperAdminModal';
import OrganizationManagersTableWithPagination from './OrganizationManagersTable';
import { useOrganizationDetail } from '../hooks/useOrganizationDetail';

type OrganizationDetailProps = {
  organization: Awaited<ReturnType<typeof getOrganizationById>>;
};

const OrganizationDetail = ({ organization }: OrganizationDetailProps) => {
  const {
    // Modal states
    isInviteModalOpen,
    setIsInviteModalOpen,
    isRemoveModalOpen,
    setIsRemoveModalOpen,

    // Loading states
    isInviting,
    isRemoving,
    isResending,
    isRevoking,
    isActivating,
    isDeactivating,

    // Data states
    users,
    isLoadingUsers,

    // Other states
    searchQuery,
    setSearchQuery,

    // Handlers
    handleInviteSuperAdmin,
    confirmRemoveSuperAdmin,
    handleResendInvitation,
    handleRevokeInvitation,
    handleActivateUser,
    handleDeactivateUser,
  } = useOrganizationDetail({ organizationId: organization.id });

  const type = organization.type ? formatText(organization.type) : '-';

  return (
    <DashboardShell>
      {/* Back Button and Organization Name Heading */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/organization" className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            {capitalizeWords(organization.name)}
          </h1>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        {/* Organization Details Card */}
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
          <Section title="Organization Details">
            <FieldRow
              label="Organization Name"
              value={capitalizeWords(organization.name)}
              type="text"
            />
            <FieldRow label="Organization Type" value={type} type="text" />
            <FieldRow
              label="Address Lookup"
              value={organization.address?.address || '-'}
              type="text"
            />
            <FieldRow
              label="Organization Website"
              value={organization.website || '-'}
              type="text"
            />
            <FieldRow
              label="Status"
              value={organization.status ? formatText(organization.status) : '-'}
              type="text"
            />
          </Section>
        </div>

        {/* Super Admins Table */}
        {!isLoadingUsers && (
          <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
            <Section
              title="Super Admins"
              actionSlot={
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  disabled={isInviting}
                  className="font-poppins flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  Invite Superadmin
                </button>
              }
            >
              {/* Search Bar */}
              <div className="mb-4">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#01F4C8" />
                      <stop offset="100%" stopColor="#00A8FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="url(#searchGradient)"
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
                    placeholder="Search superadmins..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
                  />
                </div>
              </div>

              {/* Table */}
              <OrganizationManagersTableWithPagination
                data={users}
                searchQuery={searchQuery}
                onResendInvitation={handleResendInvitation}
                onRevokeInvitation={handleRevokeInvitation}
                onActivateUser={handleActivateUser}
                onDeactivateUser={handleDeactivateUser}
                isResending={isResending}
                isRevoking={isRevoking}
                isActivating={isActivating}
                isDeactivating={isDeactivating}
              />
            </Section>
          </div>
        )}
      </div>

      {/* Invite Superadmin Modal */}
      <InviteSuperAdminModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteSuperAdmin}
        isLoading={isInviting}
      />

      {/* Remove Superadmin Confirmation Modal */}
      {isRemoveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setIsRemoveModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-[500px] rounded-2xl bg-white p-5 shadow-[0_4px_134.6px_0_#00000030] sm:rounded-[30px] sm:px-[45px] sm:py-[40px]"
            onMouseDown={e => e.stopPropagation()}
          >
            <h2 className="font-degular mb-4 text-xl font-[600] leading-[1.2] text-[#D32F2F] sm:text-[24px]">
              Remove Superadmin
            </h2>
            <p className="font-poppins mb-6 text-sm text-[#1A1A1A] sm:text-base">
              Are you sure you want to remove the superadmin from this organization? This will set
              the organization to unauthorized status.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRemoveModalOpen(false)}
                disabled={isRemoving}
                className="font-poppins h-10 rounded-full border border-[#E5E5E5] bg-white px-8 text-[14px] font-[500] text-[#1A1A1A] transition-opacity hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveSuperAdmin}
                disabled={isRemoving}
                className="font-poppins h-10 rounded-full bg-red-700 px-8 text-[14px] font-[500] text-white transition-opacity hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default OrganizationDetail;
