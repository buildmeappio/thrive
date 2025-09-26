// src/dto/case.dto.ts
import { Examination, Case, CaseType, Documents, Claimant, Organization, LegalRepresentative, Insurance, ExaminationServices, ExaminationInterpreter, ExaminationTransport, Address, Language, ExaminationType, CaseDocument, CaseStatus } from "@prisma/client";
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
      organization: Organization;
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
      examiner: {
        id: examination.examiner.user.id,
        firstName: examination.examiner.user.firstName,
        lastName: examination.examiner.user.lastName,
        email: examination.examiner.user.email,
      },
      services: examination.services.map(service => ({
        type: service.type,
        enabled: service.enabled,
        interpreter: service.interpreter ? {
          languageId: service.interpreter.language.id,
          languageName: service.interpreter.language.name,
        } : null,
        transport: service.transport ? {
          address: service.transport.pickupAddress.address,
          street: service.transport.pickupAddress.street,
          province: service.transport.pickupAddress.province,
          city: service.transport.pickupAddress.city,
          notes: service.transport.notes,
        } : null,
      })),
      case: {
        id: examination.case.id,
        caseType: {
          id: examination.case.caseType.id,
          name: examination.case.caseType.name,
        },
        reason: examination.case.reason,
        consentForSubmission: examination.case.consentForSubmission,
        isDraft: examination.case.isDraft,
        documents: examination.case.documents.map(document => ({
          id: document.document.id,
          name: document.document.name,
          type: document.document.type,
          size: document.document.size,
        })),
        claimant: {
          id: examination.case.claimant.id,
          firstName: examination.case.claimant.firstName,
          lastName: examination.case.claimant.lastName,
          emailAddress: examination.case.claimant.emailAddress,
          gender: examination.case.claimant.gender,
          phoneNumber: examination.case.claimant.phoneNumber,
          dateOfBirth: examination.case.claimant.dateOfBirth,
          address: examination.case.claimant.address,
          relatedCases: examination.case.claimant.relatedCasesDetails,
        },
        familyDoctor: {
          name: examination.case.claimant.familyDoctorName,
          email: examination.case.claimant.familyDoctorEmailAddress,
          phoneNumber: examination.case.claimant.familyDoctorPhoneNumber,
          faxNumber: examination.case.claimant.familyDoctorFaxNumber,
        },
        organization: {
          id: examination.case.organization.id,
          name: examination.case.organization.name,
          website: examination.case.organization.website,
          status: examination.case.organization.status,
        },
        legalRepresentative: {
          id: examination.case.legalRepresentative.id,
          companyName: examination.case.legalRepresentative.companyName,
          contactPersonName: examination.case.legalRepresentative.contactPersonName,
          phoneNumber: examination.case.legalRepresentative.phoneNumber,
          faxNumber: examination.case.legalRepresentative.faxNumber,
          address: examination.case.legalRepresentative.address,
        },

        insurance: {
          id: examination.case.insurance.id,
          emailAddress: examination.case.insurance.emailAddress,
          companyName: examination.case.insurance.companyName,
          contactPersonName: examination.case.insurance.contactPersonName,
          policyNumber: examination.case.insurance.policyNumber,
          claimNumber: examination.case.insurance.claimNumber,
          dateOfLoss: examination.case.insurance.dateOfLoss,
          policyHolderIsClaimant: examination.case.insurance.policyHolderIsClaimant,
          policyHolderFirstName: examination.case.insurance.policyHolderFirstName,
          policyHolderLastName: examination.case.insurance.policyHolderLastName,
          phoneNumber: examination.case.insurance.phoneNumber,
          faxNumber: examination.case.insurance.faxNumber,
          addressId: examination.case.insurance.addressId,
          address: examination.case.insurance.address,
        },

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
      organization: Organization;
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
      organization: Organization;
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
