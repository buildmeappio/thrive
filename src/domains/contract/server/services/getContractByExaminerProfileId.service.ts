import prisma from "@/lib/db";

export async function getContractByExaminerProfileIdService(profileId: string) {
  // First, get the examiner profile to check for applicationId
  const examinerProfile = await prisma.examinerProfile.findUnique({
    where: { id: profileId },
    select: { applicationId: true },
  });

  // Build where clause to check both examinerProfileId and applicationId
  const whereClause: {
    OR: Array<
      | { examinerProfileId: string }
      | { applicationId: string | null }
    >;
  } = {
    OR: [{ examinerProfileId: profileId }],
  };

  // If profile has an applicationId, also search for contracts linked via application
  if (examinerProfile?.applicationId) {
    whereClause.OR.push({ applicationId: examinerProfile.applicationId });
  }

  const contracts = await prisma.contract.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  return contracts[0] || null;
}
