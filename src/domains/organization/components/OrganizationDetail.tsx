"use client";

import logger from "@/utils/logger";
import React, { useEffect, useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { DashboardShell } from "@/layouts/dashboard";
import getOrganizationById from "../server/handlers/getOrganizationById";
import { ArrowLeft, Trash2, UserPlus, Mail, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import organizationActions from "../actions";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";
import Link from "next/link";
import InviteSuperAdminModal from "./InviteSuperAdminModal";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

type OrganizationDetailProps = {
  organization: Awaited<ReturnType<typeof getOrganizationById>>;
};

const OrganizationDetail = ({ organization }: OrganizationDetailProps) => {
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [superAdmin, setSuperAdmin] = useState<any>(null);
  const [isLoadingSuperAdmin, setIsLoadingSuperAdmin] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [isResending, setIsResending] = useState(false);

  const type = organization.type?.name
    ? formatText(organization.type.name)
    : "-";

  // Fetch superadmin and pending invitation on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSuperAdmin(true);
      setIsLoadingInvitation(true);
      try {
        // Fetch superadmin
        const superAdminResult =
          await organizationActions.getOrganizationSuperAdmin(organization.id);
        if (superAdminResult.success && superAdminResult.superAdmin) {
          setSuperAdmin(superAdminResult.superAdmin);
        } else {
          setSuperAdmin(null);
        }

        // Fetch pending invitation if no superadmin
        if (!superAdminResult.success || !superAdminResult.superAdmin) {
          const invitationsResult = await organizationActions.getInvitations(
            organization.id,
          );
          if (invitationsResult.success && invitationsResult.invitations) {
            // Find the most recent pending invitation
            const pending = invitationsResult.invitations.find(
              (inv: any) =>
                !inv.acceptedAt &&
                !inv.deletedAt &&
                new Date(inv.expiresAt) > new Date(),
            );
            setPendingInvitation(pending || null);
          }
        } else {
          setPendingInvitation(null);
        }
      } catch (error) {
        logger.error("Failed to fetch data:", error);
        setSuperAdmin(null);
        setPendingInvitation(null);
      } finally {
        setIsLoadingSuperAdmin(false);
        setIsLoadingInvitation(false);
      }
    };

    fetchData();
  }, [organization.id]);

  const handleInviteSuperAdmin = async (email: string) => {
    setIsInviting(true);
    try {
      // Check if there's a previous pending invitation for a different email
      const invitationsBefore = await organizationActions.getInvitations(
        organization.id,
      );
      const hadPreviousInvitation =
        invitationsBefore.success &&
        invitationsBefore.invitations?.some(
          (inv: any) =>
            !inv.acceptedAt &&
            !inv.deletedAt &&
            inv.email.toLowerCase().trim() !== email.toLowerCase().trim() &&
            new Date(inv.expiresAt) > new Date(),
        );

      // Check if there's already a pending invitation for the same email
      const hasSameEmailInvitation =
        invitationsBefore.success &&
        invitationsBefore.invitations?.some(
          (inv: any) =>
            !inv.acceptedAt &&
            !inv.deletedAt &&
            inv.email.toLowerCase().trim() === email.toLowerCase().trim() &&
            new Date(inv.expiresAt) > new Date(),
        );

      const result = await organizationActions.inviteSuperAdmin(
        organization.id,
        email,
      );

      if (result.success) {
        if (hasSameEmailInvitation) {
          toast.success("Invitation resent successfully!");
        } else if (hadPreviousInvitation) {
          toast.success(
            "Previous invitation cancelled. New invitation sent successfully!",
          );
        } else {
          toast.success("Superadmin invitation sent successfully!");
        }

        setIsInviteModalOpen(false);
        // Refresh invitation data
        const invitationsResult = await organizationActions.getInvitations(
          organization.id,
        );
        if (invitationsResult.success && invitationsResult.invitations) {
          const pending = invitationsResult.invitations.find(
            (inv: any) =>
              !inv.acceptedAt &&
              !inv.deletedAt &&
              new Date(inv.expiresAt) > new Date(),
          );
          setPendingInvitation(pending || null);
        }
        router.refresh();
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      logger.error("Failed to invite superadmin:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveSuperAdmin = async () => {
    if (!superAdmin) return;

    setIsRemoving(true);
    try {
      const result = await organizationActions.removeSuperAdmin(
        organization.id,
        superAdmin.id,
      );

      if (result.success) {
        toast.success("Superadmin removed successfully!");
        setSuperAdmin(null);
        setIsRemoveModalOpen(false);
        // Refresh invitation data after removal
        const invitationsResult = await organizationActions.getInvitations(
          organization.id,
        );
        if (invitationsResult.success && invitationsResult.invitations) {
          const pending = invitationsResult.invitations.find(
            (inv: any) =>
              !inv.acceptedAt &&
              !inv.deletedAt &&
              new Date(inv.expiresAt) > new Date(),
          );
          setPendingInvitation(pending || null);
        }
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove superadmin");
      }
    } catch (error) {
      logger.error("Failed to remove superadmin:", error);
      toast.error("Failed to remove superadmin. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleResendInvitation = async () => {
    if (!pendingInvitation) return;

    setIsResending(true);
    try {
      const result = await organizationActions.resendInvitation(
        pendingInvitation.id,
      );

      if (result.success) {
        toast.success("Invitation resent successfully!");
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      logger.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <DashboardShell>
      {/* Back Button and Organization Name Heading */}
      <div className="mb-6 flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Link href="/organization" className="flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </Link>
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          {capitalizeWords(organization.name)}
        </h1>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full">
            {/* Left Column - Organization Details */}
            <div className="flex flex-col gap-6 lg:gap-10">
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

            {/* Right Column - Superadmin Details or Pending Invitation */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Superadmin Details Section - Only show when superadmin exists */}
              {superAdmin && (
                <Section title="Superadmin Details">
                  <FieldRow
                    label="Full Name"
                    value={
                      superAdmin.account?.user
                        ? capitalizeWords(
                            `${superAdmin.account.user.firstName ?? ""} ${superAdmin.account.user.lastName ?? ""}`.trim() ||
                              "-",
                          )
                        : "-"
                    }
                    type="text"
                  />
                  <FieldRow
                    label="Email Address"
                    value={superAdmin.account?.user?.email || "-"}
                    type="text"
                  />
                  <FieldRow
                    label="Phone Number"
                    value={formatPhoneNumber(superAdmin.account?.user?.phone)}
                    type="text"
                  />
                  <FieldRow
                    label="Job Title"
                    value={superAdmin.jobTitle || "-"}
                    type="text"
                  />
                  <FieldRow
                    label="Department"
                    value={
                      superAdmin.department?.name
                        ? formatText(superAdmin.department.name)
                        : "-"
                    }
                    type="text"
                  />
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      SUPER_ADMIN
                    </span>
                  </div>
                </Section>
              )}

              {/* Pending Invitation Section - Only show when no superadmin */}
              {!superAdmin && (
                <Section title="Pending Invitation">
                  {isLoadingInvitation ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : pendingInvitation ? (
                    <>
                      <FieldRow
                        label="Invited Email"
                        value={pendingInvitation.email}
                        type="text"
                      />
                      <FieldRow
                        label="Invited Date"
                        value={new Date(
                          pendingInvitation.createdAt,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        type="text"
                      />
                      <FieldRow
                        label="Expires At"
                        value={new Date(
                          pendingInvitation.expiresAt,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
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
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No pending invitation
                    </div>
                  )}
                </Section>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end">
            {superAdmin ? (
              <button
                onClick={() => setIsRemoveModalOpen(true)}
                disabled={isRemoving}
                className="
                  px-4 py-3 rounded-full
                  text-white bg-red-700 hover:bg-red-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                  transition-opacity
                  font-poppins text-sm sm:text-base font-medium
                "
              >
                <Trash2 className="w-4 h-4" />
                {isRemoving ? "Removing..." : "Remove Superadmin"}
              </button>
            ) : (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                disabled={isInviting}
                className="
                  px-4 py-3 rounded-full
                  bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]
                  text-white hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                  transition-opacity
                  font-poppins text-sm sm:text-base font-medium
                "
              >
                <UserPlus className="w-4 h-4" />
                Invite Superadmin
              </button>
            )}
          </div>
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
                  onClick={handleRemoveSuperAdmin}
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
      </div>
    </DashboardShell>
  );
};

export default OrganizationDetail;
