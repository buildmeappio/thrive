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
  } catch (error: unknown) {
    return {
      success: false,
      message: (error instanceof Error ? error.message : undefined) || "Failed to update payout details",
    };
  }
};

