"use client";
import React, { useState, useEffect } from "react";
import { ContinueButton, BackButton, ProgressIndicator } from "@/components";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { uploadFileToS3 } from "@/lib/s3";
import authActions from "@/domains/auth/actions";
import { CreateMedicalExaminerInput } from "@/domains/auth/server/handlers/createMedicalExaminer";
import { log, error } from "@/utils/logger";
import { DocumentFile } from "@/domains/auth/state/useRegistrationStore";
import {
  step6LegalSchema,
  Step6LegalInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step6InitialValues } from "@/domains/auth/constants/initialValues";
import { FormProvider } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

const SubmitConfirmation: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  totalSteps,
  currentStep,
}) => {
  const { data, merge, isEditMode, examinerProfileId, applicationId, reset } =
    useRegistrationStore();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const form = useForm<Step6LegalInput>({
    schema: step6LegalSchema,
    defaultValues: {
      ...step6InitialValues,
      consentBackgroundVerification: data.consentBackgroundVerification,
      agreeTermsConditions: data.agreeTermsConditions,
    },
    mode: "onSubmit",
  });

  // Watch checkboxes to enable/disable continue button
  const agreeTermsConditions = form.watch("agreeTermsConditions");
  const consentBackgroundVerification = form.watch(
    "consentBackgroundVerification",
  );

  // Both checkboxes must be checked
  const isFormComplete =
    agreeTermsConditions === true && consentBackgroundVerification === true;

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step6InitialValues,
      consentBackgroundVerification: data.consentBackgroundVerification,
      agreeTermsConditions: data.agreeTermsConditions,
    });
  }, [data.consentBackgroundVerification, data.agreeTermsConditions, form]);

  const handleSubmit = async () => {
    // Validate form first
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const formValues = form.getValues();
    // Merge form values into store
    merge(formValues as Partial<RegistrationData>);

    // Use merged data for submission (combine store data with form values)
    const submissionData = { ...data, ...formValues };

    setLoading(true);
    setErr(null);
    try {
      log(submissionData);

      if (
        !submissionData.medicalLicense
        // || !submissionData.signedNDA ||
        // !submissionData.insuranceProof
      ) {
        setErr("Please upload all required documents");
        setLoading(false);
        return;
      }

      // Helper function to process a single file (File or ExistingDocument)
      const processFile = async (file: DocumentFile) => {
        if (!file) {
          return { success: false as const, error: "No file provided" };
        }

        // Check if it's an existing document
        if ("isExisting" in file && file.isExisting) {
          return { success: true as const, document: { id: file.id } };
        }

        // It's a new File, upload it
        if (file instanceof File) {
          return await uploadFileToS3(file);
        }

        return { success: false as const, error: "Invalid file type" };
      };

      // Handle medicalLicense - can be array or single file
      const medicalLicenseFiles = Array.isArray(submissionData.medicalLicense)
        ? submissionData.medicalLicense
        : submissionData.medicalLicense
          ? [submissionData.medicalLicense]
          : [];

      if (medicalLicenseFiles.length === 0) {
        setErr("Please upload at least one medical license document");
        setLoading(false);
        return;
      }

      // Process all files in parallel (medical licenses + optional redacted report)
      const allFilePromises = [
        ...medicalLicenseFiles.map((file) => processFile(file)),
        ...(submissionData.redactedIMEReport
          ? [processFile(submissionData.redactedIMEReport)]
          : []),
      ];

      const allFileResults = await Promise.all(allFilePromises);

      // Separate medical license results from redacted report result
      const medicalLicenseResults = allFileResults.slice(
        0,
        medicalLicenseFiles.length,
      );
      const redactedReportResult = submissionData.redactedIMEReport
        ? allFileResults[medicalLicenseFiles.length]
        : null;

      // Check if all medical license uploads succeeded
      const failedUploads = medicalLicenseResults.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        // Get detailed error messages from failed uploads
        const errorMessages = failedUploads
          .map((r) => ("error" in r ? r.error : "Unknown error"))
          .join("; ");
        const errorMessage =
          failedUploads.length === medicalLicenseFiles.length
            ? `Failed to upload medical license documents: ${errorMessages}`
            : `Failed to upload ${failedUploads.length} of ${medicalLicenseFiles.length} medical license documents: ${errorMessages}`;
        setErr(errorMessage);
        error("Medical license upload failures:", failedUploads);
        setLoading(false);
        return;
      }

      // Extract all document IDs from successful uploads
      const medicalLicenseDocumentIds = medicalLicenseResults
        .filter((r) => r.success)
        .map((r) => r.document.id);

      if (medicalLicenseDocumentIds.length === 0) {
        setErr("Failed to upload medical license documents");
        setLoading(false);
        return;
      }

      // Handle optional redacted IME report
      let redactedIMEReportDocumentId: string | undefined;
      if (redactedReportResult && redactedReportResult.success) {
        redactedIMEReportDocumentId = redactedReportResult.document.id;
      } else if (redactedReportResult && !redactedReportResult.success) {
        // Don't fail submission for optional document
        console.warn(
          "Failed to upload redacted IME report (optional):",
          redactedReportResult.error,
        );
      }

      const payload: CreateMedicalExaminerInput = {
        // Step 1 - Personal Info
        firstName: submissionData.firstName,
        lastName: submissionData.lastName,
        email: submissionData.emailAddress,
        phone: submissionData.phoneNumber,
        landlineNumber: submissionData.landlineNumber,
        languagesSpoken: submissionData.languagesSpoken || [],

        // Step 1 - Address (from PersonalInfo step - only city and province are collected)
        address: "", // Not collected in current flow
        street: "", // Not collected in current flow
        suite: "", // Not collected in current flow
        postalCode: "", // Not collected in current flow
        province: submissionData.province || "",
        city: submissionData.city || "",

        // Step 2 - Medical Credentials
        specialties: submissionData.medicalSpecialty,
        licenseNumber: submissionData.licenseNumber,
        licenseIssuingProvince: submissionData.licenseIssuingProvince || "",
        yearsOfIMEExperience: submissionData.yearsOfIMEExperience,
        licenseExpiryDate: submissionData.licenseExpiryDate
          ? new Date(submissionData.licenseExpiryDate)
          : new Date(),
        medicalLicenseDocumentIds: medicalLicenseDocumentIds,

        // Step 3 - IME Background & Experience
        imesCompleted: submissionData.imesCompleted || "",
        currentlyConductingIMEs:
          submissionData.currentlyConductingIMEs === "yes",
        assessmentTypes: submissionData.assessmentTypes || [],
        ...(redactedIMEReportDocumentId && { redactedIMEReportDocumentId }),

        // Step 4 - Experience Details
        experienceDetails: submissionData.experienceDetails,

        // Step 6 - Legal Agreements
        agreeTermsConditions: submissionData.agreeTermsConditions,
        consentBackgroundVerification:
          submissionData.consentBackgroundVerification,
      };

      let result;
      if (isEditMode && applicationId) {
        // Update existing examiner application
        result = await authActions.updateExaminerApplication({
          applicationId,
          ...payload,
        });
      } else if (isEditMode && examinerProfileId) {
        // Update existing examiner profile (legacy flow)
        result = await authActions.updateMedicalExaminer({
          examinerProfileId,
          ...payload,
        });
      } else {
        // Create new examiner application
        result = await authActions.createMedicalExaminer(payload);
      }

      // Check if the action was successful
      if (result && !result.success) {
        setErr(result.message || "Submission failed");
        error("Submission failed:", result.message);
        setLoading(false);
        return;
      }

      // Send registration confirmation emails asynchronously (don't block submission)
      // For new applications, use applicationId; for updates, use applicationId or examinerProfileId
      const profileId = isEditMode
        ? applicationId || examinerProfileId || ""
        : (result as { applicationId?: string }).applicationId || "";

      // Fire and forget - don't wait for email to complete
      authActions
        .sendRegistrationEmails({
          examinerData: {
            firstName: submissionData.firstName,
            lastName: submissionData.lastName,
            email: submissionData.emailAddress,
            province: submissionData.province || "",
            licenseNumber: submissionData.licenseNumber,
            specialties: submissionData.medicalSpecialty,
            imeExperience: submissionData.yearsOfIMEExperience,
            imesCompleted: submissionData.imesCompleted || "",
          },
          examinerProfileId: profileId, // For new applications, this will be applicationId
        })
        .catch((emailError) => {
          // Log but don't fail the submission
          console.error("Failed to send notification emails:", emailError);
        });

      // Clear localStorage after successful submission
      reset();
      localStorage.removeItem("examiner-registration-storage");

      onNext?.();
    } catch (e: unknown) {
      // Handle unexpected errors
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred";
      error("Submission error:", e);
      setErr(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <FormProvider form={form} onSubmit={handleSubmit}>
        <div className="space-y-6 pt-4 pb-8 px-6 md:py-15">
          <div className="pt-1 md:pt-0">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-semibold text-[#140047] md:mt-5 md:mb-0 md:text-[40px]">
              {isEditMode ? "Ready to Update?" : "Ready to Submit?"}
            </h3>
            <div className="mt-4 text-center text-[14px] leading-relaxed font-light text-[#8A8A8A] md:text-base">
              <p className="text-center">
                {isEditMode
                  ? "Your updated Medical Examiner profile is ready for review. Please confirm that all information and documents are accurate. Once submitted, our team will review your updates."
                  : "Your Medical Examiner profile is ready for review. Please confirm that all information and documents are accurate. Once submitted, our team will begin the verification process."}
              </p>
            </div>
            {err && (
              <div className="mt-4 mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Submission Error
                    </h3>
                    <p className="mt-1 text-sm text-red-700">{err}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2 md:px-0 px-8">
            <Controller
              name="consentBackgroundVerification"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                      checkedColor="#00A8FF"
                      checkIconColor="white"
                    />
                    <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                      Consent to Background Verification
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldState.error &&
                    (() => {
                      const errorMsg = fieldState.error.message;
                      const isRequiredError =
                        errorMsg &&
                        (errorMsg.toLowerCase() === "required" ||
                          errorMsg.toLowerCase().endsWith(" is required") ||
                          errorMsg.toLowerCase() === "is required");
                      return !isRequiredError ? (
                        <p className="text-xs text-red-500">{errorMsg}</p>
                      ) : null;
                    })()}
                </div>
              )}
            />

            <Controller
              name="agreeTermsConditions"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="ml-0 flex items-center space-x-2 md:ml-5">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                      checkedColor="#00A8FF"
                      checkIconColor="white"
                    />
                    <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                      Agree to{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsTermsModalOpen(true);
                        }}
                        className="text-[#00A8FF] cursor-pointer underline decoration-[#00A8FF] hover:decoration-[#0088CC]"
                      >
                        Terms & Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsPrivacyModalOpen(true);
                        }}
                        className="text-[#00A8FF] cursor-pointer underline decoration-[#00A8FF] hover:decoration-[#0088CC]"
                      >
                        Privacy Policy
                      </button>
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldState.error &&
                    (() => {
                      const errorMsg = fieldState.error.message;
                      const isRequiredError =
                        errorMsg &&
                        (errorMsg.toLowerCase() === "required" ||
                          errorMsg.toLowerCase().endsWith(" is required") ||
                          errorMsg.toLowerCase() === "is required");
                      return !isRequiredError ? (
                        <p className="text-xs text-red-500">{errorMsg}</p>
                      ) : null;
                    })()}
                </div>
              )}
            />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 px-2 pb-8 md:mt-12 md:justify-between md:gap-4 md:px-0">
          <BackButton
            onClick={onPrevious}
            disabled={currentStep === 1 || loading}
            borderColor="#00A8FF"
            iconColor="#00A8FF"
          />
          <ContinueButton
            onClick={form.handleSubmit(handleSubmit)}
            isLastStep={true}
            gradientFrom="#89D7FF"
            gradientTo="#00A8FF"
            loading={loading}
            disabled={!isFormComplete || form.formState.isSubmitting || loading}
          />
        </div>
      </FormProvider>

      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};

export default SubmitConfirmation;
