import prisma from "@/lib/db";
import { RecentUpdate, UpdateType } from "../../types";

class UpdatesService {
  /**
   * Get recent updates for an examiner
   * Combines updates from:
   * - ClaimantBooking (appointments scheduled, accepted, declined)
   * - Report (reports submitted, overdue, draft created)
   */
  async getRecentUpdates(
    examinerProfileId: string,
    limit: number = 20,
  ): Promise<RecentUpdate[]> {
    const updates: RecentUpdate[] = [];

    // Fetch recent bookings
    const bookings = await prisma.claimantBooking.findMany({
      where: {
        examinerProfileId,
        deletedAt: null,
      },
      include: {
        examination: {
          include: {
            case: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit * 2, // Get more to filter and sort
    });

    // Process booking updates
    for (const booking of bookings) {
      const caseNumber = booking.examination?.caseNumber;
      if (!caseNumber) continue; // Skip if no case number

      const timestamp = booking.updatedAt;

      // New appointment scheduled (created recently and status is PENDING)
      if (booking.status === "PENDING") {
        const daysSinceCreated =
          (Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        // Only show as "new" if created within last 7 days
        if (daysSinceCreated <= 7) {
          updates.push({
            id: `booking-${booking.id}-scheduled`,
            type: "APPOINTMENT_SCHEDULED",
            message: `New appointment scheduled for ${caseNumber}`,
            caseNumber,
            timestamp: booking.createdAt,
            bookingId: booking.id,
          });
        }
      }

      // Appointment accepted
      if (booking.status === "ACCEPT") {
        // Only show if updated recently (within last 30 days)
        const daysSinceUpdated =
          (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdated <= 30) {
          updates.push({
            id: `booking-${booking.id}-accepted`,
            type: "APPOINTMENT_ACCEPTED",
            message: `${caseNumber} accepted by you`,
            caseNumber,
            timestamp,
            bookingId: booking.id,
          });
        }
      }

      // Appointment declined
      if (booking.status === "DECLINE") {
        const daysSinceUpdated =
          (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdated <= 30) {
          updates.push({
            id: `booking-${booking.id}-declined`,
            type: "APPOINTMENT_DECLINED",
            message: `${caseNumber} declined by you`,
            caseNumber,
            timestamp,
            bookingId: booking.id,
          });
        }
      }
    }

    // Fetch recent reports
    const reports = await prisma.report.findMany({
      where: {
        booking: {
          examinerProfileId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      include: {
        booking: {
          include: {
            examination: {
              include: {
                case: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit * 2,
    });

    // Process report updates
    const seenOverdueReports = new Set<string>(); // Track overdue reports to avoid duplicates

    for (const report of reports) {
      const caseNumber = report.booking?.examination?.caseNumber;
      if (!caseNumber) continue; // Skip if no case number

      const timestamp = report.updatedAt;

      // Report submitted
      if (report.status === "SUBMITTED") {
        const daysSinceUpdated =
          (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdated <= 30) {
          updates.push({
            id: `report-${report.id}-submitted`,
            type: "REPORT_SUBMITTED",
            message: `Report for ${caseNumber} has been submitted`,
            caseNumber,
            timestamp,
            bookingId: report.bookingId,
            reportId: report.id,
          });
        }
      }

      // Report draft created (only if not already submitted)
      if (report.status === "DRAFT") {
        const daysSinceCreated =
          (Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated <= 7) {
          updates.push({
            id: `report-${report.id}-draft`,
            type: "REPORT_DRAFT_CREATED",
            message: `Draft report created for ${caseNumber}`,
            caseNumber,
            timestamp: report.createdAt,
            bookingId: report.bookingId,
            reportId: report.id,
          });
        }
      }

      // Check for overdue reports (only show once per report)
      const examination = report.booking?.examination;
      if (
        examination?.dueDate &&
        report.status !== "SUBMITTED" &&
        !seenOverdueReports.has(report.id)
      ) {
        const dueDate = new Date(examination.dueDate);
        const now = new Date();
        if (dueDate < now) {
          // Report is overdue
          seenOverdueReports.add(report.id);
          updates.push({
            id: `report-${report.id}-overdue`,
            type: "REPORT_OVERDUE",
            message: `Report for ${caseNumber} is overdue`,
            caseNumber,
            timestamp: dueDate, // Use due date as timestamp for sorting
            bookingId: report.bookingId,
            reportId: report.id,
          });
        }
      }
    }

    // Sort all updates by timestamp (most recent first) and limit
    const sortedUpdates = updates
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return sortedUpdates;
  }
}

export const updatesService = new UpdatesService();
