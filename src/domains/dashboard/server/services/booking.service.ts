import prisma from "@/lib/db";
import { DashboardBookingData } from "../../types";

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

    return {
      pendingReview,
      upcomingAppointments,
    };
  }
}

export const bookingService = new BookingService();
