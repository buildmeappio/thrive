import { bookingService } from "../services/booking.service";
import HttpError from "@/utils/httpError";
import {
  GetDashboardBookingsInput,
  GetDashboardBookingsResponse,
} from "../../types";

const getDashboardBookings = async (
  payload: GetDashboardBookingsInput
): Promise<GetDashboardBookingsResponse> => {
  try {
    const { examinerProfileId } = payload;

    if (!examinerProfileId) {
      throw HttpError.badRequest("Examiner profile ID is required");
    }

    const result = await bookingService.getDashboardBookings(examinerProfileId);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error in getDashboardBookings handler:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch dashboard bookings",
    };
  }
};

export default getDashboardBookings;
export type { GetDashboardBookingsInput };
