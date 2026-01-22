"use client";

import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { ArrowLeft, UserPlus } from "lucide-react";
import { DashboardShell } from "@/layouts/dashboard";
import getOrganizationById from "../server/handlers/getOrganizationById";
import { capitalizeWords, formatText } from "@/utils/text";
import Link from "next/link";
import InviteSuperAdminModal from "./InviteSuperAdminModal";
import OrganizationManagersTableWithPagination from "./OrganizationManagersTable";
import { useOrganizationDetail } from "../hooks/useOrganizationDetail";

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

  const type = organization.type ? formatText(organization.type) : "-";

  return (
    <DashboardShell>
      {/* Back Button and Organization Name Heading */}
      <div className="mb-6 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link href="/organization" className="flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </Link>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
            {capitalizeWords(organization.name)}
          </h1>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        {/* Organization Details Card */}
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          <Section title="Organization Details">
            <FieldRow
              label="Organization Name"
              value={capitalizeWords(organization.name)}
              type="text"
            />
            <FieldRow label="Organization Type" value={type} type="text" />
            <FieldRow
              label="Address Lookup"
              value={organization.address?.address || "-"}
              type="text"
            />
            <FieldRow
              label="Organization Website"
              value={organization.website || "-"}
              type="text"
            />
            <FieldRow
              label="Status"
              value={
                organization.status ? formatText(organization.status) : "-"
              }
              type="text"
            />
          </Section>
        </div>

        {/* Super Admins Table */}
        {!isLoadingUsers && (
          <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
            <Section
              title="Super Admins"
              actionSlot={
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  disabled={isInviting}
                  className="
                    px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                    bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]
                    text-white hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-1.5 sm:gap-2
                    transition-opacity
                    font-poppins text-xs sm:text-sm font-medium
                    flex-shrink-0
                  "
                >
                  <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Invite Superadmin
                </button>
              }
            >
              {/* Search Bar */}
              <div className="mb-4">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient
                      id="searchGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#01F4C8" />
                      <stop offset="100%" stopColor="#00A8FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
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
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsRemoveModalOpen(false);
          }}
        >
          <div
            className="
                relative w-full max-w-[500px]
                rounded-2xl sm:rounded-[30px]
                bg-white
                p-5 sm:px-[45px] sm:py-[40px]
                shadow-[0_4px_134.6px_0_#00000030]
              "
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 className="font-[600] text-xl sm:text-[24px] leading-[1.2] text-[#D32F2F] font-degular mb-4">
              Remove Superadmin
            </h2>
            <p className="font-poppins text-sm sm:text-base text-[#1A1A1A] mb-6">
              Are you sure you want to remove the superadmin from this
              organization? This will set the organization to unauthorized
              status.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsRemoveModalOpen(false)}
                disabled={isRemoving}
                className="
                    h-10 sm:h-[46px]
                    rounded-full
                    border border-[#E5E5E5] bg-white
                    px-8 sm:px-10 text-[#1A1A1A]
                    transition-opacity
                    disabled:cursor-not-allowed disabled:opacity-50
                    hover:bg-[#F6F6F6]
                    font-poppins text-[14px] sm:text-[16px] font-[500]
                  "
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveSuperAdmin}
                disabled={isRemoving}
                className="
                    h-10 sm:h-[46px]
                    rounded-full
                    bg-red-700 hover:bg-red-800
                    px-8 sm:px-10 text-white
                    transition-opacity
                    disabled:cursor-not-allowed disabled:opacity-50
                    font-poppins text-[14px] sm:text-[16px] font-[500]
                  "
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default OrganizationDetail;
