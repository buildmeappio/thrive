import prisma from "@/lib/db";
import { DashboardBookingData, ReportRow } from "../../types";

class BookingService {
  /**
   * Get ClaimantBooking records for an examiner
   * Returns bookings grouped by status:
   * - PENDING -> Case Offers Pending Review
   * - ACCEPT -> Upcoming Appointments
   */
  async getDashboardBookings(examinerProfileId: string): Promise<{
    pendingReview: DashboardBookingData[];
    upcomingAppointments: DashboardBookingData[];
    waitingToBeSubmitted: ReportRow[];
  }> {
    // Fetch all bookings for this examiner
    const bookings = await prisma.claimantBooking.findMany({
      where: {
        examinerProfileId,
        deletedAt: null,
        status: {
          in: ["PENDING", "ACCEPT"],
        },
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
            claimType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        bookingTime: "asc",
      },
    });

    // Transform the data
    const pendingReview: DashboardBookingData[] = [];
    const upcomingAppointments: DashboardBookingData[] = [];

    for (const booking of bookings) {
      const claimantName = `${booking.claimant.firstName} ${booking.claimant.lastName}`;
      const caseNumber = booking.examination.caseNumber;

      // Get claim type
      const claimType = booking.claimant.claimType?.name || "N/A";

      const appointment = booking.bookingTime;
      const dueDate =
        booking.examination.dueDate || booking.examination.createdAt;

      const bookingData: DashboardBookingData = {
        id: booking.id,
        caseNumber,
        claimant: claimantName,
        claimType,
        appointment,
        dueDate,
      };

      if (booking.status === "PENDING") {
        pendingReview.push(bookingData);
      } else if (booking.status === "ACCEPT") {
        upcomingAppointments.push(bookingData);
      }
    }

    // Get waiting to be submitted cases
    const waitingToBeSubmitted =
      await this.getWaitingToBeSubmitted(examinerProfileId);

    return {
      // Limit to maximum 3 cases per table (minimum 1 is handled by showing available data)
      pendingReview: pendingReview.slice(0, 3),
      upcomingAppointments: upcomingAppointments.slice(0, 3),
      waitingToBeSubmitted,
    };
  }

  /**
   * Get cases waiting to be submitted
   * Returns cases with due dates in the current week or past
   * Only includes ACCEPTED bookings with reports that are DRAFT or PENDING (not SUBMITTED)
   */
  async getWaitingToBeSubmitted(
    examinerProfileId: string,
  ): Promise<ReportRow[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate start and end of current week (Sunday to Saturday)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Fetch bookings that are ACCEPTED and have due dates in current week or past
    const bookings = await prisma.claimantBooking.findMany({
      where: {
        examinerProfileId,
        deletedAt: null,
        status: "ACCEPT",
        examination: {
          dueDate: {
            lte: endOfWeek, // Due date is within current week or past
          },
        },
      },
      include: {
        examination: {
          include: {
            case: {
              include: {
                organization: true,
              },
            },
          },
        },
        claimant: {
          select: {
            firstName: true,
            lastName: true,
            claimType: {
              select: {
                name: true,
              },
            },
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
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        examination: {
          dueDate: "asc",
        },
      },
    });

    const waitingToBeSubmitted: ReportRow[] = [];

    for (const booking of bookings) {
      const report = booking.reports?.[0];

      // Only include cases where report is DRAFT, PENDING, or doesn't exist (not SUBMITTED)
      if (
        !report ||
        (report.status !== "SUBMITTED" &&
          report.status !== "REVIEWED" &&
          report.status !== "APPROVED" &&
          report.status !== "REJECTED")
      ) {
        const claimantName = `${booking.claimant.firstName} ${booking.claimant.lastName}`;
        const company = booking.examination.case.organization?.name || "N/A";
        const dueDate =
          booking.examination.dueDate || booking.examination.createdAt;

        // Convert dueDate to Date object if it's a string, and normalize to date only (no time)
        const dueDateObj =
          dueDate instanceof Date ? dueDate : new Date(dueDate);
        const dueDateOnly = new Date(
          dueDateObj.getFullYear(),
          dueDateObj.getMonth(),
          dueDateObj.getDate(),
        );

        // Determine status: "Overdue" if due date is past today, "Pending" if within current week
        const status: "Pending" | "Overdue" =
          dueDateOnly < today ? "Overdue" : "Pending";

        // Reason could be examination type or claim type - using claim type for now
        const reason = booking.claimant.claimType?.name || "N/A";

        waitingToBeSubmitted.push({
          id: booking.id,
          claimant: claimantName,
          company,
          dueDate: dueDateObj,
          reason,
          status,
        });
      }
    }

    // Limit to maximum 3 cases (minimum 1 is handled by showing available data)
    return waitingToBeSubmitted.slice(0, 3);
  }
}

export const bookingService = new BookingService();
