import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';
import type { IMEFormData } from '@/store/useImeReferral';
import { createCaseNumber } from '@/utils/createCaseNumber';

export const createCase = async (formData: IMEFormData) => {
  const currentUser = await getCurrentUser();
  if (!currentUser?.accountId) {
    throw new Error('Unauthorized: missing accountId');
  }

  // Validate required fields
  if (!formData.step1?.firstName || !formData.step1?.lastName) {
    throw new Error('Claimant first name and last name are required');
  }
  if (!formData.step2?.insuranceCompanyName || !formData.step2?.insuranceEmailAddress) {
    throw new Error('Insurance company name and email are required');
  }
  if (!formData.step2?.insurancePolicyNo || !formData.step2?.insuranceClaimNo) {
    throw new Error('Insurance policy number and claim number are required');
  }
  if (!formData.step2?.policyHolderFirstName || !formData.step2?.policyHolderLastName) {
    throw new Error('Policy holder first name and last name are required');
  }

  return prisma.$transaction(
    async tx => {
      // 1. Get default status
      const defaultStatus = await tx.caseStatus.findFirst({
        where: { name: 'Pending' },
      });

      if (!defaultStatus) {
        throw new Error(ErrorMessages.DEFAULT_STATUS_NOT_FOUND);
      }

      // 2. Create addresses in parallel
      const [claimantAddress, insuranceAddress, legalAddress] = await Promise.all([
        tx.address.create({
          data: {
            address: formData.step1?.addressLookup || '',
            street: formData.step1?.street || null,
            city: formData.step1?.city || null,
            province: formData.step1?.province || null,
            postalCode: formData.step1?.postalCode || null,
            suite: formData.step1?.suite || null,
          },
        }),
        formData.step2?.insuranceAddressLookup ||
        formData.step2?.insuranceStreetAddress ||
        formData.step2?.insuranceCity
          ? tx.address.create({
              data: {
                address: formData.step2?.insuranceAddressLookup || '',
                street: formData.step2?.insuranceStreetAddress || null,
                city: formData.step2?.insuranceCity || null,
                suite: formData.step2?.insuranceAptUnitSuite || null,
                province: null,
                postalCode: null,
              },
            })
          : Promise.resolve(null),
        formData.step3?.legalAddressLookup ||
        formData.step3?.legalStreetAddress ||
        formData.step3?.legalCity
          ? tx.address.create({
              data: {
                address: formData.step3?.legalAddressLookup || '',
                street: formData.step3?.legalStreetAddress || null,
                city: formData.step3?.legalCity || null,
                province: formData.step3?.legalProvinceState || null,
                postalCode: formData.step3?.legalPostalCode || null,
                suite: formData.step3?.legalAptUnitSuite || null,
              },
            })
          : Promise.resolve(null),
      ]);

      if (!formData.step2?.insuranceDateOfLoss) {
        throw new Error('Insurance date of loss is required');
      }
      // 3. Create entities in parallel
      const [claimant, insurance, legalRep, caseType, currentAccount] = await Promise.all([
        tx.claimant.create({
          data: {
            firstName: formData.step1?.firstName || '',
            lastName: formData.step1?.lastName || '',
            dateOfBirth: formData.step1?.dateOfBirth ? new Date(formData.step1.dateOfBirth) : null,
            gender: formData.step1?.gender || null,
            phoneNumber: formData.step1?.phoneNumber || null,
            emailAddress: formData.step1?.emailAddress || null,
            relatedCasesDetails: formData.step1?.relatedCasesDetails || null,
            familyDoctorName: formData.step1?.familyDoctorName || null,
            familyDoctorEmailAddress: formData.step1?.familyDoctorEmail || null,
            familyDoctorPhoneNumber: formData.step1?.familyDoctorPhone || null,
            familyDoctorFaxNumber: formData.step1?.familyDoctorFax || null,
            addressId: claimantAddress.id,
          },
        }),

        tx.insurance.create({
          data: {
            emailAddress: formData.step2?.insuranceEmailAddress || '',
            companyName: formData.step2?.insuranceCompanyName || '',
            contactPersonName: formData.step2?.insuranceAdjusterContact || '',
            policyNumber: formData.step2?.insurancePolicyNo || '',
            claimNumber: formData.step2?.insuranceClaimNo || '',
            dateOfLoss: new Date(formData.step2?.insuranceDateOfLoss),
            policyHolderIsClaimant: formData.step2?.policyHolderSameAsClaimant || false,
            policyHolderFirstName: formData.step2?.policyHolderFirstName || '',
            policyHolderLastName: formData.step2?.policyHolderLastName || '',
            phoneNumber: formData.step2?.insurancePhone || '',
            faxNumber: formData.step2?.insuranceFaxNo || '',
            addressId: insuranceAddress ? insuranceAddress.id : null,
          },
        }),
        formData.step3?.legalCompanyName || formData.step3?.legalContactPerson
          ? tx.legalRepresentative.create({
              data: {
                companyName: formData.step3?.legalCompanyName || null,
                contactPersonName: formData.step3?.legalContactPerson || null,
                phoneNumber: formData.step3?.legalPhone || null,
                faxNumber: formData.step3?.legalFaxNo || null,
                addressId: legalAddress ? legalAddress.id : null,
              },
            })
          : Promise.resolve(null),
        tx.caseType.findFirst({
          where: { id: formData.step4?.caseTypes?.[0]?.id },
        }),
        tx.account.findUnique({
          where: { id: currentUser.accountId },
          include: { managers: { include: { organization: true } } },
        }),
      ]);

      const organizationId = currentAccount?.managers?.[0]?.organizationId || null;
      const legalRepId = legalRep ? legalRep.id : null;

      // 4. Create the main case record
      const caseRecord = await tx.case.create({
        data: {
          organizationId,
          claimantId: claimant.id,
          insuranceId: insurance.id,
          legalRepresentativeId: legalRepId,
          caseTypeId: caseType?.id || null,
          reason: formData.step5?.reasonForReferral || null,
          consentForSubmission: formData.step7?.consentForSubmission || false,
          isDraft: formData.step7?.isDraft || false,
        },
      });

      // 5. OPTIMIZED: Create examinations sequentially but services in parallel
      const createdExaminations = [];
      for (let i = 0; i < (formData.step5?.examinations || []).length; i++) {
        const examData = formData.step5?.examinations[i];

        if (!caseType?.id) {
          throw new Error('Case type is required for creating examinations');
        }
        const caseNumber = await createCaseNumber(caseType?.id);

        let urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
        if (examData?.urgencyLevel) {
          const upper = examData?.urgencyLevel.toUpperCase();
          if (upper === 'HIGH' || upper === 'MEDIUM' || upper === 'LOW') {
            urgencyLevel = upper;
          }
        }

        const examination = await tx.examination.create({
          data: {
            case: { connect: { id: caseRecord.id } },
            caseNumber,
            examinationType: { connect: { id: examData?.examinationTypeId } },
            dueDate: examData?.dueDate ? new Date(examData?.dueDate) : null,
            notes: examData?.instructions || null,
            additionalNotes: null,
            urgencyLevel,
            status: { connect: { id: defaultStatus.id } },
            preference: 'EITHER',
            supportPerson: false,
          },
        });

        // Create services for this exam in parallel
        if (examData?.services?.length) {
          const enabledServices = examData.services.filter(service => service.enabled);

          // Pre-fetch languages to avoid multiple queries
          const languageNames = enabledServices
            .filter(s => s.type === 'interpreter' && s.details?.language)
            .map(s => s.details!.language!);

          const existingLanguages =
            languageNames.length > 0
              ? await tx.language.findMany({
                  where: { name: { in: languageNames } },
                })
              : [];

          await Promise.all(
            enabledServices.map(async service => {
              const examService = await tx.examinationServices.create({
                data: {
                  examinationId: examination.id,
                  type: service.type,
                  enabled: true,
                },
              });

              if (service.type === 'interpreter' && service.details?.language) {
                let language = existingLanguages.find(l => l.name === service.details!.language);
                if (!language) {
                  language = await tx.language.create({
                    data: { name: service.details.language },
                  });
                }
                await tx.examinationInterpreter.create({
                  data: {
                    examinationServiceId: examService.id,
                    languageId: language.id,
                  },
                });
              }
              if (service.type === 'transportation') {
                let transportAddressId: string | null = null;
                if (service.details?.pickupAddress || service.details?.streetAddress) {
                  const transportAddress = await tx.address.create({
                    data: {
                      address: service.details?.pickupAddress || '',
                      street: service.details?.streetAddress || null,
                      suite: service.details?.aptUnitSuite || null,
                      city: service.details?.city || null,
                      province: service.details?.province || null,
                      postalCode: service.details?.postalCode || null,
                    },
                  });
                  transportAddressId = transportAddress.id;
                }
                await tx.examinationTransport.create({
                  data: {
                    examinationServiceId: examService.id,
                    pickupAddressId: transportAddressId,
                    rawLookup: service.details?.pickupAddress || null,
                    notes: null,
                  },
                });
              }
            })
          );
        }

        createdExaminations.push(examination);
      }

      // 6. Create documents in parallel (but limit concurrency if many files)
      const createdDocuments = await Promise.all(
        (formData.step6?.files || []).map(async file => {
          const document = await tx.documents.create({
            data: {
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
            },
          });
          await tx.caseDocument.create({
            data: {
              caseId: caseRecord.id,
              documentId: document.id,
            },
          });
          return document;
        })
      );

      return {
        success: true,
        data: {
          caseId: caseRecord.id,
          claimantId: claimant.id,
          insuranceId: insurance.id,
          legalRepresentativeId: legalRepId,
          examinations: createdExaminations,
          documents: createdDocuments,
        },
      };
    },
    {
      timeout: 30000,
      maxWait: 30000,
    }
  );
};

const getCaseTypes = async () => {
  try {
    const caseTypes = await prisma.caseType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return caseTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching case types');
  }
};

const getCaseDetails = async (caseId: string) => {
  try {
    const caseDetails = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        claimant: {
          include: { address: true },
        },
        insurance: {
          include: { address: true },
        },
        legalRepresentative: {
          include: { address: true },
        },
        caseType: true,
        examinations: {
          include: { examinationType: true, status: true },
        },
      },
    });
    return caseDetails;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching case details');
  }
};

const getCases = async () => {
  const cases = await prisma.case.findMany({
    where: { deletedAt: null },
    include: {
      claimant: true,
      insurance: true,
      legalRepresentative: true,
      caseType: true,
      examinations: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return cases;
};

const imeReferralService = {
  createCase,
  getCaseTypes,
  getCaseDetails,
  getCases,
};

export default imeReferralService;
