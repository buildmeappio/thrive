import prisma from "@/lib/db";
import { CaseRowData } from "../../types";

class CasesService {
  /**
   * Get all pending cases for an examiner (only PENDING status)
   */
  async getAllCases(examinerProfileId: string): Promise<CaseRowData[]> {
    const bookings = await prisma.claimantBooking.findMany({
      where: {
        examinerProfileId,
        status: {
          in: ["PENDING", "ACCEPT"],
        },
        deletedAt: null,
      },
      include: {
        examination: {
          include: {
            case: {
              include: {
                organization: true,
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
          },
        },
        reports: {
          where: {
            deletedAt: null,
          },
          select: {
            status: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const cases: CaseRowData[] = bookings.map((booking) => {
      const claimantName = `${booking.claimant.firstName} ${booking.claimant.lastName}`;
      const company = booking.examination.case.organization?.name || "N/A";

      const benefitsList = booking.examination.selectedBenefits.map(
        (sb) => sb.benefit.benefit
      );
      const benefits =
        benefitsList.length > 0 ? benefitsList.join(", ") : "N/A";

      // Get report status
      const reportStatus = booking.reports?.[0]?.status || null;

      return {
        id: booking.id,
        caseNumber: booking.examination.caseNumber,
        claimant: claimantName,
        company,
        benefits,
        appointment: booking.bookingTime,
        dueDate: booking.examination.dueDate || booking.examination.createdAt,
        status: booking.status,
        reportStatus,
      };
    });

    return cases;
  }
}

export const casesService = new CasesService();
