"use server";

import getPayoutDetails, {
  GetPayoutDetailsInput,
} from "../handlers/getPayoutDetails";

export const getPayoutDetailsAction = async (
  payload: GetPayoutDetailsInput
) => {
  try {
    const result = await getPayoutDetails(payload);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch payout details",
    };
  }
};
