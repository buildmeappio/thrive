import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import logger from "@/utils/logger";
import organizationActions from "../actions";
import { OrganizationManagerRow } from "../actions/getOrganizationManagers";

type UseOrganizationDetailProps = {
  organizationId: string;
};

export const useOrganizationDetail = ({ organizationId }: UseOrganizationDetailProps) => {
  const router = useRouter();
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  
  // Loading states
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // Data states
  const [managers, setManagers] = useState<OrganizationManagerRow[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  
  // Other states
  const [removingManagerId, setRemovingManagerId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if there's a superadmin in the managers list
  const hasSuperAdmin = managers.some((manager) => manager.isSuperAdmin);

  // Fetch organization managers
  const fetchManagers = useCallback(async () => {
    setIsLoadingManagers(true);
    try {
      const result = await organizationActions.getOrganizationManagers(organizationId);
      if (result.success) {
        setManagers(result.managers);
      } else {
        const errorMessage = "error" in result ? result.error : "Failed to load organization users";
        toast.error(errorMessage);
        setManagers([]);
      }
    } catch (error) {
      logger.error("Failed to fetch managers:", error);
      toast.error("Failed to load organization users");
      setManagers([]);
    } finally {
      setIsLoadingManagers(false);
    }
  }, [organizationId]);

  // Fetch pending invitation
  const fetchInvitation = useCallback(async () => {
    setIsLoadingInvitation(true);
    try {
      // Only fetch if there's no superadmin
      if (!hasSuperAdmin) {
        const invitationsResult = await organizationActions.getInvitations(organizationId);
        if (invitationsResult.success && invitationsResult.invitations) {
          // Find the most recent pending invitation
          const pending = invitationsResult.invitations.find(
            (inv: any) =>
              !inv.acceptedAt &&
              !inv.deletedAt &&
              new Date(inv.expiresAt) > new Date(),
          );
          setPendingInvitation(pending || null);
        } else {
          setPendingInvitation(null);
        }
      } else {
        setPendingInvitation(null);
      }
    } catch (error) {
      logger.error("Failed to fetch invitation:", error);
      setPendingInvitation(null);
    } finally {
      setIsLoadingInvitation(false);
    }
  }, [organizationId, hasSuperAdmin]);

  // Fetch managers on mount and when refreshKey changes
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers, refreshKey]);

  // Fetch invitation when hasSuperAdmin or refreshKey changes
  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation, refreshKey]);

  // Handle resend invitation
  const handleResendInvitation = useCallback(async () => {
    if (!pendingInvitation) return;

    setIsResending(true);
    try {
      const result = await organizationActions.resendInvitation(pendingInvitation.id);

      if (result.success) {
        toast.success("Invitation resent successfully!");
        await fetchInvitation();
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
  }, [pendingInvitation, fetchInvitation, router]);

  // Handle invite superadmin
  const handleInviteSuperAdmin = useCallback(async (email: string) => {
    setIsInviting(true);
    try {
      // Check if there's a previous pending invitation for a different email
      const invitationsBefore = await organizationActions.getInvitations(organizationId);
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

      const result = await organizationActions.inviteSuperAdmin(organizationId, email);

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
        setRefreshKey((prev) => prev + 1);
        await fetchInvitation();
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
  }, [organizationId, fetchInvitation, router]);

  // Handle remove superadmin (opens modal)
  const handleRemoveSuperAdmin = useCallback((managerId: string) => {
    setRemovingManagerId(managerId);
    setIsRemoveModalOpen(true);
  }, []);

  // Confirm remove superadmin
  const confirmRemoveSuperAdmin = useCallback(async () => {
    if (!removingManagerId) return;

    setIsRemoving(true);
    try {
      const result = await organizationActions.removeSuperAdmin(
        organizationId,
        removingManagerId,
      );

      if (result.success) {
        toast.success("Superadmin removed successfully!");
        setRemovingManagerId(null);
        setIsRemoveModalOpen(false);
        setRefreshKey((prev) => prev + 1);
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
  }, [organizationId, removingManagerId, router]);

  return {
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
  };
};
