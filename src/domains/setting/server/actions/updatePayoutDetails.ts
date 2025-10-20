"use server";

import updatePayoutDetails, {
  UpdatePayoutDetailsInput,
} from "../handlers/updatePayoutDetails";

export const updatePayoutDetailsAction = async (
  payload: UpdatePayoutDetailsInput
) => {
  try {
    const result = await updatePayoutDetails(payload);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update payout details",
    };
  }
};
