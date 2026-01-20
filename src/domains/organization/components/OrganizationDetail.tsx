"use client";

import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { RefreshCw, ArrowLeft, UserPlus } from "lucide-react";
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

    // Data states
    managers,
    isLoadingManagers,
    pendingInvitation,
    isLoadingInvitation,
    hasSuperAdmin,

    // Other states
    searchQuery,
    setSearchQuery,

    // Handlers
    handleInviteSuperAdmin,
    handleRemoveSuperAdmin,
    confirmRemoveSuperAdmin,
    handleResendInvitation,
  } = useOrganizationDetail({ organizationId: organization.id });

  const type = organization.type?.name
    ? formatText(organization.type.name)
    : "-";

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
        {/* Invite Superadmin Button - Inline with heading */}
        {!isLoadingManagers && !hasSuperAdmin && (
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
        )}
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
              label="Authorization Status"
              value={
                organization.isAuthorized ? "Authorized" : "Not Authorized"
              }
              type="text"
            />
          </Section>
        </div>

        {/* Super Admin Section - Show when there's a pending invitation but no accepted superadmin */}
        {!isLoadingInvitation && !hasSuperAdmin && pendingInvitation && (
          <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
            <Section title="Super Admin">
              <FieldRow
                label="Invited Email"
                value={pendingInvitation.email}
                type="text"
              />
              <FieldRow
                label="Invited Date"
                value={new Date(pendingInvitation.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
                type="text"
              />
              <FieldRow
                label="Expires At"
                value={new Date(pendingInvitation.expiresAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
                type="text"
              />
              <FieldRow
                label="Status"
                value={
                  new Date(pendingInvitation.expiresAt) > new Date()
                    ? "Pending"
                    : "Expired"
                }
                type="text"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResendInvitation}
                  disabled={
                    isResending ||
                    new Date(pendingInvitation.expiresAt) <= new Date()
                  }
                  className="
                    px-4 py-2 rounded-full
                    bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]
                    text-white hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2
                    transition-opacity
                    font-poppins text-sm font-medium
                  "
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
                  />
                  {isResending ? "Resending..." : "Resend Invitation"}
                </button>
              </div>
            </Section>
          </div>
        )}

        {/* Organization Users Table - Only show if there are users */}
        {!isLoadingManagers && managers.length > 0 && (
          <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
            <Section title="Organization Users">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Table */}
              <OrganizationManagersTableWithPagination
                data={managers}
                searchQuery={searchQuery}
                onRemoveSuperAdmin={handleRemoveSuperAdmin}
                isRemoving={isRemoving}
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
