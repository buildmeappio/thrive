import { useState } from "react";
import { toast } from "sonner";
import authActions from "../actions";
import { useRegistrationStore, RegistrationData } from "../state/useRegistrationStore";
import { uploadFileToS3 } from "@/lib/s3";

export const useSaveApplicationProgress = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { merge } = useRegistrationStore();

  const saveProgress = async (currentFormValues?: Partial<RegistrationData>) => {
    // If current form values are provided, merge them into the store first
    if (currentFormValues) {
      merge(currentFormValues);
    }
    
    // Get the latest data from store (which now includes current form values if provided)
    const storeData = useRegistrationStore.getState().data;
    if (!storeData.emailAddress) {
      toast.error("Email is required to save your progress");
      return;
    }

    setIsSaving(true);
    try {
      // Prepare file uploads
      const medicalLicenseFiles: File[] = [];
      let redactedIMEReportFile: File | null = null;
      const existingMedicalLicenseDocumentIds: string[] = [];
      let existingRedactedIMEReportDocumentId: string | undefined;

      // Handle medical license files
      if (storeData.medicalLicense) {
        if (Array.isArray(storeData.medicalLicense)) {
          storeData.medicalLicense.forEach((file) => {
            if (file instanceof File) {
              medicalLicenseFiles.push(file);
            } else if (file && typeof file === "object" && "isExisting" in file && file.isExisting) {
              existingMedicalLicenseDocumentIds.push(file.id);
            }
          });
        } else if (storeData.medicalLicense instanceof File) {
          medicalLicenseFiles.push(storeData.medicalLicense);
        } else if (storeData.medicalLicense && typeof storeData.medicalLicense === "object" && "isExisting" in storeData.medicalLicense && storeData.medicalLicense.isExisting) {
          existingMedicalLicenseDocumentIds.push(storeData.medicalLicense.id);
        }
      }

      // Handle redacted IME report
      if (storeData.redactedIMEReport) {
        if (storeData.redactedIMEReport instanceof File) {
          redactedIMEReportFile = storeData.redactedIMEReport;
        } else if (storeData.redactedIMEReport && typeof storeData.redactedIMEReport === "object" && "isExisting" in storeData.redactedIMEReport && storeData.redactedIMEReport.isExisting) {
          existingRedactedIMEReportDocumentId = storeData.redactedIMEReport.id;
        }
      }

      // Upload new files if any
      let uploadedMedicalLicenseIds: string[] = [];
      if (medicalLicenseFiles.length > 0) {
        const uploadPromises = medicalLicenseFiles.map((file) => uploadFileToS3(file));
        const uploadResults = await Promise.all(uploadPromises);
        uploadedMedicalLicenseIds = uploadResults
          .filter((r) => r.success)
          .map((r) => r.document.id);
      }

      let uploadedRedactedReportId: string | undefined;
      if (redactedIMEReportFile) {
        const uploadResult = await uploadFileToS3(redactedIMEReportFile);
        if (uploadResult.success) {
          uploadedRedactedReportId = uploadResult.document.id;
        }
      }

      // Merge existing and new document IDs
      const allMedicalLicenseIds = [
        ...existingMedicalLicenseDocumentIds,
        ...uploadedMedicalLicenseIds,
      ];

      // Prepare save payload
      const savePayload: any = {
        email: storeData.emailAddress,
        firstName: storeData.firstName,
        lastName: storeData.lastName,
        phone: storeData.phoneNumber,
        landlineNumber: storeData.landlineNumber,
        province: storeData.province,
        city: storeData.city,
        address: storeData.address,
        street: storeData.street,
        suite: storeData.suite,
        postalCode: storeData.postalCode,
        specialties: storeData.medicalSpecialty,
        licenseNumber: storeData.licenseNumber,
        licenseIssuingProvince: storeData.licenseIssuingProvince,
        yearsOfIMEExperience: storeData.yearsOfIMEExperience,
        licenseExpiryDate: storeData.licenseExpiryDate
          ? new Date(storeData.licenseExpiryDate)
          : undefined,
        languagesSpoken: storeData.languagesSpoken,
        imesCompleted: storeData.imesCompleted,
        currentlyConductingIMEs:
          storeData.currentlyConductingIMEs === "yes" ? true : storeData.currentlyConductingIMEs === "no" ? false : undefined,
        assessmentTypes: storeData.assessmentTypes,
        experienceDetails: storeData.experienceDetails,
        consentBackgroundVerification: storeData.consentBackgroundVerification,
        agreeTermsConditions: storeData.agreeTermsConditions,
      };

      // Add document IDs if we have any
      if (allMedicalLicenseIds.length > 0) {
        savePayload.existingMedicalLicenseDocumentIds = allMedicalLicenseIds;
      }

      if (uploadedRedactedReportId) {
        savePayload.redactedIMEReport = null; // Will be handled by existingRedactedIMEReportDocumentId
        savePayload.existingRedactedIMEReportDocumentId = uploadedRedactedReportId;
      } else if (existingRedactedIMEReportDocumentId) {
        savePayload.existingRedactedIMEReportDocumentId = existingRedactedIMEReportDocumentId;
      }

      // Save progress
      const saveResult = await authActions.saveApplicationProgress(savePayload);

      if (!saveResult.success) {
        throw new Error(saveResult.message || "Failed to save progress");
      }

      // Check if applicationId exists in the result
      if (!("applicationId" in saveResult) || !saveResult.applicationId) {
        throw new Error("Failed to get application ID from save result");
      }

      // Send resume link email
      const emailResult = await authActions.sendResumeLink({
        email: storeData.emailAddress,
        applicationId: saveResult.applicationId,
        firstName: storeData.firstName,
        lastName: storeData.lastName,
      });

      if (!emailResult.success) {
        // Still show success even if email fails (progress was saved)
        console.warn("Failed to send resume link email:", emailResult.message);
      }

      toast.success("Your progress has been saved!", {
        description: "We've emailed you a secure link to resume your application anytime.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress", {
        description: error?.message || "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProgress, isSaving };
};

