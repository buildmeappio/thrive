'use server';

import { verifyPasswordResetToken } from './verifyPasswordResetToken';
import prisma from '@/lib/db';
import logger from '@/utils/logger';
import bcrypt from 'bcryptjs';

type ResetPasswordData = {
  token: string;
  password: string;
};

export const resetPassword = async (
  data: ResetPasswordData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify the token
    const tokenData = await verifyPasswordResetToken(data.token);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: {
        password: hashedPassword,
        mustResetPassword: false,
        temporaryPasswordIssuedAt: null,
      },
    });

    logger.log(`✅ Password reset successful for user: ${tokenData.email}`);

    return { success: true };
  } catch (error) {
    logger.error('Error resetting password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    };
  }
};
