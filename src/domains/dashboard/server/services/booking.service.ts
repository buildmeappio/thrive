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
      const company = booking.examination.case.organization?.name || "N/A";

      // Get benefits - join all selected benefits
      const benefitsList = booking.examination.selectedBenefits.map(
        (sb) => sb.benefit.benefit
      );
      const benefits =
        benefitsList.length > 0 ? benefitsList.join(", ") : "N/A";

      const appointment = booking.bookingTime;
      const dueDate =
        booking.examination.dueDate || booking.examination.createdAt;

      const bookingData: DashboardBookingData = {
        id: booking.id,
        claimant: claimantName,
        company,
        benefits,
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
