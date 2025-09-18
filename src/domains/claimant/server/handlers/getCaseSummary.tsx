import prisma from '@/lib/prisma';
import claimantService from '../claimant.service';

const getCaseSummary = async (token: string) => {
  const secureLink = await prisma.examinationSecureLink.findFirst({
    where: { token },
  });
  if (!secureLink) {
    throw new Error('Invalid token');
  }
  if (secureLink.expiresAt < new Date() || secureLink.status === 'INVALID') {
    throw new Error('Token expired or invalid');
  }
  const examinationId = secureLink.examinationId;
  if (!examinationId) {
    throw new Error('Examination ID not found for the provided token');
  }
  const claimant = await claimantService.getCaseSummary(examinationId);
  return { success: true, result: claimant };
};
export default getCaseSummary;
