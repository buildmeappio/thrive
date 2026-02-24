'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import prisma from '@/lib/db';
import { UserStatus } from '@/domains/auth/constants/userStatus';

export async function checkExaminerStatus() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { isSuspended: false };
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { status: true },
    });

    return {
      isSuspended: userRecord?.status === UserStatus.SUSPENDED,
      status: userRecord?.status || null,
    };
  } catch (error) {
    console.error('Error checking examiner status:', error);
    return { isSuspended: false };
  }
}
