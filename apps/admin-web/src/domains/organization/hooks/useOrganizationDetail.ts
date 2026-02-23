import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import logger from "@/utils/logger";
import organizationActions from "../actions";
import { OrganizationUserRow } from "../actions/getOrganizationUsers";

type UseOrganizationDetailProps = {
  organizationId: string;
};

export const useOrganizationDetail = ({
  organizationId,
}: UseOrganizationDetailProps) => {
  const router = useRouter();

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Loading states
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Data states
  const [users, setUsers] = useState<OrganizationUserRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Other states
  const [removingManagerId, setRemovingManagerId] = useState<string | null>(
    null,
  );
  const [resendingInvitationId, setResendingInvitationId] = useState<
    string | null
  >(null);
  const [revokingInvitationId, setRevokingInvitationId] = useState<
    string | null
  >(null);
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if there's a superadmin (accepted or invited)
  const hasSuperAdmin = users.some((user) => user.isSuperAdmin);

  // Fetch organization users (both invited and accepted)
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const result =
        await organizationActions.getOrganizationUsers(organizationId);
      if (result.success) {
        setUsers(result.users);
      } else {
        const errorMessage =
          "error" in result
            ? result.error
            : "Failed to load organization users";
        toast.error(errorMessage);
        setUsers([]);
      }
    } catch (error) {
      logger.error("Failed to fetch users:", error);
      toast.error("Failed to load organization users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [organizationId]);

  // Fetch users on mount and when refreshKey changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  // Handle resend invitation
  const handleResendInvitation = useCallback(
    async (invitationId: string) => {
      setResendingInvitationId(invitationId);
      setIsResending(true);
      try {
        const result = await organizationActions.resendInvitation(invitationId);

        if (result.success) {
          toast.success("Invitation resent successfully!");
          setRefreshKey((prev) => prev + 1);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to resend invitation");
        }
      } catch (error) {
        logger.error("Failed to resend invitation:", error);
        toast.error("Failed to resend invitation. Please try again.");
      } finally {
        setIsResending(false);
        setResendingInvitationId(null);
      }
    },
    [router],
  );

  // Handle invite superadmin
  const handleInviteSuperAdmin = useCallback(
    async (data: { email: string; firstName: string; lastName: string }) => {
      setIsInviting(true);
      try {
        // Check if there's a previous pending invitation for a different email
        const invitationsBefore =
          await organizationActions.getInvitations(organizationId);
        const hadPreviousInvitation =
          invitationsBefore.success &&
          invitationsBefore.invitations?.some(
            (inv: any) =>
              !inv.acceptedAt &&
              !inv.deletedAt &&
              inv.email.toLowerCase().trim() !==
                data.email.toLowerCase().trim() &&
              new Date(inv.expiresAt) > new Date(),
          );

        // Check if there's already a pending invitation for the same email
        const hasSameEmailInvitation =
          invitationsBefore.success &&
          invitationsBefore.invitations?.some(
            (inv: any) =>
              !inv.acceptedAt &&
              !inv.deletedAt &&
              inv.email.toLowerCase().trim() ===
                data.email.toLowerCase().trim() &&
              new Date(inv.expiresAt) > new Date(),
          );

        const result = await organizationActions.inviteSuperAdmin(
          organizationId,
          data.email,
          data.firstName,
          data.lastName,
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
          setRefreshKey((prev) => prev + 1);
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
    },
    [organizationId, router],
  );

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

  // Handle revoke invitation
  const handleRevokeInvitation = useCallback(
    async (invitationId: string) => {
      setRevokingInvitationId(invitationId);
      setIsRevoking(true);
      try {
        const result = await organizationActions.revokeInvitation(invitationId);

        if (result.success) {
          toast.success("Invitation revoked successfully!");
          setRefreshKey((prev) => prev + 1);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to revoke invitation");
        }
      } catch (error) {
        logger.error("Failed to revoke invitation:", error);
        toast.error("Failed to revoke invitation. Please try again.");
      } finally {
        setIsRevoking(false);
        setRevokingInvitationId(null);
      }
    },
    [router],
  );

  // Handle activate user
  const handleActivateUser = useCallback(
    async (userId: string) => {
      setActivatingUserId(userId);
      setIsActivating(true);
      try {
        const result = await organizationActions.activateUser(userId);

        if (result.success) {
          toast.success("User activated successfully!");
          setRefreshKey((prev) => prev + 1);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to activate user");
        }
      } catch (error) {
        logger.error("Failed to activate user:", error);
        toast.error("Failed to activate user. Please try again.");
      } finally {
        setIsActivating(false);
        setActivatingUserId(null);
      }
    },
    [router],
  );

  // Handle deactivate user
  const handleDeactivateUser = useCallback(
    async (userId: string) => {
      setDeactivatingUserId(userId);
      setIsDeactivating(true);
      try {
        const result = await organizationActions.deactivateUser(userId);

        if (result.success) {
          toast.success("User deactivated successfully!");
          setRefreshKey((prev) => prev + 1);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to deactivate user");
        }
      } catch (error) {
        logger.error("Failed to deactivate user:", error);
        toast.error("Failed to deactivate user. Please try again.");
      } finally {
        setIsDeactivating(false);
        setDeactivatingUserId(null);
      }
    },
    [router],
  );

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
    isRevoking,
    isActivating,
    isDeactivating,

    // Data states
    users,
    isLoadingUsers,
    hasSuperAdmin,

    // Other states
    searchQuery,
    setSearchQuery,

    // Handlers
    handleInviteSuperAdmin,
    handleRemoveSuperAdmin,
    confirmRemoveSuperAdmin,
    handleResendInvitation,
    handleRevokeInvitation,
    handleActivateUser,
    handleDeactivateUser,
  };
};
