'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface CreateRoleData {
  name: string;
  description?: string;
}

/**
 * Create a custom organization role
 */
const createRole = async (data: CreateRoleData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { name, description } = data;

    // Validate name
    if (!name || name.trim().length === 0) {
      throw new HttpError(400, 'Role name is required');
    }

    const normalizedName = name.trim();

    // Check if role name already exists for this organization
    const existingRole = await prisma.organizationRole.findFirst({
      where: {
        organizationId,
        name: normalizedName,
        deletedAt: null,
      },
    });

    if (existingRole) {
      throw new HttpError(400, 'Role with this name already exists in your organization');
    }

    // Check if system role with same name exists
    const systemRoleWithSameName = await prisma.organizationRole.findFirst({
      where: {
        name: normalizedName,
        isSystemRole: true,
        deletedAt: null,
      },
    });

    if (systemRoleWithSameName) {
      throw new HttpError(400, 'This role name conflicts with a system role');
    }

    // Create custom role
    const role = await prisma.organizationRole.create({
      data: {
        organizationId,
        name: normalizedName,
        description: description?.trim() || null,
        isSystemRole: false,
        isDefault: false,
      },
    });

    return {
      success: true,
      data: role,
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
      error: 'Failed to create role',
    };
  }
};

export default createRole;
