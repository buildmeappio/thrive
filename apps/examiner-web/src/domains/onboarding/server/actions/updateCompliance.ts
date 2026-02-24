'use server';

import updateComplianceHandler from '../handlers/updateCompliance';

export const updateComplianceAction = async (data: {
  examinerProfileId: string;
  phipaCompliance?: boolean;
  pipedaCompliance?: boolean;
  medicalLicenseActive?: boolean;
  activationStep?: string;
}) => {
  try {
    return await updateComplianceHandler(data);
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message:
        (error instanceof Error ? error.message : undefined) ||
        'Failed to update compliance acknowledgments',
    };
  }
};
