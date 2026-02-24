import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';
import type { IMEFormData } from '@/store/useImeReferral';
import type { ClaimantPreference } from '@thrive/database';
import { DocumentService } from '@/services/fileUploadService';
import { getE164PhoneNumber } from '@/utils/formatNumbers';
import log from '@/utils/log';
import { CaseStatus } from '@/constants/CaseStatus';
import { moveFilesToTemp } from '@/lib/s3-actions';
import configurationService from '@/services/configuration.service';

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
      log.error('Error uploading files:', error);
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

      // 3. Create claimant, insurance, and legal rep ONCE (not per examination)
      const [claimant, insurance, legalRep, caseType, currentAccount] = await Promise.all([
        tx.claimant.create({
          data: {
            firstName: formData.step1?.firstName || '',
            lastName: formData.step1?.lastName || '',
            dateOfBirth: formData.step1?.dateOfBirth ? new Date(formData.step1.dateOfBirth) : null,
            gender: formData.step1?.gender || null,
            phoneNumber: getE164PhoneNumber(formData.step1?.phoneNumber) || null,
            emailAddress: formData.step1?.emailAddress || null,
            relatedCasesDetails: formData.step1?.relatedCasesDetails || null,
            familyDoctorName: formData.step1?.familyDoctorName || null,
            familyDoctorEmailAddress: formData.step1?.familyDoctorEmail || null,
            familyDoctorPhoneNumber: getE164PhoneNumber(formData.step1?.familyDoctorPhone) || null,
            familyDoctorFaxNumber: getE164PhoneNumber(formData.step1?.familyDoctorFax) || null,
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
            phoneNumber: getE164PhoneNumber(formData.step2?.insurancePhone) || '',
            faxNumber: getE164PhoneNumber(formData.step2?.insuranceFaxNo) || '',
            addressId: insuranceAddress ? insuranceAddress.id : null,
          },
        }),
        formData.step3?.legalCompanyName || formData.step3?.legalContactPerson
          ? tx.legalRepresentative.create({
              data: {
                companyName: formData.step3?.legalCompanyName || null,
                contactPersonName: formData.step3?.legalContactPerson || null,
                phoneNumber: getE164PhoneNumber(formData.step3?.legalPhone) || null,
                faxNumber: getE164PhoneNumber(formData.step3?.legalFaxNo) || null,
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

      // 4. Create the main case record
      const caseRecord = await tx.case.create({
        data: {
          organization: organizationId ? { connect: { id: organizationId } } : undefined,
          caseType: caseType?.id ? { connect: { id: caseType.id } } : undefined,
          reason: formData.step5?.reasonForReferral || null,
          consentForSubmission: formData.step7?.consentForSubmission || false,
          isDraft: formData.step7?.isDraft || false,
        },
      });

      // 5. Generate all case numbers sequentially first
      const caseNumbers: string[] = [];
      for (let i = 0; i < (formData.step5?.examinations || []).length; i++) {
        const caseTypeInput = formData.step4?.caseTypes?.[i];

        if (!caseTypeInput) throw new Error('Case type is required for each examination');

        const caseNumber = await getNextCaseNumberForExamType(caseTypeInput.id);
        caseNumbers.push(caseNumber);
      }

      // 6. Create all examinations in parallel - just link to existing entities
      const createdExaminations = await Promise.all(
        (formData.step5?.examinations || []).map(async (examData, i) => {
          const caseTypeInput = formData.step4?.caseTypes?.[i];

          if (!caseTypeInput) throw new Error('Case type is required for each examination');

          // Use pre-generated case number
          const caseNumber = caseNumbers[i];

          // Validate due date - must be at least X days from today
          if (examData?.dueDate) {
            const dueDateOffsetDays = await configurationService.getOrganizationDueDateOffset();
            const selectedDueDate = new Date(examData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day

            const minimumDueDate = new Date(today);
            minimumDueDate.setDate(today.getDate() + dueDateOffsetDays);

            log.info('[Create Case] Due date validation:', {
              selectedDueDate: selectedDueDate.toISOString(),
              today: today.toISOString(),
              minimumDueDate: minimumDueDate.toISOString(),
              dueDateOffsetDays,
              isValid: selectedDueDate >= minimumDueDate,
            });

            if (selectedDueDate < minimumDueDate) {
              const formattedMinDate = minimumDueDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              throw new Error(
                `Due date must be at least ${dueDateOffsetDays} days from today. Minimum allowed date is ${formattedMinDate}.`
              );
            }
          }

          const examination = await tx.examination.create({
            data: {
              case: { connect: { id: caseRecord.id } },
              caseNumber,
              examinationType: { connect: { id: examData?.examinationTypeId } },
              dueDate: examData?.dueDate ? new Date(examData.dueDate) : null,
              notes: examData?.instructions || null,
              urgencyLevel: examData?.urgencyLevel?.toUpperCase() as
                | 'HIGH'
                | 'MEDIUM'
                | 'LOW'
                | null,
              status: { connect: { id: defaultStatus.id } },
              preference: (examData?.locationType?.toUpperCase() as ClaimantPreference) || '',
              supportPerson: examData?.supportPerson,
              additionalNotes: examData?.additionalNotes || '',

              // Link to the shared claimant, insurance, and legal rep
              claimant: { connect: { id: claimant.id } },
              insurance: { connect: { id: insurance.id } },
              legalRepresentative: legalRep ? { connect: { id: legalRep.id } } : undefined,
            },
          });

          // Create selected benefits
          if (examData?.selectedBenefits && examData.selectedBenefits.length > 0) {
            await tx.examinationSelectedBenefit.createMany({
              data: examData.selectedBenefits.map(benefitId => ({
                examinationId: examination.id,
                benefitId,
              })),
            });
          }

          // Create services for this exam in parallel
          if (examData.services) {
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

          return examination;
        })
      );

      // 7. Associate uploaded documents with the case
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

const updateExamination = async (examinationId: string, formData: IMEFormData, orgId: string) => {
  const examination = await prisma.examination.findUnique({
    where: { id: examinationId },
    include: {
      case: {
        select: {
          id: true,
          organizationId: true,
        },
      },
    },
  });

  if (!examination) {
    throw new Error('Examination not found');
  }

  if (examination.case.organizationId !== orgId) {
    throw new Error('Unauthorized: This examination belongs to another organization');
  }

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

  // Handle file uploads
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
      log.error('Error uploading files:', error);
      throw new Error('Failed to upload documents. Please try again.');
    }
  }

  // Handle deleted documents - move to temp folder
  let deletionResult: {
    success: boolean;
    movedFiles: string[];
    failedFiles: { filename: string; error: string }[];
  } = {
    success: true,
    movedFiles: [],
    failedFiles: [],
  };

  if (formData.step6?.deletedDocuments && formData.step6.deletedDocuments.length > 0) {
    try {
      deletionResult = await moveFilesToTemp(formData.step6.deletedDocuments);

      if (!deletionResult.success) {
        log.error('Some files failed to move to temp:', deletionResult.failedFiles);
      } else {
        log.info('✅ Successfully moved files to temp:', deletionResult.movedFiles);
      }
    } catch (error) {
      log.error('Error moving files to temp:', error);
    }
  }

  return prisma.$transaction(
    async tx => {
      // 1. Get existing examination with relationships
      const existingExam = await tx.examination.findUnique({
        where: { id: examinationId },
        include: {
          claimant: { include: { address: true } },
          insurance: { include: { address: true } },
          legalRepresentative: { include: { address: true } },
          services: {
            include: {
              interpreter: true,
              transport: { include: { pickupAddress: true } },
            },
          },
          selectedBenefits: true,
        },
      });

      if (!existingExam) {
        throw new Error('Existing examination not found');
      }

      // 2. Check if there are other examinations in the same case
      const otherExaminationsInCase = await tx.examination.findMany({
        where: {
          caseId: existingExam.caseId,
          id: { not: examinationId },
        },
        select: {
          id: true,
          claimantId: true,
          insuranceId: true,
          legalRepresentativeId: true,
        },
      });

      // Check individually for each entity
      const hasOtherExamsWithSameClaimant = otherExaminationsInCase.some(
        exam => exam.claimantId === existingExam.claimantId
      );
      const hasOtherExamsWithSameInsurance = otherExaminationsInCase.some(
        exam => exam.insuranceId === existingExam.insuranceId
      );
      const hasOtherExamsWithSameLegal = otherExaminationsInCase.some(
        exam => exam.legalRepresentativeId === existingExam.legalRepresentativeId
      );

      // 3. Helper function to check if claimant data has changed
      const claimTypeId = formData.step1?.claimType;

      const hasClaimantChanged = () => {
        const current = existingExam.claimant;
        return (
          current.firstName !== (formData.step1?.firstName || '') ||
          current.lastName !== (formData.step1?.lastName || '') ||
          current.dateOfBirth?.toISOString() !==
            (formData.step1?.dateOfBirth
              ? new Date(formData.step1.dateOfBirth).toISOString()
              : null) ||
          current.gender !== (formData.step1?.gender || null) ||
          current.phoneNumber !== (getE164PhoneNumber(formData.step1?.phoneNumber) || null) ||
          current.emailAddress !== (formData.step1?.emailAddress || null) ||
          current.relatedCasesDetails !== (formData.step1?.relatedCasesDetails || null) ||
          current.familyDoctorName !== (formData.step1?.familyDoctorName || null) ||
          current.familyDoctorEmailAddress !== (formData.step1?.familyDoctorEmail || null) ||
          current.familyDoctorPhoneNumber !==
            (getE164PhoneNumber(formData.step1?.familyDoctorPhone) || null) ||
          current.familyDoctorFaxNumber !==
            (getE164PhoneNumber(formData.step1?.familyDoctorFax) || null) ||
          current.claimTypeId !== claimTypeId ||
          current.address.address !== (formData.step1?.addressLookup || '') ||
          current.address.street !== (formData.step1?.street || null) ||
          current.address.city !== (formData.step1?.city || null) ||
          current.address.province !== (formData.step1?.province || null) ||
          current.address.postalCode !== (formData.step1?.postalCode || null) ||
          current.address.suite !== (formData.step1?.suite || null)
        );
      };

      // 4. Helper function to check if insurance data has changed
      const hasInsuranceChanged = () => {
        const current = existingExam.insurance;
        if (!current) return true;

        return (
          current.emailAddress !== (formData.step2?.insuranceEmailAddress || '') ||
          current.companyName !== (formData.step2?.insuranceCompanyName || '') ||
          current.contactPersonName !== (formData.step2?.insuranceAdjusterContact || '') ||
          current.policyNumber !== (formData.step2?.insurancePolicyNo || '') ||
          current.claimNumber !== (formData.step2?.insuranceClaimNo || '') ||
          current.dateOfLoss?.toISOString() !==
            (formData.step2?.insuranceDateOfLoss
              ? new Date(formData.step2.insuranceDateOfLoss).toISOString()
              : null) ||
          current.policyHolderIsClaimant !==
            (formData.step2?.policyHolderSameAsClaimant || false) ||
          current.policyHolderFirstName !== (formData.step2?.policyHolderFirstName || '') ||
          current.policyHolderLastName !== (formData.step2?.policyHolderLastName || '') ||
          current.phoneNumber !== (getE164PhoneNumber(formData.step2?.insurancePhone) || '') ||
          current.faxNumber !== (getE164PhoneNumber(formData.step2?.insuranceFaxNo) || '') ||
          (current.address &&
            (current.address.address !== (formData.step2?.insuranceAddressLookup || '') ||
              current.address.street !== (formData.step2?.insuranceStreetAddress || null) ||
              current.address.city !== (formData.step2?.insuranceCity || null) ||
              current.address.suite !== (formData.step2?.insuranceAptUnitSuite || null)))
        );
      };

      // 5. Helper function to check if legal rep data has changed
      const hasLegalChanged = () => {
        const current = existingExam.legalRepresentative;

        // If there was no legal rep before and now there is data, it's changed
        if (!current && (formData.step3?.legalCompanyName || formData.step3?.legalContactPerson)) {
          return true;
        }

        // If there was a legal rep before and now there's no data, it's changed
        if (current && !formData.step3?.legalCompanyName && !formData.step3?.legalContactPerson) {
          return true;
        }

        if (!current) return false;

        return (
          current.companyName !== (formData.step3?.legalCompanyName || null) ||
          current.contactPersonName !== (formData.step3?.legalContactPerson || null) ||
          current.phoneNumber !== (getE164PhoneNumber(formData.step3?.legalPhone) || null) ||
          current.faxNumber !== (getE164PhoneNumber(formData.step3?.legalFaxNo) || null) ||
          (current.address &&
            (current.address.address !== (formData.step3?.legalAddressLookup || '') ||
              current.address.street !== (formData.step3?.legalStreetAddress || null) ||
              current.address.city !== (formData.step3?.legalCity || null) ||
              current.address.province !== (formData.step3?.legalProvinceState || null) ||
              current.address.postalCode !== (formData.step3?.legalPostalCode || null) ||
              current.address.suite !== (formData.step3?.legalAptUnitSuite || null)))
        );
      };

      // 6. Handle Claimant - Create new ONLY if shared with other exams AND data changed
      let claimantId = existingExam.claimantId;

      if (hasOtherExamsWithSameClaimant && hasClaimantChanged()) {
        // Create new claimant and address
        const claimantAddress = await tx.address.create({
          data: {
            address: formData.step1?.addressLookup || '',
            street: formData.step1?.street || null,
            city: formData.step1?.city || null,
            province: formData.step1?.province || null,
            postalCode: formData.step1?.postalCode || null,
            suite: formData.step1?.suite || null,
          },
        });

        if (!claimTypeId) {
          throw new Error('Claim type id requires');
        }

        const newClaimant = await tx.claimant.create({
          data: {
            firstName: formData.step1?.firstName || '',
            lastName: formData.step1?.lastName || '',
            dateOfBirth: formData.step1?.dateOfBirth ? new Date(formData.step1.dateOfBirth) : null,
            gender: formData.step1?.gender || null,
            phoneNumber: getE164PhoneNumber(formData.step1?.phoneNumber) || null,
            emailAddress: formData.step1?.emailAddress || null,
            relatedCasesDetails: formData.step1?.relatedCasesDetails || null,
            familyDoctorName: formData.step1?.familyDoctorName || null,
            familyDoctorEmailAddress: formData.step1?.familyDoctorEmail || null,
            familyDoctorPhoneNumber: getE164PhoneNumber(formData.step1?.familyDoctorPhone) || null,
            familyDoctorFaxNumber: getE164PhoneNumber(formData.step1?.familyDoctorFax) || null,
            addressId: claimantAddress.id,
            claimTypeId: claimTypeId,
          },
        });

        claimantId = newClaimant.id;
      } else {
        // Update existing claimant
        const claimantAddress = await tx.address.upsert({
          where: { id: existingExam.claimant.addressId },
          update: {
            address: formData.step1?.addressLookup || '',
            street: formData.step1?.street || null,
            city: formData.step1?.city || null,
            province: formData.step1?.province || null,
            postalCode: formData.step1?.postalCode || null,
            suite: formData.step1?.suite || null,
          },
          create: {
            address: formData.step1?.addressLookup || '',
            street: formData.step1?.street || null,
            city: formData.step1?.city || null,
            province: formData.step1?.province || null,
            postalCode: formData.step1?.postalCode || null,
            suite: formData.step1?.suite || null,
          },
        });

        await tx.claimant.update({
          where: { id: existingExam.claimantId },
          data: {
            firstName: formData.step1?.firstName || '',
            lastName: formData.step1?.lastName || '',
            dateOfBirth: formData.step1?.dateOfBirth ? new Date(formData.step1.dateOfBirth) : null,
            gender: formData.step1?.gender || null,
            phoneNumber: getE164PhoneNumber(formData.step1?.phoneNumber) || null,
            emailAddress: formData.step1?.emailAddress || null,
            relatedCasesDetails: formData.step1?.relatedCasesDetails || null,
            familyDoctorName: formData.step1?.familyDoctorName || null,
            familyDoctorEmailAddress: formData.step1?.familyDoctorEmail || null,
            familyDoctorPhoneNumber: getE164PhoneNumber(formData.step1?.familyDoctorPhone) || null,
            familyDoctorFaxNumber: getE164PhoneNumber(formData.step1?.familyDoctorFax) || null,
            addressId: claimantAddress.id,
            claimTypeId: claimTypeId,
          },
        });
      }

      // 7. Handle Insurance - Create new ONLY if shared with other exams AND data changed
      let insuranceId = existingExam.insuranceId;

      if (!formData.step2?.insuranceDateOfLoss) {
        throw new Error('Insurance date of loss is required');
      }

      if (hasOtherExamsWithSameInsurance && hasInsuranceChanged()) {
        // Create new insurance and address
        let insuranceAddress = null;
        if (
          formData.step2?.insuranceAddressLookup ||
          formData.step2?.insuranceStreetAddress ||
          formData.step2?.insuranceCity
        ) {
          insuranceAddress = await tx.address.create({
            data: {
              address: formData.step2?.insuranceAddressLookup || '',
              street: formData.step2?.insuranceStreetAddress || null,
              city: formData.step2?.insuranceCity || null,
              suite: formData.step2?.insuranceAptUnitSuite || null,
              province: null,
              postalCode: null,
            },
          });
        }

        const newInsurance = await tx.insurance.create({
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
            phoneNumber: getE164PhoneNumber(formData.step2?.insurancePhone) || '',
            faxNumber: getE164PhoneNumber(formData.step2?.insuranceFaxNo) || '',
            addressId: insuranceAddress?.id || null,
          },
        });

        insuranceId = newInsurance.id;
      } else {
        // Update existing insurance
        const insuranceAddress = existingExam.insurance?.addressId
          ? await tx.address.update({
              where: { id: existingExam.insurance.addressId },
              data: {
                address: formData.step2?.insuranceAddressLookup || '',
                street: formData.step2?.insuranceStreetAddress || null,
                city: formData.step2?.insuranceCity || null,
                suite: formData.step2?.insuranceAptUnitSuite || null,
                province: null,
                postalCode: null,
              },
            })
          : null;

        await tx.insurance.update({
          where: { id: existingExam.insuranceId! },
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
            phoneNumber: getE164PhoneNumber(formData.step2?.insurancePhone) || '',
            faxNumber: getE164PhoneNumber(formData.step2?.insuranceFaxNo) || '',
            addressId: insuranceAddress?.id || null,
          },
        });
      }

      // 8. Handle Legal Representative - Create new ONLY if shared with other exams AND data changed
      let legalRepresentativeId = existingExam.legalRepresentativeId;

      if (hasOtherExamsWithSameLegal && hasLegalChanged()) {
        // Create new legal rep
        if (formData.step3?.legalCompanyName || formData.step3?.legalContactPerson) {
          let legalAddress = null;
          if (
            formData.step3?.legalAddressLookup ||
            formData.step3?.legalStreetAddress ||
            formData.step3?.legalCity
          ) {
            legalAddress = await tx.address.create({
              data: {
                address: formData.step3?.legalAddressLookup || '',
                street: formData.step3?.legalStreetAddress || null,
                city: formData.step3?.legalCity || null,
                province: formData.step3?.legalProvinceState || null,
                postalCode: formData.step3?.legalPostalCode || null,
                suite: formData.step3?.legalAptUnitSuite || null,
              },
            });
          }

          const newLegalRep = await tx.legalRepresentative.create({
            data: {
              companyName: formData.step3?.legalCompanyName || null,
              contactPersonName: formData.step3?.legalContactPerson || null,
              phoneNumber: getE164PhoneNumber(formData.step3?.legalPhone) || null,
              faxNumber: getE164PhoneNumber(formData.step3?.legalFaxNo) || null,
              addressId: legalAddress?.id || null,
            },
          });

          legalRepresentativeId = newLegalRep.id;
        } else {
          legalRepresentativeId = null;
        }
      } else {
        // Update existing legal rep
        if (existingExam.legalRepresentativeId) {
          let legalAddress;
          if (existingExam.legalRepresentative?.addressId) {
            legalAddress = await tx.address.update({
              where: { id: existingExam.legalRepresentative.addressId },
              data: {
                address: formData.step3?.legalAddressLookup || '',
                street: formData.step3?.legalStreetAddress || null,
                city: formData.step3?.legalCity || null,
                province: formData.step3?.legalProvinceState || null,
                postalCode: formData.step3?.legalPostalCode || null,
                suite: formData.step3?.legalAptUnitSuite || null,
              },
            });
          } else if (
            formData.step3?.legalAddressLookup ||
            formData.step3?.legalStreetAddress ||
            formData.step3?.legalCity
          ) {
            legalAddress = await tx.address.create({
              data: {
                address: formData.step3?.legalAddressLookup || '',
                street: formData.step3?.legalStreetAddress || null,
                city: formData.step3?.legalCity || null,
                province: formData.step3?.legalProvinceState || null,
                postalCode: formData.step3?.legalPostalCode || null,
                suite: formData.step3?.legalAptUnitSuite || null,
              },
            });
          }

          await tx.legalRepresentative.update({
            where: { id: existingExam.legalRepresentativeId },
            data: {
              companyName: formData.step3?.legalCompanyName || null,
              contactPersonName: formData.step3?.legalContactPerson || null,
              phoneNumber: getE164PhoneNumber(formData.step3?.legalPhone) || null,
              faxNumber: getE164PhoneNumber(formData.step3?.legalFaxNo) || null,
              addressId: legalAddress ? legalAddress.id : null,
            },
          });
        } else if (formData.step3?.legalCompanyName || formData.step3?.legalContactPerson) {
          let legalAddress;
          if (
            formData.step3?.legalAddressLookup ||
            formData.step3?.legalStreetAddress ||
            formData.step3?.legalCity
          ) {
            legalAddress = await tx.address.create({
              data: {
                address: formData.step3?.legalAddressLookup || '',
                street: formData.step3?.legalStreetAddress || null,
                city: formData.step3?.legalCity || null,
                province: formData.step3?.legalProvinceState || null,
                postalCode: formData.step3?.legalPostalCode || null,
                suite: formData.step3?.legalAptUnitSuite || null,
              },
            });
          }

          const newLegalRep = await tx.legalRepresentative.create({
            data: {
              companyName: formData.step3?.legalCompanyName || null,
              contactPersonName: formData.step3?.legalContactPerson || null,
              phoneNumber: getE164PhoneNumber(formData.step3?.legalPhone) || null,
              faxNumber: getE164PhoneNumber(formData.step3?.legalFaxNo) || null,
              addressId: legalAddress ? legalAddress.id : null,
            },
          });

          legalRepresentativeId = newLegalRep.id;
        }
      }

      // 9. Update examination with new/existing entity IDs
      const examinationTypeId = formData.step5?.examinations[0]?.examinationTypeId;

      if (examinationTypeId) {
        const examTypeExists = await tx.examinationType.findUnique({
          where: { id: examinationTypeId },
        });

        if (!examTypeExists) {
          throw new Error(`Invalid examination type ID: ${examinationTypeId}`);
        }
      }

      const pendingStatus = await tx.caseStatus.findFirst({
        where: {
          name: CaseStatus.PENDING,
          deletedAt: null,
        },
      });

      if (!pendingStatus) {
        throw new Error('Pending status not found in the system');
      }

      const examination = await tx.examination.update({
        where: { id: examinationId },
        data: {
          claimantId,
          insuranceId,
          legalRepresentativeId,
          statusId: pendingStatus.id,
          dueDate: formData.step5?.examinations[0]?.dueDate
            ? new Date(formData.step5.examinations[0].dueDate)
            : null,
          notes: formData.step5?.examinations[0]?.instructions || null,
          urgencyLevel: formData.step5?.examinations[0]?.urgencyLevel?.toUpperCase() as
            | 'HIGH'
            | 'MEDIUM'
            | 'LOW'
            | null,
          preference:
            (formData.step5?.examinations[0]?.locationType?.toUpperCase() as ClaimantPreference) ||
            '',
          supportPerson: formData.step5?.examinations[0]?.supportPerson,
          additionalNotes: formData.step5?.examinations[0]?.additionalNotes || '',
        },
      });

      // 10. Update services
      if (formData.step5?.examinations[0]?.services) {
        const incomingServices = formData.step5.examinations[0].services;
        const existingServices = existingExam.services || [];

        const existingServiceMap = new Map(
          existingServices.map(service => [service.type, service])
        );

        const languageNames = incomingServices
          .filter(s => s.type === 'interpreter' && s.enabled && s.details?.language)
          .map(s => s.details!.language!);

        const existingLanguages =
          languageNames.length > 0
            ? await tx.language.findMany({
                where: { name: { in: languageNames } },
              })
            : [];

        await Promise.all(
          incomingServices.map(async service => {
            const existingService = existingServiceMap.get(service.type);

            if (service.enabled) {
              if (existingService) {
                await tx.examinationServices.update({
                  where: { id: existingService.id },
                  data: { enabled: true },
                });

                if (service.type === 'interpreter' && service.details?.language) {
                  let language = existingLanguages.find(l => l.name === service.details!.language);
                  if (!language) {
                    language = await tx.language.create({
                      data: { name: service.details.language },
                    });
                  }

                  if (existingService.interpreter) {
                    await tx.examinationInterpreter.update({
                      where: { id: existingService.interpreter.id },
                      data: { languageId: language.id },
                    });
                  } else {
                    await tx.examinationInterpreter.create({
                      data: {
                        examinationServiceId: existingService.id,
                        languageId: language.id,
                      },
                    });
                  }
                }

                if (service.type === 'transportation') {
                  let transportAddressId: string | null = null;

                  if (service.details?.pickupAddress || service.details?.streetAddress) {
                    if (existingService.transport?.pickupAddressId) {
                      await tx.address.update({
                        where: { id: existingService.transport.pickupAddressId },
                        data: {
                          address: service.details?.pickupAddress || '',
                          street: service.details?.streetAddress || null,
                          suite: service.details?.aptUnitSuite || null,
                          city: service.details?.city || null,
                          province: service.details?.province || null,
                          postalCode: service.details?.postalCode || null,
                        },
                      });
                      transportAddressId = existingService.transport.pickupAddressId;
                    } else {
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
                  }

                  if (existingService.transport) {
                    await tx.examinationTransport.update({
                      where: { id: existingService.transport.id },
                      data: {
                        pickupAddressId: transportAddressId,
                        rawLookup: service.details?.pickupAddress || null,
                      },
                    });
                  } else {
                    await tx.examinationTransport.create({
                      data: {
                        examinationServiceId: existingService.id,
                        pickupAddressId: transportAddressId,
                        rawLookup: service.details?.pickupAddress || null,
                        notes: null,
                      },
                    });
                  }
                }
              } else {
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
              }

              existingServiceMap.delete(service.type);
            } else if (existingService) {
              await tx.examinationServices.delete({
                where: { id: existingService.id },
              });
              existingServiceMap.delete(service.type);
            }
          })
        );

        const servicesToDelete = Array.from(existingServiceMap.values());
        if (servicesToDelete.length > 0) {
          await tx.examinationServices.deleteMany({
            where: {
              id: { in: servicesToDelete.map(s => s.id) },
            },
          });
        }
      }

      // 11. Update selected benefits
      await tx.examinationSelectedBenefit.deleteMany({
        where: { examinationId },
      });

      if (formData.step5?.examinations[0]?.selectedBenefits) {
        await tx.examinationSelectedBenefit.createMany({
          data: formData.step5.examinations[0].selectedBenefits.map(benefitId => ({
            examinationId,
            benefitId,
          })),
        });
      }

      // 12. Handle deleted documents - remove from database
      if (deletionResult.success && deletionResult.movedFiles.length > 0) {
        // Find documents by name through the Documents model
        const documentsToDelete = await tx.documents.findMany({
          where: {
            name: { in: deletionResult.movedFiles },
          },
          select: { id: true },
        });

        if (documentsToDelete.length > 0) {
          const documentIds = documentsToDelete.map(doc => doc.id);

          // Delete the CaseDocument relationships first
          await tx.caseDocument.deleteMany({
            where: {
              documentId: { in: documentIds },
              caseId: existingExam.caseId,
            },
          });

          // Then delete the Document records
          await tx.documents.deleteMany({
            where: {
              id: { in: documentIds },
            },
          });

          log.info('✅ Deleted document records from database:', deletionResult.movedFiles);
        }
      }

      // 13. Update case documents (if new documents uploaded)
      if (uploadResult.success && uploadResult.documents.length > 0) {
        await Promise.all(
          uploadResult.documents.map(async document => {
            await tx.caseDocument.create({
              data: {
                caseId: existingExam.caseId,
                documentId: document.id,
              },
            });
          })
        );
      }

      return {
        success: true,
        data: {
          examinationId: examination.id,
          claimantId,
          insuranceId,
          legalRepresentativeId,
          documents: uploadResult.documents,
          deletedDocuments: deletionResult.movedFiles,
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
    const caseTypes = await prisma.examinationType.findMany({
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
        case: {
          include: {
            organization: {
              select: {
                name: true,
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
      },
    });

    if (!examination) {
      throw HttpError.notFound('Examination not found');
    }

    return examination;
  } catch (error) {
    log.error('Database error in getCaseDetails:', error);
    throw HttpError.handleServiceError(error, 'Error fetching case details');
  }
};

const getCases = async () => {
  const cases = await prisma.case.findMany({
    where: { deletedAt: null },
    include: {
      caseType: true,
      examinations: {
        include: {
          examinationType: true,
          status: true,
          claimant: {
            include: {
              claimType: true,
            },
          },
          insurance: true,
          legalRepresentative: true,
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

  // Use the actual shortForm from the database, not from the old case number
  const shortForm = latestExams[0].examinationType.shortForm;
  const [, year, seq] = lastCaseNumber.split('-');
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

const getCaseList = async (
  userId?: string,
  status?: string,
  take?: number,
  excludeStatuses?: string | string[]
) => {
  try {
    // Build status filter - prioritize status over excludeStatuses
    const statusFilter = status
      ? { status: { name: status } }
      : excludeStatuses
        ? {
            status: {
              name: Array.isArray(excludeStatuses)
                ? { notIn: excludeStatuses }
                : { not: excludeStatuses },
            },
          }
        : {};

    const examinations = await prisma.examination.findMany({
      where: {
        ...statusFilter,
        ...(userId && {
          case: {
            organization: {
              manager: {
                some: {
                  account: {
                    userId,
                  },
                },
              },
            },
          },
        }),
      },
      ...(take && { take }),
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          include: {
            organization: {
              include: {
                manager: {
                  where: userId ? { account: { userId } } : undefined,
                  include: {
                    account: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        claimant: {
          include: {
            claimType: true,
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

    const caseData = examinations.map(exam => {
      const creator = exam.case.organization?.manager[0];
      const claimant = exam.claimant;

      return {
        id: exam.id,
        number: exam.caseNumber,
        claimant: claimant ? `${claimant.firstName} ${claimant.lastName}` : 'N/A',
        claimType: claimant?.claimType?.name || 'N/A',
        status: exam.status.name,
        specialty: exam.examinationType.name,
        examiner: exam.examiner
          ? `${exam.examiner.user.firstName} ${exam.examiner.user.lastName}`
          : 'Not Assigned',
        submittedAt: exam.createdAt.toISOString(),
        createdBy: creator && `${creator.account.user.firstName} ${creator.account.user.lastName}`,
      };
    });

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

const getCaseStatusById = async (id: string) => {
  try {
    const status = await prisma.examination.findUnique({
      where: { id },
      select: { status: { select: { id: true, name: true } } },
    });

    return status?.status;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching examination status');
  }
};

const getCaseData = async (caseId: string) => {
  try {
    const examination = await prisma.examination.findUnique({
      where: { id: caseId },
      include: {
        examinationType: true,
        status: true,
        claimant: {
          include: { address: true, claimType: true },
        },
        insurance: {
          include: { address: true },
        },
        legalRepresentative: {
          include: { address: true },
        },
        services: {
          include: {
            interpreter: { include: { language: true } },
            transport: { include: { pickupAddress: true } },
          },
        },
        selectedBenefits: {
          include: { benefit: true },
        },
        case: {
          include: {
            organization: true,
            caseType: true,
            documents: {
              include: { document: true },
            },
          },
        },
      },
    });

    if (!examination) throw HttpError.notFound('Examination not found');

    const { claimant, insurance, legalRepresentative, case: caseData } = examination;

    // 🟢 Step 1: Claimant Info
    const step1 = {
      claimType: claimant.claimType.id,
      firstName: claimant.firstName,
      lastName: claimant.lastName,
      dateOfBirth: claimant.dateOfBirth?.toISOString() ?? '',
      gender: claimant.gender ?? '',
      phoneNumber: claimant.phoneNumber ?? '',
      emailAddress: claimant.emailAddress ?? '',
      addressLookup: claimant.address.address,
      street: claimant.address.street ?? '',
      suite: claimant.address.suite ?? '',
      city: claimant.address.city ?? '',
      province: claimant.address.province ?? '',
      postalCode: claimant.address.postalCode ?? '',
      relatedCasesDetails: claimant.relatedCasesDetails ?? '',
      familyDoctorName: claimant.familyDoctorName ?? '',
      familyDoctorEmail: claimant.familyDoctorEmailAddress ?? '',
      familyDoctorPhone: claimant.familyDoctorPhoneNumber ?? '',
      familyDoctorFax: claimant.familyDoctorFaxNumber ?? '',
    };

    // 🟢 Step 2: Insurance Info
    const step2 = insurance
      ? {
          insuranceCompanyName: insurance.companyName,
          insuranceAdjusterContact: insurance.contactPersonName,
          insurancePolicyNo: insurance.policyNumber,
          insuranceClaimNo: insurance.claimNumber,
          insuranceDateOfLoss: insurance.dateOfLoss.toISOString(),
          insuranceAddressLookup: insurance.address?.address ?? '',
          insuranceStreetAddress: insurance.address?.street ?? '',
          insuranceAptUnitSuite: insurance.address?.suite ?? '',
          insuranceCity: insurance.address?.city ?? '',
          insurancePostalCode: insurance.address?.postalCode ?? '',
          insuranceProvince: insurance.address?.province ?? '',
          insurancePhone: insurance.phoneNumber,
          insuranceFaxNo: insurance.faxNumber,
          insuranceEmailAddress: insurance.emailAddress,
          policyHolderSameAsClaimant: insurance.policyHolderIsClaimant,
          policyHolderFirstName: insurance.policyHolderFirstName,
          policyHolderLastName: insurance.policyHolderLastName,
        }
      : undefined;

    // 🟢 Step 3: Legal Representative
    const step3 = legalRepresentative
      ? {
          legalCompanyName: legalRepresentative.companyName ?? '',
          legalContactPerson: legalRepresentative.contactPersonName ?? '',
          legalPhone: legalRepresentative.phoneNumber ?? '',
          legalFaxNo: legalRepresentative.faxNumber ?? '',
          legalAddressLookup: legalRepresentative.address?.address ?? '',
          legalStreetAddress: legalRepresentative.address?.street ?? '',
          legalAptUnitSuite: legalRepresentative.address?.suite ?? '',
          legalCity: legalRepresentative.address?.city ?? '',
          legalPostalCode: legalRepresentative.address?.postalCode ?? '',
          legalProvinceState: legalRepresentative.address?.province ?? '',
        }
      : undefined;

    // 🟢 Step 4: Case Types
    const step4 = {
      caseTypes: examination.examinationType
        ? [{ id: examination.examinationType.id, label: examination.examinationType.name }]
        : [],
    };

    // 🟢 Step 5: Examination Details (FIXED - Always return all 3 services)
    const servicesMap = {
      transportation: examination.services.find(s => s.type === 'transportation'),
      interpreter: examination.services.find(s => s.type === 'interpreter'),
    };

    const services = [
      {
        type: 'transportation' as const,
        enabled: servicesMap.transportation?.enabled ?? false,
        details:
          servicesMap.transportation?.enabled &&
          servicesMap.transportation?.transport?.pickupAddress
            ? {
                pickupAddress: servicesMap.transportation.transport.pickupAddress.address ?? '',
                streetAddress: servicesMap.transportation.transport.pickupAddress.street ?? '',
                aptUnitSuite: servicesMap.transportation.transport.pickupAddress.suite ?? '',
                city: servicesMap.transportation.transport.pickupAddress.city ?? '',
                postalCode: servicesMap.transportation.transport.pickupAddress.postalCode ?? '',
                province: servicesMap.transportation.transport.pickupAddress.province ?? '',
              }
            : {},
      },
      {
        type: 'interpreter' as const,
        enabled: servicesMap.interpreter?.enabled ?? false,
        details:
          servicesMap.interpreter?.enabled && servicesMap.interpreter?.interpreter?.language
            ? {
                language: servicesMap.interpreter.interpreter.language.id,
              }
            : {},
      },
    ];

    // Format date correctly - extract YYYY-MM-DD only
    const formattedDueDate = examination.dueDate
      ? examination.dueDate.toISOString().split('T')[0]
      : '';

    const step5 = {
      reasonForReferral: caseData.reason ?? '',
      examinationType: caseData.caseTypeId ?? '',
      examinations: [
        {
          examinationTypeId: examination.examinationTypeId,
          urgencyLevel: examination.urgencyLevel ?? '',
          dueDate: formattedDueDate,
          instructions: examination.notes ?? '',
          locationType: examination.preference,
          selectedBenefits: examination.selectedBenefits?.map(sb => sb.benefitId) ?? [],
          services,
          additionalNotes: examination.additionalNotes ?? '',
          supportPerson: examination.supportPerson ?? false,
        },
      ],
    };

    const step6 = {
      document: caseData.documents,
    };

    // 🟢 Step 7: Submission
    const step7 = {
      consentForSubmission: caseData.consentForSubmission,
      isDraft: caseData.isDraft,
    };

    const result = {
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
      step7,
    };

    return result;
  } catch (error) {
    log.error('Database error in getCaseData:', error);
    throw HttpError.handleServiceError(error, 'Error fetching case details');
  }
};

const imeReferralService = {
  createCase,
  getCaseTypes,
  getCaseDetails,
  getCases,
  getClaimTypes,
  getExaminationBenefits,
  getCaseList,
  getCaseStatuses,
  getCaseStatusById,
  getCaseData,
  updateExamination,
};

export default imeReferralService;
