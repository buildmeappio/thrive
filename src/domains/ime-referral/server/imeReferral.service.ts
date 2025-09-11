import prisma from '@/shared/lib/prisma';
import { getCurrentUser } from '@/domains/auth/server/session';
import { saveFileToStorage } from '@/shared/utils/imeCreation.utils';
import { type IMEFormData } from '@/store/useIMEReferralStore';
import { type UrgencyLevel } from '@prisma/client';
import { CaseStatus } from '@/constants/CaseStatus';

type CreateIMEReferralData = {
  step1: NonNullable<IMEFormData['step1']>;
  step2: NonNullable<IMEFormData['step2']>;
  step3: NonNullable<IMEFormData['step3']>;
  isDraft: boolean;
};

const createIMEReferralWithClaimant = async (data: CreateIMEReferralData) => {
  const currentUser = await getCurrentUser();
  if (!currentUser?.accountId) {
    throw new Error('User not authenticated');
  }

  const defaultStatus = await prisma.caseStatus.findFirst({
    where: { name: CaseStatus.PENDING },
  });

  if (!defaultStatus) {
    throw new Error('Default case status not found');
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
        caseNumber: `IME-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        claimantId: claimant.id,
        organizationId: organizationManager?.organizationId || null,
        consentForSubmission: data.step3?.consentForSubmission ?? false,
        isDraft: data.isDraft,
      },
    });

    // 5. Create Cases
    const createdCases = [];

    for (const [_index, caseData] of data.step2.cases.entries()) {
      // Create case
      const caseRecord = await tx.case.create({
        data: {
          referralId: referral.id,
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
      const uploadedFiles = [];

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
        files: uploadedFiles,
      });
    }

    return {
      referralId: referral.id,
      caseNumber: referral.caseNumber,
      claimantId: claimant.id,
      cases: createdCases,
      organizationId: organizationManager?.organizationId || null,
    };
  });
};

const getReferrals = async () => {
  return;
};

export default {
  createIMEReferralWithClaimant,
  getReferrals,
};
