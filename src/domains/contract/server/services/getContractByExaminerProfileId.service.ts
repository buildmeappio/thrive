import prisma from "@/lib/db";

export async function getContractByExaminerProfileIdService(profileId: string) {
  const contracts = await prisma.contract.findMany({
    // where: {
    //   examinerProfileId: profileId,
    // },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  return contracts[0] || null;
}
