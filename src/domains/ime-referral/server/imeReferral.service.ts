import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';
import type { IMEFormData } from '@/store/useImeReferral';
import type { ClaimantPreference } from '@prisma/client';
import { DocumentService } from '@/services/fileUploadService';
import { getE164PhoneNumber } from '@/utils/formatNumbers';
import log from '@/utils/log';

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

const updateExamination = async (examinationId: string, formData: IMEFormData) => {
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

      // 2. Update or create addresses
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

      // 3. Update claimant
      const claimant = await tx.claimant.update({
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
          claimTypeId: formData.step1?.claimType,
        },
      });

      // 4. Update insurance address
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

      if (!formData.step2?.insuranceDateOfLoss) {
        throw new Error('Insurance date of loss is required');
      }

      const insurance = await tx.insurance.update({
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

      // 5. Update legal representative and address (FIXED)
      let legalRepresentative;
      if (existingExam.legalRepresentativeId) {
        // Update existing legal address if it exists
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
          // Create new address if legal rep didn't have one before
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

        legalRepresentative = await tx.legalRepresentative.update({
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
        // Create new legal representative if it didn't exist before
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

        legalRepresentative = await tx.legalRepresentative.create({
          data: {
            companyName: formData.step3?.legalCompanyName || null,
            contactPersonName: formData.step3?.legalContactPerson || null,
            phoneNumber: getE164PhoneNumber(formData.step3?.legalPhone) || null,
            faxNumber: getE164PhoneNumber(formData.step3?.legalFaxNo) || null,
            addressId: legalAddress ? legalAddress.id : null,
          },
        });

        // Link legal rep to examination
        await tx.examination.update({
          where: { id: examinationId },
          data: {
            legalRepresentativeId: legalRepresentative.id,
          },
        });
      }

      // 6. Update examination
      const examinationTypeId = formData.step5?.examinations[0]?.examinationTypeId;

      if (examinationTypeId) {
        const examTypeExists = await tx.examinationType.findUnique({
          where: { id: examinationTypeId },
        });
        console.log('examinationTypeId', examinationTypeId);

        if (!examTypeExists) {
          throw new Error(`Invalid examination type ID: ${examinationTypeId}`);
        }
      }

      const examination = await tx.examination.update({
        where: { id: examinationId },
        data: {
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

      // 7. Update services - Smart update/create/delete logic
      if (formData.step5?.examinations[0]?.services) {
        const incomingServices = formData.step5.examinations[0].services;
        const existingServices = existingExam.services || [];

        // Create a map of existing services by type for easy lookup
        const existingServiceMap = new Map(
          existingServices.map(service => [service.type, service])
        );

        // Pre-fetch languages to avoid multiple queries
        const languageNames = incomingServices
          .filter(s => s.type === 'interpreter' && s.enabled && s.details?.language)
          .map(s => s.details!.language!);

        const existingLanguages =
          languageNames.length > 0
            ? await tx.language.findMany({
                where: { name: { in: languageNames } },
              })
            : [];

        // Process each incoming service
        await Promise.all(
          incomingServices.map(async service => {
            const existingService = existingServiceMap.get(service.type);

            if (service.enabled) {
              // Service is enabled - update or create
              if (existingService) {
                // Update existing service
                await tx.examinationServices.update({
                  where: { id: existingService.id },
                  data: { enabled: true },
                });

                // Update service-specific details
                if (service.type === 'interpreter' && service.details?.language) {
                  let language = existingLanguages.find(l => l.name === service.details!.language);
                  if (!language) {
                    language = await tx.language.create({
                      data: { name: service.details.language },
                    });
                  }

                  // Update or create interpreter record
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

                  // Update or create transport address
                  if (service.details?.pickupAddress || service.details?.streetAddress) {
                    if (existingService.transport?.pickupAddressId) {
                      // Update existing address
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
                      // Create new address
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

                  // Update or create transport record
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
                // Create new service
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

              // Remove from map so we know it's been processed
              existingServiceMap.delete(service.type);
            } else if (existingService) {
              // Service is disabled - delete it
              await tx.examinationServices.delete({
                where: { id: existingService.id },
              });
              existingServiceMap.delete(service.type);
            }
          })
        );

        // Delete any remaining services that weren't in the incoming data
        const servicesToDelete = Array.from(existingServiceMap.values());
        if (servicesToDelete.length > 0) {
          await tx.examinationServices.deleteMany({
            where: {
              id: { in: servicesToDelete.map(s => s.id) },
            },
          });
        }
      }

      // 8. Update selected benefits
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

      // 9. Update case documents (if new documents uploaded)
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
          claimantId: claimant.id,
          insuranceId: insurance.id,
          legalRepresentative: legalRepresentative?.id || null,
          documents: uploadResult.documents,
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

const getCaseList = async (userId?: string, status?: string, take?: number) => {
  try {
    const examinations = await prisma.examination.findMany({
      where: {
        ...(status && { status: { name: status } }),
        ...(userId && {
          case: {
            organization: {
              manager: {
                some: {
                  account: {
                    userId: userId,
                  },
                },
              },
            },
          },
        }),
      },
      ...(take && { take }),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        claimant: {
          include: {
            claimType: true,
          },
        },
        case: {
          include: {
            organization: {
              include: {
                manager: {
                  where: userId ? { account: { userId: userId } } : undefined,
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

      return {
        id: exam.id,
        number: exam.caseNumber,
        claimant: `${exam.claimant.firstName} ${exam.claimant.lastName}`,
        claimType: exam.claimant.claimType.name,
        status: exam.status.name,
        specialty: exam.examinationType.name,
        examiner: exam.examiner && `${exam.examiner.user.firstName} ${exam.examiner.user.lastName}`,
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
          // REMOVED: where: { enabled: true }, - We need ALL services, not just enabled ones
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
  getCaseData,
  updateExamination,
};

export default imeReferralService;
