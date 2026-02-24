import prisma from '@/lib/db';

export async function getAccountByIdService(accountId: string) {
  return await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });
}
