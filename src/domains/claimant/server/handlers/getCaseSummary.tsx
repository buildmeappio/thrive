import prisma from '@/lib/db';
import claimantService from '../claimant.service';

const getCaseSummary = async (token: string) => {
  try {
    const secureLink = await prisma.secureLink.findFirst({
      where: { token },
      include: {
        examinationSecureLink: {
          include: {
            examination: true,
          },
        },
      },
    });
    if (!secureLink || secureLink.status === 'INVALID') {
      return { success: false, message: 'Invalid token', result: null };
    }
    const examinationId = secureLink.examinationSecureLink?.[0]?.examinationId;
    if (!examinationId) {
      return {
        success: false,
        message: 'Examination ID not found for the provided token',
        result: null,
      };
    }
    const claimant = await claimantService.getCaseSummary(examinationId);
    if (!claimant) {
      return { success: false, message: 'Claimant not found', result: null };
    }
    return { success: true, result: claimant };
  } catch (error) {
    console.error('Error in getCaseSummary handler:', error);
    return { success: false, result: null };
  }
};
export default getCaseSummary;
