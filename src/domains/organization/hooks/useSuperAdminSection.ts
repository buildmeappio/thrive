import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import logger from "@/utils/logger";
import organizationActions from "../actions";

type UseSuperAdminSectionProps = {
  organizationId: string;
  onSuperAdminChange?: (hasSuperAdmin: boolean) => void;
  refreshKey?: number;
};

export const useSuperAdminSection = ({
  organizationId,
  onSuperAdminChange,
  refreshKey = 0,
}: UseSuperAdminSectionProps) => {
  const router = useRouter();
  const [superAdmin, setSuperAdmin] = useState<any>(null);
  const [isLoadingSuperAdmin, setIsLoadingSuperAdmin] = useState(true);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [isResending, setIsResending] = useState(false);

  // Fetch superadmin and pending invitation
  const fetchData = useCallback(async () => {
    setIsLoadingSuperAdmin(true);
    setIsLoadingInvitation(true);
    try {
      // Fetch superadmin
      const superAdminResult =
        await organizationActions.getOrganizationSuperAdmin(organizationId);
      if (superAdminResult.success && superAdminResult.superAdmin) {
        setSuperAdmin(superAdminResult.superAdmin);
        onSuperAdminChange?.(true);
      } else {
        setSuperAdmin(null);
        onSuperAdminChange?.(false);
      }

      // Fetch pending invitation if no superadmin
      if (!superAdminResult.success || !superAdminResult.superAdmin) {
        const invitationsResult = await organizationActions.getInvitations(
          organizationId,
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
      onSuperAdminChange?.(false);
    } finally {
      setIsLoadingSuperAdmin(false);
      setIsLoadingInvitation(false);
    }
  }, [organizationId, onSuperAdminChange]);

  // Fetch data on mount and when refreshKey changes
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Handle resend invitation
  const handleResendInvitation = useCallback(async () => {
    if (!pendingInvitation) return;

    setIsResending(true);
    try {
      const result = await organizationActions.resendInvitation(
        pendingInvitation.id,
      );

      if (result.success) {
        toast.success("Invitation resent successfully!");
        // Refresh invitation data
        const invitationsResult = await organizationActions.getInvitations(
          organizationId,
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
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      logger.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [pendingInvitation, organizationId, router]);

  return {
    superAdmin,
    pendingInvitation,
    isLoadingInvitation,
    isResending,
    handleResendInvitation,
  };
};
