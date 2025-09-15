import prisma from '@/lib/prisma';
import claimantService from '../claimant.service';

const getCaseSummary = async (token: string) => {
  const secureLink = await prisma.caseSecureLink.findFirst({
    where: { token },
  });
  if (!secureLink) {
    throw new Error('Invalid token');
  }
  if (secureLink.expiresAt < new Date() || secureLink.status === 'INVALID') {
    throw new Error('Token expired or invalid');
  }
  const caseId = secureLink.caseId;
  if (!caseId) {
    throw new Error('Case ID not found for the provided token');
  }
  const claimant = await claimantService.getCaseSummary(caseId);
  return { success: true, result: claimant };
};
export default getCaseSummary;
