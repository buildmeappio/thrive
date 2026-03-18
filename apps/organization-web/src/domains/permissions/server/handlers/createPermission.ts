'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface CreatePermissionData {
  key: string;
  description?: string;
}

/**
 * Create a permission
 */
const createPermission = async (data: CreatePermissionData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { key, description } = data;

    if (!key || key.trim().length === 0) {
      throw new HttpError(400, 'Permission key is required');
    }

    const normalizedKey = key.trim().toLowerCase();

    // Check if permission already exists (permissions are global, not organization-specific)
    const existingPermission = await prisma.permission.findFirst({
      where: {
        key: normalizedKey,
        deletedAt: null,
      },
    });

    if (existingPermission) {
      throw new HttpError(400, 'Permission with this key already exists');
    }

    // Create permission (permissions are global, not organization-specific)
    const permission = await prisma.permission.create({
      data: {
        key: normalizedKey,
        description: description?.trim() || null,
      },
    });

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to create permission',
    };
  }
};

export default createPermission;
