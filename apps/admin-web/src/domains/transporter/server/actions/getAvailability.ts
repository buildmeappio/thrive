export type GetTransporterAvailabilityInput = { transporterId: string };

export const getTransporterAvailabilityAction = async (input: GetTransporterAvailabilityInput) => {
  try {
    const { default: getAvailability } = await import('../handlers/getAvailability');
    const result = await getAvailability(input);
    return result;
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || 'Failed to fetch availability',
    };
  }
};
