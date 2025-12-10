import { reportService } from "../services/report.service";
import HttpError from "@/utils/httpError";
import { GetReportResponse } from "../../types";

export interface GetReportInput {
  bookingId: string;
}

const getReport = async (payload: GetReportInput): Promise<GetReportResponse> => {
  try {
    const { bookingId } = payload;

    if (!bookingId) {
      throw HttpError.badRequest("Booking ID is required");
    }

    const result = await reportService.getReport(bookingId);

    if (!result) {
      return {
        success: false,
        message: "Report not found",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    console.error("Error in getReport handler:", error);
    return {
      success: false,
      message: (error instanceof Error ? error.message : undefined) || "Failed to fetch report",
    };
  }
};

export default getReport;

