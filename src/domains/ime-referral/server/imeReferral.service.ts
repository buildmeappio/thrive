import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';
import type { IMEFormData } from '@/store/useImeReferral';
import type { ClaimantPreference } from '@prisma/client';
import { DocumentService } from '@/services/fileUploadService';

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
  if (!formData.step1?.claimType) {
    throw new Error('Claim Type is required');
  }
  const claimTypeId = formData.step1.claimType;

  // Handle file uploads using DocumentService
  let uploadResult: { success: boolean; documents: any[]; uploadedFiles: any[]; error?: string } = {
    success: true,
    documents: [],
    uploadedFiles: [],
  };

  if (formData.step6?.files && formData.step6.files.length > 0) {
    try {
      uploadResult = await DocumentService.uploadAndCreateDocuments({
        files: formData.step6.files,
      });

      if (!uploadResult.success) {
        throw new Error(`File upload failed: ${uploadResult.error}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload documents. Please try again.');
    }
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
            claimTypeId: claimTypeId,
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
          where: { id: formData.step5?.examinationType },
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
          caseTypeId: caseType?.id,
          reason: formData.step5?.reasonForReferral || null,
          consentForSubmission: formData.step7?.consentForSubmission || false,
          isDraft: formData.step7?.isDraft || false,
        },
      });

      // 5. Create examinations sequentially but services in parallel
      const createdExaminations = [];
      for (let i = 0; i < (formData.step5?.examinations || []).length; i++) {
        const examData = formData.step5?.examinations[i];
        const caseTypeInput = formData.step4?.caseTypes?.[i];

        if (!caseTypeInput) throw new Error('Case type is required for each examination');

        const caseNumber = await getNextCaseNumberForExamType(caseTypeInput.id);

        const examination = await tx.examination.create({
          data: {
            case: { connect: { id: caseRecord.id } },
            caseNumber,
            examinationType: { connect: { id: examData?.examinationTypeId } },
            dueDate: examData?.dueDate ? new Date(examData.dueDate) : null,
            notes: examData?.instructions || null,
            urgencyLevel: examData?.urgencyLevel?.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW' | null,
            status: { connect: { id: defaultStatus.id } },
            preference: (examData?.locationType?.toUpperCase() as ClaimantPreference) || '',
            supportPerson: examData?.supportPerson,
            additionalNotes: examData?.additionalNotes || '',
          },
        });

        if (examData?.selectedBenefits && examData.selectedBenefits.length > 0) {
          await tx.examinationSelectedBenefit.createMany({
            data: examData.selectedBenefits.map(benefitId => ({
              examinationId: examination.id,
              benefitId,
            })),
          });
        }

        // Create services for this exam in parallel
        if (formData.step5?.examinations[i].services) {
          const enabledServices = formData.step5.examinations[i].services.filter(
            service => service.enabled
          );

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

      // 6. Associate uploaded documents with the case
      if (uploadResult.success && uploadResult.documents.length > 0) {
        await Promise.all(
          uploadResult.documents.map(async document => {
            await tx.caseDocument.create({
              data: {
                caseId: caseRecord.id,
                documentId: document.id,
              },
            });
          })
        );
      }

      return {
        success: true,
        data: {
          caseId: caseRecord.id,
          claimantId: claimant.id,
          insuranceId: insurance.id,
          legalRepresentativeId: legalRepId,
          examinations: createdExaminations,
          documents: uploadResult.documents,
          uploadedFiles: uploadResult.uploadedFiles,
        },
      };
    },
    {
      timeout: 60000,
      maxWait: 60000,
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
    const examination = await prisma.examination.findUnique({
      where: { id: caseId },
      include: {
        examinationType: true,
        status: true,
        examiner: {
          include: {
            user: true,
          },
        },
        assignTo: {
          include: {
            user: true,
          },
        },
        services: {
          where: { enabled: true },
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
        case: {
          include: {
            organization: {
              select: {
                name: true,
              },
            },
            claimant: {
              include: {
                address: true,
                claimType: true,
              },
            },
            insurance: {
              include: {
                address: true,
              },
            },
            legalRepresentative: {
              include: {
                address: true,
              },
            },
            caseType: true,
            documents: {
              include: {
                document: true,
              },
            },
          },
        },
      },
    });

    if (!examination) {
      throw HttpError.notFound('Examination not found');
    }

    return examination;
  } catch (error) {
    console.error('Database error in getCaseDetails:', error);
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
      examinations: {
        include: {
          examinationType: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return cases;
};

const getNextCaseNumberForExamType = async (examTypeId: string) => {
  const latestExams = await prisma.examination.findMany({
    where: { examinationTypeId: examTypeId },
    select: {
      caseNumber: true,
      examinationType: {
        select: {
          id: true,
          shortForm: true,
        },
      },
    },
    take: 1,
    orderBy: { createdAt: 'desc' },
  });
  if (latestExams.length === 0) {
    return getInitialCaseNumberForExamType(examTypeId);
  }

  const lastCaseNumber = latestExams[0]?.caseNumber;
  if (!lastCaseNumber) {
    return getInitialCaseNumberForExamType(examTypeId);
  }

  const [shortForm, year, seq] = lastCaseNumber.split('-');
  const currentYear = new Date().getFullYear().toString();
  const isSameYear = year === currentYear;

  if (!isSameYear) {
    return getInitialCaseNumberForExamType(examTypeId);
  }

  const lastSeq = parseInt(seq, 10);

  return `${shortForm}-${currentYear}-${isNaN(lastSeq) ? 1 : lastSeq + 1}`;
};

const getInitialCaseNumberForExamType = async (examTypeId: string) => {
  const examType = await prisma.examinationType.findFirst({
    where: { id: examTypeId },
  });

  if (!examType) {
    throw HttpError.notFound('Exam Type not found');
  }

  const year = new Date().getFullYear().toString();

  return `${examType.shortForm}-${year}-1`;
};

const getClaimTypes = async () => {
  try {
    const claimTypes = await prisma.claimType.findMany({
      where: {
        deletedAt: null,
      },
    });
    return claimTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.FAILED_TO_GET_CLAIM_TYPES);
  }
};

const getExaminationBenefits = async (examinationTypeId: string) => {
  try {
    const examinationType = await prisma.examinationType.findFirst({
      where: {
        id: examinationTypeId,
        deletedAt: null,
      },
      select: {
        benefits: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            benefit: true,
          },
        },
      },
    });

    if (!examinationType) {
      throw HttpError.notFound(ErrorMessages.EXAMINATION_TYPE_NOT_FOUND);
    }

    return examinationType.benefits;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.FAILED_TO_GET_EXAMINATION_TYPES);
  }
};

const getReferralDetails = async (caseId: string) => {
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
    if (!caseDetails) {
      throw HttpError.notFound('Case details not found');
    }
    return caseDetails;
  } catch (error) {
    console.error('Database error in getCaseDetails:', error);
    throw HttpError.handleServiceError(error, 'Error fetching case details');
  }
};

const getCaseList = async (status?: string, take?: number) => {
  try {
    const examinations = await prisma.examination.findMany({
      where: status ? { status: { name: status } } : undefined,
      ...(take && { take }),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        case: {
          include: {
            claimant: {
              include: {
                claimType: true,
              },
            },
          },
        },
        examinationType: true,
        status: true,
        examiner: {
          include: {
            user: true,
          },
        },
      },
    });

    const caseData = examinations.map(exam => ({
      id: exam.id,
      number: exam.caseNumber,
      claimant: `${exam.case.claimant.firstName} ${exam.case.claimant.lastName}`,
      claimType: exam.case.claimant.claimType.name,
      status: exam.status.name,
      specialty: exam.examinationType.name,
      examiner: exam.examiner && `${exam.examiner.user.firstName} ${exam.examiner.user.lastName}`,
      submittedAt: exam.createdAt.toISOString(),
    }));

    if (!caseData || caseData.length === 0) {
      throw HttpError.notFound(ErrorMessages.CASES_NOT_FOUND);
    }

    return caseData;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.FAILED_TO_GET_CASE_LIST);
  }
};

const getCaseStatuses = async () => {
  try {
    const caseStatuses = await prisma.caseStatus.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return caseStatuses;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching case ststuses');
  }
};

const imeReferralService = {
  createCase,
  getCaseTypes,
  getCaseDetails,
  getCases,
  getClaimTypes,
  getExaminationBenefits,
  getReferralDetails,
  getCaseList,
  getCaseStatuses,
};

export default imeReferralService;
