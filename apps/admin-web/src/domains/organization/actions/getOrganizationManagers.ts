'use server';

import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';

export type OrganizationManagerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  department: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
};

export default async function getOrganizationManagers(
  organizationId: string
): Promise<
  { success: true; managers: OrganizationManagerRow[] } | { success: false; error: string }
> {
  try {
    // Get the SUPER_ADMIN role for this organization to identify superadmins
    const superAdminRole = await prisma.organizationRole.findFirst({
      where: {
        key: 'SUPER_ADMIN',
        organizationId,
        deletedAt: null,
      },
    });

    const managers = await prisma.organizationManager.findMany({
      where: {
        organizationId,
        deletedAt: null,
        account: {
          user: {
            userType: 'ORGANIZATION_USER',
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
        createdAt: 'desc',
      },
    });

    const managerRows: OrganizationManagerRow[] = managers.map(manager => {
      const isSuperAdmin = superAdminRole
        ? manager.organizationRoleId === superAdminRole.id
        : manager.organizationRole?.key === 'SUPER_ADMIN';

      return {
        id: manager.id,
        fullName:
          `${manager.account.user.firstName ?? ''} ${manager.account.user.lastName ?? ''}`.trim() ||
          'N/A',
        email: manager.account.user.email || 'N/A',
        phone: manager.account.user.phone,
        role: manager.organizationRole?.name || 'N/A',
        department: manager.department?.name || null,
        isSuperAdmin,
        createdAt: manager.createdAt.toISOString(),
      };
    });

    // Sort: superadmin first, then others by creation date
    managerRows.sort((a, b) => {
      if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
      if (!a.isSuperAdmin && b.isSuperAdmin) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { success: true, managers: managerRows };
  } catch (error) {
    logger.error('Failed to get organization managers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get organization managers',
    };
  }
}
