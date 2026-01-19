'use server';

import userService from '../server/user.service';
import { AccountStatus } from '@prisma/client';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

type ToggleUserStatusInput = {
  userId: string;
  isActive: boolean;
};

export const toggleUserStatus = async (
  data: ToggleUserStatusInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
    }

    await userService.toggleUserStatus(
      data.userId,
      currentUser.organizationId,
      data.isActive ? AccountStatus.ACTIVE : AccountStatus.INACTIVE
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user status',
    };
  }
};

export default toggleUserStatus;
