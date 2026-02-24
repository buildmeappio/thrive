'use server';

import prisma from '@/lib/db';
import { UserStatus } from '@/domains/auth/constants/userStatus';

export async function checkSuspensionByEmail(email: string) {
  try {
    if (!email) {
      console.log('checkSuspensionByEmail: No email provided');
      return { isSuspended: false };
    }

    console.log('checkSuspensionByEmail: Checking email:', email);

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Normalize email to lowercase
      select: {
        id: true,
        status: true,
      },
    });

    console.log('checkSuspensionByEmail: User found:', !!user);

    if (!user) {
      console.log('checkSuspensionByEmail: No user found');
      return { isSuspended: false };
    }

    const isSuspended = user.status === UserStatus.SUSPENDED;

    console.log('checkSuspensionByEmail: User status:', user.status);
    console.log('checkSuspensionByEmail: Is suspended:', isSuspended);

    return {
      isSuspended,
      status: user.status || null,
    };
  } catch (error) {
    console.error('Error checking suspension by email:', error);
    return { isSuspended: false };
  }
}
