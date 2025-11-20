import { Report, ReportDynamicSection, ReportDocument, Documents, ClaimantBooking, Examination, ExaminationType, CaseStatus, Claimant, Address } from "@prisma/client";
import { ReportDetailDtoType } from "../../types/ReportDetailDtoType";
import { generatePresignedUrl } from "@/lib/s3";

export class ReportDto {
  static async toReportDetailDto(
    report: Report & {
      booking: ClaimantBooking & {
        examination: Examination & {
          examinationType: ExaminationType;
          status: CaseStatus;
        };
        claimant: Claimant & {
          address: Address | null;
        };
      };
      dynamicSections: ReportDynamicSection[];
      referralDocuments: (ReportDocument & {
        document: Documents;
      })[];
    }
  ): Promise<ReportDetailDtoType> {
    // Generate presigned URLs for referral documents
    const documentsWithUrls = await Promise.all(
      report.referralDocuments.map(async (rd) => {
        try {
          const url = await generatePresignedUrl(rd.document.name, 3600); // 1 hour expiration
          return {
            id: rd.id,
            document: {
              ...rd.document,
              url,
            },
          };
        } catch (error) {
          console.error(
            `Failed to generate presigned URL for document ${rd.document.name}:`,
            error
          );
          return {
            id: rd.id,
            document: {
              ...rd.document,
              url: null,
            },
          };
        }
      })
    );

    return {
      id: report.id,
      bookingId: report.bookingId,
      consentFormSigned: report.consentFormSigned,
      latRuleAcknowledgment: report.latRuleAcknowledgment,
      referralQuestionsResponse: report.referralQuestionsResponse,
      examinerName: report.examinerName,
      professionalTitle: report.professionalTitle,
      dateOfReport: report.dateOfReport,
      signatureType: report.signatureType,
      signatureData: report.signatureData,
      confirmationChecked: report.confirmationChecked,
      googleDocId: report.googleDocId,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      booking: {
        id: report.booking.id,
        examinationId: report.booking.examinationId,
        claimantId: report.booking.claimantId,
        bookingTime: report.booking.bookingTime,
        examination: {
          id: report.booking.examination.id,
          caseNumber: report.booking.examination.caseNumber,
          examinationType: {
            id: report.booking.examination.examinationType.id,
            name: report.booking.examination.examinationType.name,
            shortForm: report.booking.examination.examinationType.shortForm,
          },
          status: {
            id: report.booking.examination.status.id,
            name: report.booking.examination.status.name,
          },
        },
        claimant: {
          id: report.booking.claimant.id,
          firstName: report.booking.claimant.firstName,
          lastName: report.booking.claimant.lastName,
          emailAddress: report.booking.claimant.emailAddress,
          phoneNumber: report.booking.claimant.phoneNumber,
          address: report.booking.claimant.address,
        },
      },
      dynamicSections: report.dynamicSections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        order: section.order,
      })),
      referralDocuments: documentsWithUrls,
    };
  }
}

