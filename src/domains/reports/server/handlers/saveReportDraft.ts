import { reportService } from "../services/report.service";
import HttpError from "@/utils/httpError";
import { SaveReportDraftInput, SaveReportDraftResponse } from "../../types";

const saveReportDraft = async (
  payload: SaveReportDraftInput
): Promise<SaveReportDraftResponse> => {
  try {
    const { bookingId, reportData } = payload;

    if (!bookingId) {
      throw HttpError.badRequest("Booking ID is required");
    }

    if (!reportData) {
      throw HttpError.badRequest("Report data is required");
    }

    const result = await reportService.saveReportDraft(bookingId, reportData);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to save report draft",
      };
    }

    return {
      success: true,
      message: "Report draft saved successfully",
    };
  } catch (error: unknown) {
    console.error("Error in saveReportDraft handler:", error);
    return {
      success: false,
      message: error.message || "Failed to save report draft",
    };
  }
};

export default saveReportDraft;
export type { SaveReportDraftInput };

