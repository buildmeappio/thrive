import { dashboardService } from "@/domains/setting/server/services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type UpdateDocumentsInput = {
  examinerProfileId: string;
  medicalLicenseDocumentIds?: string[];
  governmentIdDocumentId?: string;
  resumeDocumentId?: string;
  insuranceDocumentId?: string;
  specialtyCertificatesDocumentIds?: string[];
  activationStep?: string;
};

const updateDocuments = async (payload: UpdateDocumentsInput) => {
  try {
    // Note: governmentIdDocumentId and specialtyCertificatesDocumentIds
    // may need to be added to the ExaminerProfile schema
    const updatedProfile = await dashboardService.updateDocuments(
      payload.examinerProfileId,
      {
        medicalLicenseDocumentIds: payload.medicalLicenseDocumentIds,
        governmentIdDocumentId: payload.governmentIdDocumentId,
        resumeDocumentId: payload.resumeDocumentId,
        insuranceDocumentId: payload.insuranceDocumentId,
        specialtyCertificatesDocumentIds: payload.specialtyCertificatesDocumentIds,
        activationStep: payload.activationStep,
      }
    );

    return {
      success: true,
      message: "Documents updated successfully",
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error("Error updating documents:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE
    );
  }
};

export default updateDocuments;

