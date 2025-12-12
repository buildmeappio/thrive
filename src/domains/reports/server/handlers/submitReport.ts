import { reportService } from "../services/report.service";
import HttpError from "@/utils/httpError";
import { SubmitReportInput, SubmitReportResponse } from "../../types";

const submitReport = async (
  payload: SubmitReportInput,
): Promise<SubmitReportResponse> => {
  try {
    const { bookingId, reportData } = payload;

    if (!bookingId) {
      throw HttpError.badRequest("Booking ID is required");
    }

    if (!reportData) {
      throw HttpError.badRequest("Report data is required");
    }

    const result = await reportService.submitReport(bookingId, reportData);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to submit report",
      };
    }

    return {
      success: true,
      message: "Report submitted successfully",
      googleDocId: result.googleDocId,
      htmlContent: result.htmlContent,
    };
  } catch (error: unknown) {
    console.error("Error in submitReport handler:", error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to submit report",
    };
  }
};

export default submitReport;
export type { SubmitReportInput };
