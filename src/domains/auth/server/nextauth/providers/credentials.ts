import CredentialsProvider from 'next-auth/providers/credentials';
import { authHandlers } from '../..';
import prisma from '@/lib/db';

export const credentials = CredentialsProvider({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(values) {
    if (!values?.email || !values?.password) return null;

    const user = await authHandlers.login({ email: values.email, password: values.password });

    if (!user) return null;

    const organizationManager = await prisma.organizationManager.findFirst({
      where: {
        accountId: user.accountId,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return {
      ...user,
      organizationId: organizationManager?.organization?.id || null,
      organizationName: organizationManager?.organization?.name || null,
      organizationStatus: organizationManager?.organization?.status || null,
    };
  },
});
