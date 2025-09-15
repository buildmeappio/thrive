import prisma from '@/shared/lib/prisma';
import { notFound } from 'next/navigation';

const getClaimant = async (token: string) => {
  const link = await prisma.caseSecureLink.findFirst({
    where: { token },
    include: {
      case: {
        include: {
          claimantAvailability: {
            include: {
              claimant: true,
              slots: true,
              services: true,
            },
          },
        },
      },
    },
  });

  if (!link || link.expiresAt < new Date() || link.status === 'INVALID') {
    notFound(); // or throw an error
  }

  // Optionally: mark last opened
  await prisma.caseSecureLink.update({
    where: { id: link.id },
    data: { lastOpenedAt: new Date() },
  });

  return link.case.claimantAvailability;
};

export const getCaseSummary = async (caseId: string) => {
  const caseData = await prisma.case.findUnique({
    where: { caseNumber: caseId },
    select: {
      id: true,
      referral: {
        select: {
          claimant: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  return {
    caseId: caseData.id,
    claimantFirstName: caseData.referral.claimant.firstName,
    claimantLastName: caseData.referral.claimant.lastName,
    organizationName: caseData.referral.organization?.name ?? null,
  };
};

export default {
  getClaimant,
  getCaseSummary,
};
