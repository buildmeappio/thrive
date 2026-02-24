import prisma from '@/lib/db';

export async function getExaminerProfileByAccountIdService(accountId: string) {
  return await prisma.examinerProfile.findFirst({
    where: {
      accountId: accountId,
    },
    include: {
      account: {
        include: {
          user: true,
        },
      },
    },
  });
}
