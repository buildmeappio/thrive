"use server";

import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";

export type OrganizationUserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  department: string | null;
  isSuperAdmin: boolean;
  status: "invited" | "accepted";
  invitationId: string | null;
  accountStatus?: string; // AccountStatus for accepted users
  createdAt: string;
  expiresAt: string | null;
};

export default async function getOrganizationUsers(
  organizationId: string,
): Promise<
  | { success: true; users: OrganizationUserRow[] }
  | { success: false; error: string }
> {
  try {
    // Get the SUPER_ADMIN role for this organization to identify superadmins
    const superAdminRole = await prisma.organizationRole.findFirst({
      where: {
        key: "SUPER_ADMIN",
        organizationId,
        deletedAt: null,
      },
    });

    // Fetch accepted managers
    const managers = await prisma.organizationManager.findMany({
      where: {
        organizationId,
        deletedAt: null,
        account: {
          user: {
            userType: "ORGANIZATION_USER",
            organizationId: { not: null },
          },
        },
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        organizationRole: {
          select: {
            name: true,
            key: true,
            id: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch pending invitations
    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        deletedAt: null,
        acceptedAt: null, // Only pending invitations
      },
      include: {
        organizationRole: {
          select: {
            name: true,
            key: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map managers to user rows
    const managerRows: OrganizationUserRow[] = managers.map((manager) => {
      const isSuperAdmin = superAdminRole
        ? manager.organizationRoleId === superAdminRole.id
        : manager.organizationRole?.key === "SUPER_ADMIN";

      return {
        id: manager.id,
        email: manager.account.user.email || "N/A",
        firstName: manager.account.user.firstName || null,
        lastName: manager.account.user.lastName || null,
        phone: manager.account.user.phone,
        role: manager.organizationRole?.name || "N/A",
        department: manager.department?.name || null,
        isSuperAdmin,
        status: "accepted" as const,
        invitationId: null,
        accountStatus: manager.account.status,
        createdAt: manager.createdAt.toISOString(),
        expiresAt: null,
      };
    });

    // Map invitations to user rows
    const invitationRows: OrganizationUserRow[] = invitations.map(
      (invitation) => {
        const isSuperAdmin = invitation.organizationRole?.key === "SUPER_ADMIN";

        return {
          id: invitation.id,
          email: invitation.email,
          firstName: invitation.firstName || null,
          lastName: invitation.lastName || null,
          phone: null,
          role: invitation.organizationRole?.name || "N/A",
          department: null,
          isSuperAdmin,
          status: "invited" as const,
          invitationId: invitation.id,
          createdAt: invitation.createdAt.toISOString(),
          expiresAt: invitation.expiresAt.toISOString(),
        };
      },
    );

    // Combine both arrays
    const allUsers = [...managerRows, ...invitationRows];

    // Filter to only show superadmins
    const superAdminUsers = allUsers.filter((user) => user.isSuperAdmin);

    // Sort by creation date (newest first)
    superAdminUsers.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { success: true, users: superAdminUsers };
  } catch (error) {
    logger.error("Failed to get organization users:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get organization users",
    };
  }
}
