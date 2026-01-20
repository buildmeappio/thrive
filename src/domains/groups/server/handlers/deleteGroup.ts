'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Soft delete a group
 */
const deleteGroup = async (groupId: string) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    // Get the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new HttpError(404, 'Group not found');
    }

    if (group.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only delete groups in your organization');
    }

    // Soft delete (cascade will handle related records)
    await prisma.group.update({
      where: { id: groupId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Group deleted successfully',
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
      error: 'Failed to delete group',
    };
  }
};

export default deleteGroup;
