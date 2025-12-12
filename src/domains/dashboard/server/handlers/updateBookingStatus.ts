import { caseDetailsService } from "../services/caseDetails.service";
import HttpError from "@/utils/httpError";
import {
  UpdateBookingStatusInput,
  UpdateBookingStatusResponse,
} from "../../types";

const updateBookingStatus = async (
  payload: UpdateBookingStatusInput,
): Promise<UpdateBookingStatusResponse> => {
  try {
    const { bookingId, examinerProfileId, status, message } = payload;

    if (!bookingId || !examinerProfileId || !status) {
      throw HttpError.badRequest(
        "Booking ID, Examiner Profile ID, and Status are required",
      );
    }

    await caseDetailsService.updateBookingStatus(
      bookingId,
      examinerProfileId,
      status,
      message,
    );

    return {
      success: true,
      message: `Case ${
        status === "ACCEPT"
          ? "accepted"
          : status === "DECLINE"
            ? "declined"
            : "requested more info"
      } successfully`,
    };
  } catch (error: unknown) {
    console.error("Error in updateBookingStatus handler:", error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to update booking status",
    };
  }
};

export default updateBookingStatus;
export type { UpdateBookingStatusInput };
