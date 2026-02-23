import getAvailability, {
  type GetAvailabilityInput,
} from "../handlers/getAvailability";

export const getTransporterAvailabilityAction = async (
  input: GetAvailabilityInput,
) => {
  try {
    const result = await getAvailability(input);
    return result;
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || "Failed to fetch availability",
    };
  }
};
