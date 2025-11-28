import logger from "@/utils/logger";

// src/dto/case.dto.ts
import { Examination, Case, CaseType, Documents, Claimant, Organization, LegalRepresentative, Insurance, ExaminationServices, ExaminationInterpreter, ExaminationTransport, Address, Language, ExaminationType, CaseDocument, CaseStatus, OrganizationManager, Account, User } from "@prisma/client";
import { CaseDetailDtoType } from "../../types/CaseDetailDtoType";
import prisma from "@/lib/db";

export class CaseDto {
  // Helper to check if a string is a UUID
  private static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  // Helper to get language name, checking if it's a UUID and fetching from DB if needed
  private static async getLanguageName(languageName: string, _languageId: string): Promise<string> {
    // If the name is a UUID, it means bad data - try to fetch using the name as an ID
    if (this.isUUID(languageName)) {
      try {
        const language = await prisma.language.findUnique({
          where: { id: languageName },
        });
        return language?.name || "Unknown Language";
      } catch (error) {
        logger.error("Error fetching language:", error);
        return "Unknown Language";
      }
    }
    return languageName;
  }
  static async toCaseDetailDto(examination: Examination & {
    examinationType: ExaminationType;
    status: CaseStatus,
    examiner: { user: { id: string; firstName: string; lastName: string; email: string } };
    services: (ExaminationServices & { interpreter?: ExaminationInterpreter & { language: Language }; transport?: ExaminationTransport & { pickupAddress: Address } })[];
    claimant: Claimant & { address: Address };
    claimantBookings?: Array<{
      reports: Array<{
        id: string;
        status: string;
      }>;
    }>;
    case: Case & {
      caseType: CaseType;
      documents: (CaseDocument & { document: Documents })[];
      organization: Organization & {
        manager: (OrganizationManager & {
          account: Account & {
            user: User;
          };
        })[];
      };
    };
    legalRepresentative: LegalRepresentative & { address: Address };
    insurance: Insurance & { address: Address };
  }): Promise<CaseDetailDtoType> {
    return {
      id: examination.id,
      caseNumber: examination.caseNumber,
      urgencyLevel: examination.urgencyLevel,
      assignedAt: examination.assignedAt,
      approvedAt: examination.approvedAt,
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

      services: await Promise.all(examination.services.map(async service => ({
        type: service.type,
        enabled: service.enabled,
        interpreter: service.interpreter
          ? {
            languageId: service.interpreter.language.id,
            languageName: await this.getLanguageName(
              service.interpreter.language.name,
              service.interpreter.language.id
            ),
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
      }))),

      claimant: {
        id: examination.claimant.id,
        firstName: examination.claimant.firstName,
        lastName: examination.claimant.lastName,
        emailAddress: examination.claimant.emailAddress ?? null,
        gender: examination.claimant.gender ?? null,
        phoneNumber: examination.claimant.phoneNumber ?? null,
        dateOfBirth: examination.claimant.dateOfBirth ?? null,
        address: examination.claimant.address,
        relatedCases: examination.claimant.relatedCasesDetails ?? null,
      },
      familyDoctor: {
        name: examination.claimant.familyDoctorName ?? null,
        email: examination.claimant.familyDoctorEmailAddress ?? null,
        phoneNumber: examination.claimant.familyDoctorPhoneNumber ?? null,
        faxNumber: examination.claimant.familyDoctorFaxNumber ?? null,
      },
      legalRepresentative: examination.legalRepresentative
        ? {
          id: examination.legalRepresentative.id,
          companyName: examination.legalRepresentative.companyName ?? null,
          contactPersonName:
            examination.legalRepresentative.contactPersonName ?? null,
          phoneNumber: examination.legalRepresentative.phoneNumber ?? null,
          faxNumber: examination.legalRepresentative.faxNumber ?? null,
          address: examination.legalRepresentative.address ?? null,
        }
        : null,
      insurance: examination.insurance
        ? {
          id: examination.insurance.id,
          emailAddress: examination.insurance.emailAddress,
          companyName: examination.insurance.companyName,
          contactPersonName: examination.insurance.contactPersonName,
          policyNumber: examination.insurance.policyNumber,
          claimNumber: examination.insurance.claimNumber,
          dateOfLoss: examination.insurance.dateOfLoss,
          policyHolderIsClaimant:
            examination.insurance.policyHolderIsClaimant,
          policyHolderFirstName:
            examination.insurance.policyHolderFirstName,
          policyHolderLastName: examination.insurance.policyHolderLastName,
          phoneNumber: examination.insurance.phoneNumber,
          faxNumber: examination.insurance.faxNumber,
          addressId: examination.insurance.addressId ?? null,
          address: examination.insurance.address ?? null,
        }
        : null,
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
      },
      report: examination.claimantBookings?.[0]?.reports?.[0] 
        ? {
            id: examination.claimantBookings[0].reports[0].id,
            status: examination.claimantBookings[0].reports[0].status,
          }
        : null,

    };
  }

  static async toCaseDto(examinations: Examination & {
    examinationType: ExaminationType;
    status: CaseStatus,
    examiner: { user: { id: string; firstName: string; lastName: string; email: string } };
    services: (ExaminationServices & { interpreter?: ExaminationInterpreter & { language: Language }; transport?: ExaminationTransport & { pickupAddress: Address } })[];
    claimant: Claimant & { address: Address };
    case: Case & {
      caseType: CaseType;
      documents: (CaseDocument & { document: Documents })[];
      organization: Organization & {
        manager: (OrganizationManager & {
          account: Account & {
            user: User;
          };
        })[];
      };
    };
    legalRepresentative: LegalRepresentative & { address: Address };
    insurance: Insurance & { address: Address };
  } | Array<Examination & {
    examinationType: ExaminationType;
    status: CaseStatus,
    examiner: { user: { id: string; firstName: string; lastName: string; email: string } };
    services: (ExaminationServices & { interpreter?: ExaminationInterpreter & { language: Language }; transport?: ExaminationTransport & { pickupAddress: Address } })[];
    claimant: Claimant & { address: Address };
    case: Case & {
      caseType: CaseType;
      documents: (CaseDocument & { document: Documents })[];
      organization: Organization & {
        manager: (OrganizationManager & {
          account: Account & {
            user: User;
          };
        })[];
      };
    };
    legalRepresentative: LegalRepresentative & { address: Address };
    insurance: Insurance & { address: Address };
  }>): Promise<CaseDetailDtoType[]> {
    if (Array.isArray(examinations)) {
      return Promise.all(examinations.map(examination => this.toCaseDetailDto(examination)));
    } else {
      return [await this.toCaseDetailDto(examinations)];
    }
  }
}
