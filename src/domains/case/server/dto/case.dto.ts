// src/dto/case.dto.ts
import { Examination, Case, CaseType, Documents, Claimant, Organization, LegalRepresentative, Insurance, ExaminationServices, ExaminationInterpreter, ExaminationTransport, Address, Language, ExaminationType, CaseDocument, CaseStatus, OrganizationManager, Account, User } from "@prisma/client";
import { CaseDetailDtoType } from "../../types/CaseDetailDtoType";

export class CaseDto {
  static toCaseDetailDto(examination: Examination & {
    examinationType: ExaminationType;
    status: CaseStatus,
    examiner: { user: { id: string; firstName: string; lastName: string; email: string } };
    services: (ExaminationServices & { interpreter?: ExaminationInterpreter & { language: Language }; transport?: ExaminationTransport & { pickupAddress: Address } })[];
    case: Case & {
      caseType: CaseType;
      documents: (CaseDocument & { document: Documents })[];
      claimant: Claimant & { address: Address };
      organization: Organization & {
        manager: (OrganizationManager & {
          account: Account & {
            user: User;
          };
        })[];
      };
      legalRepresentative: LegalRepresentative & { address: Address };
      insurance: Insurance & { address: Address };
    };
  }): CaseDetailDtoType {
    return {
      id: examination.id,
      caseNumber: examination.caseNumber,
      urgencyLevel: examination.urgencyLevel,
      assignedAt: examination.assignedAt,
      createdAt: examination.createdAt,
      status: {
        id: examination.status.id,
        name: examination.status.name,
      },
      dueDate: examination.dueDate,
      notes: examination.notes,
      additionalNotes: examination.additionalNotes,
      supportPerson: examination.supportPerson,
      examinationType: {
        id: examination.examinationType.id,
        name: examination.examinationType.name,
        shortForm: examination.examinationType.shortForm,
      },
      examiner: examination.examiner
        ? {
          id: examination.examiner?.user?.id ?? null,
          firstName: examination.examiner?.user?.firstName ?? null,
          lastName: examination.examiner?.user?.lastName ?? null,
          email: examination.examiner?.user?.email ?? null,
        }
        : null,

      services: examination.services.map(service => ({
        type: service.type,
        enabled: service.enabled,
        interpreter: service.interpreter
          ? {
            languageId: service.interpreter.language.id,
            languageName: service.interpreter.language.name,
          }
          : null,
        transport: service.transport
          ? service.transport.pickupAddress
            ? {
              address: service.transport.pickupAddress.address ?? null,
              street: service.transport.pickupAddress.street ?? null,
              province: service.transport.pickupAddress.province ?? null,
              city: service.transport.pickupAddress.city ?? null,
              notes: service.transport.notes ?? null,
            }
            : null
          : null,
      })),

      case: {
        id: examination.case.id,
        caseType: examination.case.caseType
          ? {
            id: examination.case.caseType.id,
            name: examination.case.caseType.name,
          }
          : null,
        reason: examination.case.reason ?? null,
        consentForSubmission: examination.case.consentForSubmission,
        isDraft: examination.case.isDraft,
        documents: examination.case.documents.map(document => ({
          id: document.document.id,
          name: document.document.name,
          type: document.document.type,
          size: document.document.size,
          url: null as string | null, // Will be populated with presigned URL
        })),
        claimant: {
          id: examination.case.claimant.id,
          firstName: examination.case.claimant.firstName,
          lastName: examination.case.claimant.lastName,
          emailAddress: examination.case.claimant.emailAddress ?? null,
          gender: examination.case.claimant.gender ?? null,
          phoneNumber: examination.case.claimant.phoneNumber ?? null,
          dateOfBirth: examination.case.claimant.dateOfBirth ?? null,
          address: examination.case.claimant.address,
          relatedCases: examination.case.claimant.relatedCasesDetails ?? null,
        },
        familyDoctor: {
          name: examination.case.claimant.familyDoctorName ?? null,
          email: examination.case.claimant.familyDoctorEmailAddress ?? null,
          phoneNumber: examination.case.claimant.familyDoctorPhoneNumber ?? null,
          faxNumber: examination.case.claimant.familyDoctorFaxNumber ?? null,
        },
        organization: {
          id: examination.case.organization.id,
          name: examination.case.organization.name,
          website: examination.case.organization.website ?? null,
          status: examination.case.organization.status,
          managerEmail: examination.case.organization.manager?.[0]?.account?.user?.email ?? null,
          managerName: examination.case.organization.manager?.[0]?.account?.user 
            ? `${examination.case.organization.manager[0].account.user.firstName} ${examination.case.organization.manager[0].account.user.lastName}`
            : null,
        },
        legalRepresentative: examination.case.legalRepresentative
          ? {
            id: examination.case.legalRepresentative.id,
            companyName: examination.case.legalRepresentative.companyName ?? null,
            contactPersonName:
              examination.case.legalRepresentative.contactPersonName ?? null,
            phoneNumber: examination.case.legalRepresentative.phoneNumber ?? null,
            faxNumber: examination.case.legalRepresentative.faxNumber ?? null,
            address: examination.case.legalRepresentative.address ?? null,
          }
          : null,
        insurance: examination.case.insurance
          ? {
            id: examination.case.insurance.id,
            emailAddress: examination.case.insurance.emailAddress,
            companyName: examination.case.insurance.companyName,
            contactPersonName: examination.case.insurance.contactPersonName,
            policyNumber: examination.case.insurance.policyNumber,
            claimNumber: examination.case.insurance.claimNumber,
            dateOfLoss: examination.case.insurance.dateOfLoss,
            policyHolderIsClaimant:
              examination.case.insurance.policyHolderIsClaimant,
            policyHolderFirstName:
              examination.case.insurance.policyHolderFirstName,
            policyHolderLastName: examination.case.insurance.policyHolderLastName,
            phoneNumber: examination.case.insurance.phoneNumber,
            faxNumber: examination.case.insurance.faxNumber,
            addressId: examination.case.insurance.addressId ?? null,
            address: examination.case.insurance.address ?? null,
          }
          : null,
      }

    };
  }

