import prisma from '@/shared/lib/prisma';
import { getCurrentUser } from '@/domains/auth/server/session';
import { saveFileToStorage } from '@/shared/utils/imeCreation.utils';
import { type IMEFormData } from '@/store/useIMEReferralStore';
import { type UrgencyLevel } from '@prisma/client';
import { CaseStatus } from '@/constants/CaseStatus';
import { HttpError } from '@/utils/httpError';

type CreateIMEReferralData = {
  step1: NonNullable<IMEFormData['step1']>;
  step2: NonNullable<IMEFormData['step2']>;
  step3: NonNullable<IMEFormData['step3']>;
  isDraft: boolean;
};

const createIMEReferralWithClaimant = async (data: CreateIMEReferralData) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.accountId) {
      throw HttpError.unauthorized('User not authenticated');
    }

    const defaultStatus = await prisma.caseStatus.findFirst({
      where: { name: CaseStatus.PENDING },
    });

    if (!defaultStatus) {
      throw HttpError.notFound('Default case status not found');
    }

    return await prisma.$transaction(async tx => {
      // 1. Create Address
      const address = await tx.address.create({
        data: {
          address: data.step1.addressLookup,
          street: data.step1.street || '',
          suite: data.step1.apt || '',
          city: data.step1.city || '',
          province: data.step1.province || '',
          postalCode: data.step1.postalCode || '',
        },
      });

      // 2. Create Claimant
      const claimant = await tx.claimant.create({
        data: {
          firstName: data.step1.firstName,
          lastName: data.step1.lastName,
          dateOfBirth: new Date(data.step1.dob),
          gender: data.step1.gender,
          phoneNumber: data.step1.phone,
          emailAddress: data.step1.email,
          addressId: address.id,
        },
      });

      // 3. Find organization manager
      const organizationManager = await tx.organizationManager.findFirst({
        where: { accountId: currentUser.accountId },
      });

      // 4. Create IMEReferral
      const referral = await tx.iMEReferral.create({
        data: {
          claimantId: claimant.id,
          organizationId: organizationManager?.organizationId || null,
          consentForSubmission: data.step3?.consentForSubmission ?? false,
          isDraft: data.isDraft,
        },
      });

      // 5. Create Cases
      const createdCases: {
        id: string;
        caseNumber: string;
        files: { name: string; documentId: string }[];
      }[] = [];

      for (const [_index, caseData] of data.step2.cases.entries()) {
        // Create case
        const caseRecord = await tx.case.create({
          data: {
            referralId: referral.id,
            caseNumber: `IME-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
            caseTypeId: caseData.caseType,
            examFormatId: caseData.examFormat,
            requestedSpecialtyId: caseData.requestedSpecialty,
            urgencyLevel: caseData.urgencyLevel.toUpperCase() as UrgencyLevel,
            reason: caseData.reason,
            preferredLocation: caseData.preferredLocation || null,
            statusId: defaultStatus.id,
          },
        });

        // 6. Handle file uploads and create documents
        const uploadedFiles: { name: string; documentId: string }[] = [];

        for (const file of caseData.files) {
          await saveFileToStorage(file);

          const document = await tx.documents.create({
            data: {
              name: file.name,
              type: file.type,
              size: file.size,
            },
          });

          await tx.caseDocument.create({
            data: {
              caseId: caseRecord.id,
              documentId: document.id,
            },
          });

          uploadedFiles.push({
            name: file.name,
            documentId: document.id,
          });
        }

        createdCases.push({
          id: caseRecord.id,
          caseNumber: caseRecord.caseNumber,
          files: uploadedFiles,
        });
      }

      return {
        referralId: referral.id,
        claimantId: claimant.id,
        cases: createdCases,
        organizationId: organizationManager?.organizationId || null,
      };
    });
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error creating IME referral');
  }
};

const getReferrals = async () => {
  try {
    const referrals = await prisma.iMEReferral.findMany({
      select: {
        id: true,
        createdAt: true,
        claimant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        cases: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Keep cases as array
    const formatted = referrals.map(referral => ({
      referralId: referral.id,
      firstName: referral.claimant.firstName,
      lastName: referral.claimant.lastName,
      createdAt: referral.createdAt,
      cases: referral.cases.map(c => ({ caseId: c.id })),
    }));

    return formatted;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching referrals');
  }
};

const getReferralDetails = async (referralId: string) => {
  try {
    const referral = await prisma.iMEReferral.findUnique({
      where: { id: referralId },
      include: {
        organization: {
          include: {
            type: true,
            address: true,
            manager: {
              include: {
                account: {
                  include: {
                    user: true,
                  },
                },
                department: true,
              },
            },
          },
        },
        claimant: {
          include: {
            address: true,
            claimantAvailability: {
              include: {
                slots: true,
                services: {
                  include: {
                    interpreter: {
                      include: {
                        language: true,
                      },
                    },
                    transport: {
                      include: {
                        pickupAddress: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        cases: {
          include: {
            caseType: true,
            examFormat: true,
            requestedSpecialty: true,
            status: true,
            examiner: {
              include: {
                user: true,
                role: true,
              },
            },
            assignTo: {
              include: {
                user: true,
              },
            },
            documents: {
              include: {
                document: true,
              },
            },
            claimantAvailability: {
              include: {
                slots: true,
              },
            },
          },
        },
      },
    });

    if (!referral) {
      throw HttpError.notFound('Referral not found');
    }

    return referral;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching referral details');
  }
};

export default {
  createIMEReferralWithClaimant,
  getReferrals,
  getReferralDetails,
};
