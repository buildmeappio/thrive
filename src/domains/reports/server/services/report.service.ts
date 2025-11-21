import prisma from "@/lib/db";
import {
  CaseOverviewData,
  ReportFormData,
  DynamicSection,
  UploadedDocument,
} from "../../types";
import { generateReportFromTemplate, ReportDocData } from "@/lib/google-docs";
import { ENV } from "@/constants/variables";

class ReportService {
  /**
   * Get booking data for report preparation
   */
  async getBookingDataForReport(
    bookingId: string
  ): Promise<CaseOverviewData | null> {
    try {
      const booking = await prisma.claimantBooking.findUnique({
        where: { id: bookingId },
        include: {
          examination: {
            include: {
              insurance: true,
              examinationType: true,
              case: {
                include: {
                  organization: true,
                  caseType: true,
                },
              },
              selectedBenefits: {
                include: {
                  benefit: true,
                },
              },
            },
          },
          claimant: {
            select: {
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              emailAddress: true,
            },
          },
          examiner: {
            include: {
              account: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!booking) return null;

      const examinerName = booking.examiner?.account?.user
        ? `${booking.examiner.account.user.firstName} ${booking.examiner.account.user.lastName}`
        : undefined;

      // Get professional title from the examination type (medical specialty for this specific case)
      const professionalTitle = booking.examination.examinationType?.name || undefined;

      const caseData: CaseOverviewData = {
        requestDateTime: booking.createdAt,
        dueDate: booking.examination.dueDate || booking.examination.createdAt,
        insuranceCoverage: booking.examination.case.caseType?.name || "N/A",
        medicalSpecialty: booking.examination.examinationType?.name || "N/A",
        claimantFullName: `${booking.claimant.firstName} ${booking.claimant.lastName}`,
        dateOfBirth: booking.claimant.dateOfBirth || new Date(),
        gender: booking.claimant.gender || "N/A",
        claimantEmail: booking.claimant.emailAddress || "N/A",
        claimNumber: booking.examination.insurance?.claimNumber || "N/A",
        caseId: booking.examination.case.id,
        caseNumber: booking.examination.caseNumber,
        examinerName,
        professionalTitle,
      };

      return caseData;
    } catch (error) {
      console.error("Error fetching booking data for report:", error);
      return null;
    }
  }

  /**
   * Get report by booking ID
   */
  async getReport(bookingId: string): Promise<ReportFormData | null> {
    try {
      const report = await prisma.report.findUnique({
        where: { bookingId },
        include: {
          dynamicSections: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
          referralDocuments: {
            where: { deletedAt: null },
            include: {
              document: true,
            },
          },
        },
      });

      if (!report) return null;

      const dynamicSections: DynamicSection[] = report.dynamicSections.map(
        (section) => ({
          id: section.id,
          title: section.title,
          content: section.content,
          documents: [], // Can be extended if needed
        })
      );

      const referralDocuments: UploadedDocument[] =
        report.referralDocuments.map((rd) => ({
          id: rd.document.id,
          name: rd.document.name,
          displayName: rd.document.displayName || rd.document.name,
          size: rd.document.size,
          type: rd.document.type,
        }));

      const reportData: ReportFormData = {
        consentFormSigned: report.consentFormSigned,
        latRuleAcknowledgment: report.latRuleAcknowledgment,
        referralQuestionsResponse: report.referralQuestionsResponse,
        referralDocuments,
        dynamicSections,
        examinerName: report.examinerName,
        professionalTitle: report.professionalTitle,
        dateOfReport: report.dateOfReport.toISOString().split("T")[0],
        signature:
          report.signatureType && report.signatureData
            ? {
                type: report.signatureType as "canvas" | "upload",
                data: report.signatureData,
              }
            : null,
        confirmationChecked: report.confirmationChecked,
      };

      return reportData;
    } catch (error) {
      console.error("Error fetching report:", error);
      return null;
    }
  }

  /**
   * Save report draft
   */
  async saveReportDraft(
    bookingId: string,
    reportData: ReportFormData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate booking exists
      const booking = await prisma.claimantBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return { success: false, error: "Booking not found" };
      }

      // Extract document IDs (documents should be uploaded in action layer)
      const documentIds: string[] = reportData.referralDocuments
        .filter((doc) => doc.id)
        .map((doc) => doc.id);

      // Parse date
      const dateOfReport = new Date(reportData.dateOfReport);

      // Upsert report with DRAFT status
      await prisma.report.upsert({
        where: { bookingId },
        create: {
          bookingId,
          consentFormSigned: reportData.consentFormSigned,
          latRuleAcknowledgment: reportData.latRuleAcknowledgment,
          referralQuestionsResponse: reportData.referralQuestionsResponse,
          examinerName: reportData.examinerName,
          professionalTitle: reportData.professionalTitle,
          dateOfReport,
          signatureType: reportData.signature?.type || null,
          signatureData: reportData.signature?.data || null,
          confirmationChecked: reportData.confirmationChecked,
          status: "DRAFT", // Set status to DRAFT
          dynamicSections: {
            create: reportData.dynamicSections.map((section, index) => ({
              title: section.title,
              content: section.content,
              order: index,
            })),
          },
          referralDocuments: {
            create: documentIds.map((docId) => ({
              documentId: docId,
            })),
          },
        },
        update: {
          consentFormSigned: reportData.consentFormSigned,
          latRuleAcknowledgment: reportData.latRuleAcknowledgment,
          referralQuestionsResponse: reportData.referralQuestionsResponse,
          examinerName: reportData.examinerName,
          professionalTitle: reportData.professionalTitle,
          dateOfReport,
          signatureType: reportData.signature?.type || null,
          signatureData: reportData.signature?.data || null,
          confirmationChecked: reportData.confirmationChecked,
          status: "DRAFT", // Set status to DRAFT
          // Update dynamic sections
          dynamicSections: {
            deleteMany: { deletedAt: null },
            create: reportData.dynamicSections.map((section, index) => ({
              title: section.title,
              content: section.content,
              order: index,
            })),
          },
          // Update referral documents
          referralDocuments: {
            deleteMany: { deletedAt: null },
            create: documentIds.map((docId) => ({
              documentId: docId,
            })),
          },
        },
        include: {
          dynamicSections: true,
          referralDocuments: true,
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error saving report draft:", error);
      return {
        success: false,
        error: error.message || "Failed to save report draft",
      };
    }
  }

  /**
   * Submit final report
   */
  async submitReport(
    bookingId: string,
    reportData: ReportFormData
  ): Promise<{
    success: boolean;
    error?: string;
    googleDocId?: string;
    htmlContent?: string;
  }> {
    try {
      // Validate all required fields
      if (!reportData.consentFormSigned) {
        return { success: false, error: "Consent form must be signed" };
      }
      if (!reportData.latRuleAcknowledgment) {
        return { success: false, error: "LAT Rule 10.2 must be acknowledged" };
      }
      if (!reportData.referralQuestionsResponse) {
        return {
          success: false,
          error: "Referral questions response is required",
        };
      }
      if (!reportData.examinerName) {
        return { success: false, error: "Examiner name is required" };
      }
      if (!reportData.professionalTitle) {
        return { success: false, error: "Professional title is required" };
      }
      if (!reportData.dateOfReport) {
        return { success: false, error: "Date of report is required" };
      }
      if (!reportData.signature) {
        return { success: false, error: "Signature is required" };
      }
      if (!reportData.confirmationChecked) {
        return {
          success: false,
          error: "Report accuracy confirmation is required",
        };
      }

      // Get case/booking data for the report
      const caseData = await this.getBookingDataForReport(bookingId);
      if (!caseData) {
        return { success: false, error: "Booking data not found" };
      }

      // Generate Google Doc from template
      let googleDocId: string | undefined;
      let htmlContent: string | undefined;

      try {
        // Get logo URL from environment
        const logoUrl = ENV.NEXT_PUBLIC_CDN_URL
          ? `${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`
          : undefined;

        const reportDocData: ReportDocData = {
          claimantName: caseData.claimantFullName,
          dateOfBirth: caseData.dateOfBirth,
          gender: caseData.gender,
          caseNumber: caseData.caseNumber,
          claimNumber: caseData.claimNumber,
          insuranceCoverage: caseData.insuranceCoverage,
          medicalSpecialty: caseData.medicalSpecialty,
          requestDateTime: caseData.requestDateTime,
          dueDate: caseData.dueDate,
          claimantEmail: caseData.claimantEmail,
          referralQuestionsResponse: reportData.referralQuestionsResponse,
          dynamicSections: reportData.dynamicSections.map((section) => ({
            title: section.title,
            content: section.content,
          })),
          examinerName: reportData.examinerName,
          professionalTitle: reportData.professionalTitle,
          dateOfReport: reportData.dateOfReport,
          signatureDataUrl: reportData.signature?.data,
          logoUrl,
        };

        const result = await generateReportFromTemplate(reportDocData);
        googleDocId = result.documentId;
        htmlContent = result.htmlContent;
      } catch (error: any) {
        console.error("Error generating Google Doc:", error);
        // Continue with submission even if Google Doc generation fails
        // You can decide to fail here instead if Google Doc is critical
      }

      // Save report with SUBMITTED status
      const documentIds: string[] = reportData.referralDocuments
        .filter((doc) => doc.id)
        .map((doc) => doc.id);

      const dateOfReport = new Date(reportData.dateOfReport);

      await prisma.report.upsert({
        where: { bookingId },
        create: {
          bookingId,
          consentFormSigned: reportData.consentFormSigned,
          latRuleAcknowledgment: reportData.latRuleAcknowledgment,
          referralQuestionsResponse: reportData.referralQuestionsResponse,
          examinerName: reportData.examinerName,
          professionalTitle: reportData.professionalTitle,
          dateOfReport,
          signatureType: reportData.signature?.type || null,
          signatureData: reportData.signature?.data || null,
          confirmationChecked: reportData.confirmationChecked,
          googleDocId,
          status: "SUBMITTED", // Set status to SUBMITTED
          dynamicSections: {
            create: reportData.dynamicSections.map((section, index) => ({
              title: section.title,
              content: section.content,
              order: index,
            })),
          },
          referralDocuments: {
            create: documentIds.map((docId) => ({
              documentId: docId,
            })),
          },
        },
        update: {
          consentFormSigned: reportData.consentFormSigned,
          latRuleAcknowledgment: reportData.latRuleAcknowledgment,
          referralQuestionsResponse: reportData.referralQuestionsResponse,
          examinerName: reportData.examinerName,
          professionalTitle: reportData.professionalTitle,
          dateOfReport,
          signatureType: reportData.signature?.type || null,
          signatureData: reportData.signature?.data || null,
          confirmationChecked: reportData.confirmationChecked,
          googleDocId,
          status: "SUBMITTED", // Set status to SUBMITTED
          dynamicSections: {
            deleteMany: { deletedAt: null },
            create: reportData.dynamicSections.map((section, index) => ({
              title: section.title,
              content: section.content,
              order: index,
            })),
          },
          referralDocuments: {
            deleteMany: { deletedAt: null },
            create: documentIds.map((docId) => ({
              documentId: docId,
            })),
          },
        },
      });

      // TODO: Add any additional submission logic here
      // - Send notifications

      return {
        success: true,
        googleDocId,
        htmlContent,
      };
    } catch (error: any) {
      console.error("Error submitting report:", error);
      return {
        success: false,
        error: error.message || "Failed to submit report",
      };
    }
  }
}

export const reportService = new ReportService();