  static toCaseDto(examinations: Examination & {
    examinationType: ExaminationType;
    status: CaseStatus,
    examiner: { user: { id: string; firstName: string; lastName: string; email: string } };
    services: (ExaminationServices & { interpreter?: ExaminationInterpreter & { language: Language }; transport?: ExaminationTransport & { pickupAddress: Address } })[];
    case: Case & {
      caseType: CaseType;
      documents: (CaseDocument & { document: Documents })[];
      claimant: Claimant & { address: Address };
      organization: Organization & {
        manager: (OrganizationManager & {
          account: Account & {
            user: User;
          };
        })[];
      };
      legalRepresentative: LegalRepresentative & { address: Address };
      insurance: Insurance & { address: Address };
    };
  } | Array<Examination & {
    examinationType: ExaminationType;
    status: CaseStatus,
    examiner: { user: { id: string; firstName: string; lastName: string; email: string } };
    services: (ExaminationServices & { interpreter?: ExaminationInterpreter & { language: Language }; transport?: ExaminationTransport & { pickupAddress: Address } })[];
    case: Case & {
      caseType: CaseType;
      documents: (CaseDocument & { document: Documents })[];
      claimant: Claimant & { address: Address };
      organization: Organization & {
        manager: (OrganizationManager & {
          account: Account & {
            user: User;
          };
        })[];
      };
      legalRepresentative: LegalRepresentative & { address: Address };
      insurance: Insurance & { address: Address };
    };
  }>): CaseDetailDtoType[] {
    if (Array.isArray(examinations)) {
      return examinations.map(examination => this.toCaseDetailDto(examination));
    } else {
      return [this.toCaseDetailDto(examinations)];
    }
  }
}
