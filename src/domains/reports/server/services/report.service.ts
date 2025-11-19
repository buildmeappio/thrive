import prisma from "@/lib/db";
import { CaseOverviewData } from "../../types";

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
            select: {
              specialties: true,
            },
          },
        },
      });

      if (!booking) return null;

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
      };

      return caseData;
    } catch (error) {
      console.error("Error fetching booking data for report:", error);
      return null;
    }
  }

  /**
   * Save report draft (placeholder for future implementation)
   */
  async saveReportDraft(bookingId: string, reportData: any): Promise<boolean> {
    try {
      // TODO: Implement database persistence
      console.log("Saving report draft for booking:", bookingId, reportData);
      return true;
    } catch (error) {
      console.error("Error saving report draft:", error);
      return false;
    }
  }

  /**
   * Submit final report (placeholder for future implementation)
   */
  async submitReport(bookingId: string, reportData: any): Promise<boolean> {
    try {
      // TODO: Implement final submission logic
      // - Save to database
      // - Update booking status
      // - Send notifications
      console.log("Submitting report for booking:", bookingId, reportData);
      return true;
    } catch (error) {
      console.error("Error submitting report:", error);
      return false;
    }
  }
}

export const reportService = new ReportService();
