'use server';
import bcrypt from 'bcryptjs';
import { getTenantDb } from '@/lib/tenant-db';
import { isAllowedRole } from '@/lib/rbac';
import { Account, PrismaClient, Role, User } from '@thrive/database';
import { UserLoginFlags } from '@/domains/auth/types/userFlags';

type AuthUserRecord = (User & UserLoginFlags) & {
  accounts: Array<Account & { role: Role }>;
};

/** Fetch user with most-recent account + role. Null if user missing OR no role. */
export async function getUserWithRoleByEmail(
  email: string,
  prismaClient?: PrismaClient
): Promise<AuthUserRecord | null> {
  const db = prismaClient ?? (await getTenantDb());
  const user = await db.user.findUnique({
    where: { email },
    include: {
      accounts: {
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!user) return null;
  return user as AuthUserRecord;
}

/** Verify password against stored hash. */
export async function verifyPassword(
  email: string,
  password: string,
  prismaClient?: PrismaClient
): Promise<boolean> {
  const db = prismaClient ?? (await getTenantDb());
  const user = await db.user.findUnique({
    where: { email },
    select: { password: true },
  });
  if (!user) return false;
  return bcrypt.compare(password, (user as any).password);
}

/** Google sign-in: allow only pre-seeded allowed roles. No auto-creation. */
export async function resolveGoogleUser(email: string) {
  const authUser = await getUserWithRoleByEmail(email);
  if (
    !authUser ||
    !authUser.accounts ||
    authUser.accounts.length === 0 ||
    !authUser.accounts[0].role ||
    !authUser.accounts[0].role.name
  )
    return null;
  if (!isAllowedRole(authUser.accounts[0].role.name)) return null;
  return authUser;
}
