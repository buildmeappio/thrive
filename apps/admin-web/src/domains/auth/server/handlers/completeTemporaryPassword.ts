'use server';

import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import logger from '@/utils/logger';

type CompleteTemporaryPasswordInput = {
  password: string;
};

export const completeTemporaryPassword = async ({
  password,
}: CompleteTemporaryPasswordInput): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Use dynamic import to avoid circular dependency
    const { authOptions } = await import('../nextauth/options');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustResetPassword: false,
        temporaryPasswordIssuedAt: null,
      },
    });

    return { success: true };
  } catch (error) {
    logger.error('Error completing temporary password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password',
    };
  }
};
