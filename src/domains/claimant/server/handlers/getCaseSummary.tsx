import prisma from '@/lib/db';
import claimantService from '../claimant.service';

const getCaseSummary = async (token: string) => {
  try {
    const secureLink = await prisma.examinationSecureLink.findFirst({
      where: { token },
    });
    if (!secureLink) {
      return { success: false, message: 'Invalid token', result: null };
    }
    // Commented out expiry logic - links no longer expire
    // if (secureLink.expiresAt < new Date() || secureLink.status === 'INVALID') {
    //   throw new Error('Token expired or invalid');
    // }
    if (secureLink.status === 'INVALID') {
      throw new Error('Token invalid');
    }
    const examinationId = secureLink.examinationId;
    if (!examinationId) {
      throw new Error('Examination ID not found for the provided token');
    }
    const claimant = await claimantService.getCaseSummary(examinationId);
    return { success: true, result: claimant };
  } catch (error) {
    console.error('Error in getCaseSummary handler:', error);
    return { success: false, result: null };
  }
};
export default getCaseSummary;
