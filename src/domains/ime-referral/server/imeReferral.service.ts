import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/domains/auth/server/session';
import { saveFileToStorage } from '@/utils/imeCreation';
import { type IMEFormData } from '@/store/useImeReferral';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

const createIMEReferralWithClaimant = async (data: IMEFormData) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.accountId) {
      throw HttpError.unauthorized(ErrorMessages.UNAUTHORIZED);
    }

    const defaultStatus = await prisma.caseStatus.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!defaultStatus) {
      throw HttpError.notFound(ErrorMessages.STATUS_NOT_FOUND);
    }

    return await prisma.$transaction(async tx => {
      let claimant = null;
      let legalRepresentative = null;
      let insurance = null;

      // 1. Create Claimant and Address (Step 1)
      if (data.step1) {
        const claimantAddress = await tx.address.create({
          data: {
            address: data.step1.addressLookup,
            street: data.step1.street,
            suite: data.step1.suite,
            city: data.step1.city,
            province: data.step1.province,
            postalCode: data.step1.postalCode,
          },
        });

        claimant = await tx.claimant.create({
          data: {
            firstName: data.step1.firstName,
            lastName: data.step1.lastName,
            dateOfBirth: new Date(data.step1.dateOfBirth),
            gender: data.step1.gender,
            phoneNumber: data.step1.phoneNumber,
            emailAddress: data.step1.emailAddress,
            addressId: claimantAddress.id,
            relatedCasesDetails: data.step1.relatedCasesDetails,
            familyDoctorName: data.step1.familyDoctorName,
            familyDoctorEmailAddress: data.step1.familyDoctorEmail,
            familyDoctorPhoneNumber: data.step1.familyDoctorPhone,
            familyDoctorFaxNumber: data.step1.familyDoctorFax,
          },
        });
      }

      // 2. Create Legal Representative (Step 2 - if provided)
      if (data.step2?.legalCompanyName) {
        const legalAddress = await tx.address.create({
          data: {
            address: data.step2.legalAddressLookup,
            street: data.step2.legalStreetAddress,
            suite: data.step2.legalAptUnitSuite,
            city: data.step2.legalCity,
            province: data.step2.legalProvinceState,
            postalCode: data.step2.legalPostalCode,
          },
        });

        legalRepresentative = await tx.legalRepresentative.create({
          data: {
            companyName: data.step2.legalCompanyName,
            contactPersonName: data.step2.legalContactPerson,
            phoneNumber: data.step2.legalPhone,
            faxNumber: data.step2.legalFaxNo,
            addressId: legalAddress.id,
          },
        });
      }

      // 3. Create Insurance (Step 2 - if provided)
      if (data.step2?.insuranceCompanyName) {
        const insuranceAddress = await tx.address.create({
          data: {
            address: data.step2.insuranceAddressLookup,
            street: data.step2.insuranceStreetAddress,
            suite: data.step2.insuranceAptUnitSuite,
            city: data.step2.insuranceCity,
            province: '', // Add to form if needed
            postalCode: '', // Add to form if needed
          },
        });

        insurance = await tx.insurance.create({
          data: {
            companyName: data.step2.insuranceCompanyName,
            contactPersonName: data.step2.insuranceAdjusterContact,
            policyNumber: data.step2.insurancePolicyNo,
            claimNumber: data.step2.insuranceClaimNo,
            dateOfLoss: new Date(data.step2.insuranceDateOfLoss),
            policyHolderIsClaimant: data.step2.policyHolderSameAsClaimant,
            policyHolderFirstName: data.step2.policyHolderSameAsClaimant
              ? data.step1?.firstName
              : data.step2.policyHolderFirstName,
            policyHolderLastName: data.step2.policyHolderSameAsClaimant
              ? data.step1?.lastName
              : data.step2.policyHolderLastName,
            phoneNumber: data.step2.insurancePhone,
            faxNumber: data.step2.insuranceFaxNo,
            emailAddress: data.step2.insuranceEmailAddress,
            addressId: insuranceAddress.id,
          },
        });
      }

      // 4. Get organization for current user
      const organizationManager = await tx.organizationManager.findFirst({
        where: { accountId: currentUser.accountId },
      });

      if (!organizationManager) {
        throw HttpError.badRequest('Current user is not associated with any organization');
      }

      // 5. Create IME Referral
      const referral = await tx.iMEReferral.create({
        data: {
          claimantId: claimant?.id || '',
          organizationId: organizationManager?.organizationId || '',
          insuranceId: insurance?.id || '',
          legalRepresentativeId: legalRepresentative?.id,
          examTypeId: data.step4?.examinationType || '',
          reason: data.step4?.reasonForReferral || '',
          consentForSubmission: data.step6?.consentForSubmission ?? false,
          isDraft: data.step6?.isDraft ?? false,
        },
      });

      // 6. Handle Document Uploads (Step 5)
      const uploadedDocuments = [];
      if (data.step5?.files && data.step5.files.length > 0) {
        // Save files to storage first
        await Promise.all(data.step5.files.map(file => saveFileToStorage(file)));

        // Create document records
        for (const file of data.step5.files) {
          const document = await tx.documents.create({
            data: {
              name: file.name,
              type: file.type,
              size: file.size,
            },
          });

          // Link document to referral
          await tx.iMEReferralDocument.create({
            data: {
              referralId: referral.id,
              documentId: document.id,
            },
          });

          uploadedDocuments.push({
            name: document.name,
            documentId: document.id,
          });
        }
      }

      // 7. Create Examinations
      const createdExaminations = [];

      if (data.step3?.examTypes && data.step3.examTypes.length > 0) {
        // Get available examination types from your seeded data
        const availableExaminationTypes = await tx.examinationType.findMany({
          orderBy: { name: 'asc' },
        });

        if (availableExaminationTypes.length === 0) {
          throw new Error('No examination types found. Please run the examination type seeder.');
        }

        // For each selected exam type, create an examination
        for (let i = 0; i < data.step3.examTypes.length; i++) {
          const examType = data.step3.examTypes[i];

          // Validate the exam type exists
          const validExamType = await tx.examinationType.findUnique({
            where: { id: examType.id },
          });

          if (!validExamType) {
            throw new Error(`Exam type with ID ${examType.id} not found`);
          }

          // Create dynamic field names based on exam type label
          const fieldPrefix = examType.label.toLowerCase().replace(/\s+/g, '');
          const urgencyField = `${fieldPrefix}UrgencyLevel` as keyof typeof data.step4;
          const dueDateField = `${fieldPrefix}DueDate` as keyof typeof data.step4;
          const instructionsField = `${fieldPrefix}Instructions` as keyof typeof data.step4;

          const examination = await tx.examination.create({
            data: {
              caseNumber: `IME-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
              referralId: referral.id,
              examinationTypeId: examType.id,
              dueDate: data.step4?.[dueDateField]
                ? new Date(data.step4[dueDateField] as string)
                : null,
              notes: (data.step4?.[instructionsField] as string) || null,
              urgencyLevel:
                ((data.step4?.[urgencyField] as string)?.toUpperCase() as
                  | 'HIGH'
                  | 'MEDIUM'
                  | 'LOW') || 'MEDIUM',
              reason: data.step4?.reasonForReferral || '',
              statusId: defaultStatus.id,
            },
            include: {
              examinationType: true,
            },
          });

          createdExaminations.push({
            id: examination.id,
            caseNumber: examination.caseNumber,
            examTypeName: validExamType.name,
            examinationTypeName: examination.examinationType.name,
            urgencyLevel: examination.urgencyLevel,
            dueDate: examination.dueDate,
          });
        }
      }

      return {
        success: true,
        referralId: referral.id,
        claimantId: claimant?.id || null,
        insuranceId: insurance?.id || null,
        legalRepresentativeId: legalRepresentative?.id || null,
        organizationId: organizationManager?.organizationId || null,
        documentsUploaded: uploadedDocuments.length,
        examinationsCreated: createdExaminations.length,
        examinations: createdExaminations,
        isDraft: referral.isDraft,
      };
    });
  } catch (error) {
    console.error('Error creating IME referral:', error);
    throw HttpError.handleServiceError(error, 'Failed to create IME referral');
  }
};

const getReferrals = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const userAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        managers: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!userAccount || !userAccount.managers.length) {
      return [];
    }

    const organizationIds = userAccount.managers.map(manager => manager.organizationId);

    const referrals = await prisma.iMEReferral.findMany({
      where: {
        organizationId: {
          in: organizationIds,
        },
      },
      select: {
        id: true,
        createdAt: true,
        claimant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        examinations: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = referrals.map(referral => ({
      referralId: referral.id,
      firstName: referral.claimant.firstName,
      lastName: referral.claimant.lastName,
      createdAt: referral.createdAt,
      cases: referral.examinations.map(c => ({ caseId: c.id })),
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
                    role: true,
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
          },
        },
        legalRepresentative: {
          include: {
            address: true,
          },
        },
        insurance: {
          include: {
            address: true,
          },
        },
        documents: {
          include: {
            document: true,
          },
        },
        examinations: {
          include: {
            examinationType: true,
            status: true,
          },
        },
        examType: true,
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

const getExamTypes = async () => {
  try {
    const examTypes = await prisma.examType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
    if (!examTypes) {
      throw HttpError.notFound('No exam types found');
    }
    return examTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching exam types');
  }
};

const imeReferralService = {
  createIMEReferralWithClaimant,
  getReferrals,
  getReferralDetails,
  getExamTypes,
};
export default imeReferralService;
