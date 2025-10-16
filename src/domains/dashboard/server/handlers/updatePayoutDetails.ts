import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type UpdatePayoutDetailsInput = {
  examinerProfileId: string;
  payoutMethod: "direct_deposit" | "cheque" | "interac";
  transitNumber?: string;
  institutionNumber?: string;
  accountNumber?: string;
  chequeMailingAddress?: string;
  interacEmail?: string;
  activationStep?: string;
};

const updatePayoutDetails = async (payload: UpdatePayoutDetailsInput) => {
  try {
    const updatedProfile = await dashboardService.updatePayoutDetails(
      payload.examinerProfileId,
      {
        payoutMethod: payload.payoutMethod,
        transitNumber: payload.transitNumber,
        institutionNumber: payload.institutionNumber,
        accountNumber: payload.accountNumber,
        chequeMailingAddress: payload.chequeMailingAddress,
        interacEmail: payload.interacEmail,
        activationStep: payload.activationStep,
      }
    );

    return {
      success: true,
      message: "Payout details updated successfully",
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error("Error updating payout details:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE
    );
  }
};

export default updatePayoutDetails;
