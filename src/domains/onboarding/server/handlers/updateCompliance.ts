import { dashboardService } from "@/domains/setting/server/services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type UpdateComplianceInput = {
  examinerProfileId: string;
  phipaCompliance?: boolean;
  pipedaCompliance?: boolean;
  medicalLicenseActive?: boolean;
  activationStep?: string;
};

const updateCompliance = async (payload: UpdateComplianceInput) => {
  try {
    const updatedProfile = await dashboardService.updateCompliance(
      payload.examinerProfileId,
      {
        phipaCompliance: payload.phipaCompliance,
        pipedaCompliance: payload.pipedaCompliance,
        medicalLicenseActive: payload.medicalLicenseActive,
        activationStep: payload.activationStep,
      }
    );

    return {
      success: true,
      message: "Compliance acknowledgments updated successfully",
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error("Error updating compliance:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE
    );
  }
};

export default updateCompliance;

