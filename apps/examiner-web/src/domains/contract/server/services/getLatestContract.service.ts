import prisma from '@/lib/db';

export async function getLatestContractService(contractId: string) {
  return await prisma.contract.findUnique({
    where: { id: contractId },
  });
}
