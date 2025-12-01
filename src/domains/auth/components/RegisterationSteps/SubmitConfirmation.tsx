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
import {
  step6LegalSchema,
  Step6LegalInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step6InitialValues } from "@/domains/auth/constants/initialValues";
import { FormProvider } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";

const SubmitConfirmation: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  totalSteps,
  currentStep,
}) => {
  const { data, merge, isEditMode, examinerProfileId, reset } =
    useRegistrationStore();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<Step6LegalInput>({
    schema: step6LegalSchema,
    defaultValues: {
      ...step6InitialValues,
      consentBackgroundVerification: data.consentBackgroundVerification,
      agreeTermsConditions: data.agreeTermsConditions,
    },
    mode: "onSubmit",
  });

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

    setLoading(true);
    setErr(null);
    try {
      log(data);

      if (
        !data.medicalLicense ||
        !data.cvResume
        // || !data.signedNDA ||
        // !data.insuranceProof
      ) {
        setErr("Please upload all documents");
        setLoading(false);
        return;
      }

      const [
        medicalLicenseDocument,
        cvResumeDocument,
        // signedNDADocument,
        // insuranceProofDocument,
      ] = await Promise.all([
        data.medicalLicense &&
        "isExisting" in data.medicalLicense &&
        data.medicalLicense.isExisting
          ? { success: true, document: { id: data.medicalLicense.id } }
          : uploadFileToS3(data.medicalLicense as File),
        data.cvResume &&
        "isExisting" in data.cvResume &&
        data.cvResume.isExisting
          ? { success: true, document: { id: data.cvResume.id } }
          : uploadFileToS3(data.cvResume as File),
        // uploadFileToS3(data.signedNDA),
        // uploadFileToS3(data.insuranceProof),
      ]);

      if (
        !medicalLicenseDocument.success ||
        !cvResumeDocument.success
        // || !signedNDADocument.success ||
        // !insuranceProofDocument.success
      ) {
        setErr("Failed to upload documents");
        setLoading(false);
        return;
      }

      const payload: CreateMedicalExaminerInput = {
        // step 1
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.emailAddress,
        phone: data.phoneNumber,
        landlineNumber: data.landlineNumber,

        // step 2 - Address
        address: data.address || "",
        street: data.street || "",
        suite: data.suite || "",
        postalCode: data.postalCode || "",
        province: data.province || "",
        city: data.city || "",

        // step 2 - Medical Credentials
        specialties: data.medicalSpecialty,
        licenseNumber: data.licenseNumber,
        licenseExpiryDate: data.licenseExpiryDate
          ? new Date(data.licenseExpiryDate)
          : new Date(),
        medicalLicenseDocumentId: medicalLicenseDocument.document.id,
        resumeDocumentId: cvResumeDocument.document.id,

        // Step3
        yearsOfIMEExperience: data.yearsOfIMEExperience,
        forensicAssessmentTrained:
          data.forensicAssessmentTrained.toLowerCase() === "yes",

        // Step4
        experienceDetails: data.experienceDetails,

        // Step7
        agreeTermsConditions: data.agreeTermsConditions,
        consentBackgroundVerification: data.consentBackgroundVerification,

        // Step6 - Payment Details
        // IMEFee: data.IMEFee,
        // recordReviewFee: data.recordReviewFee,
        // hourlyRate: data.hourlyRate,
        // cancellationFee: data.cancellationFee,
      };

      let result;
      if (isEditMode && examinerProfileId) {
        // Update existing examiner
        result = await authActions.updateMedicalExaminer({
          examinerProfileId,
          ...payload,
        });
      } else {
        // Create new examiner
        result = await authActions.createMedicalExaminer(payload);
      }

      // Check if the action was successful
      if (result && !result.success) {
        setErr(result.message || "Submission failed");
        error("Submission failed:", result.message);
        setLoading(false);
        return;
      }

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
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
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
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor">
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
                  {fieldState.error && (
                    <p className="text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
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
                      <a
                        href="#"
                        className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                        Privacy Policy
                      </a>
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
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
              disabled={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default SubmitConfirmation;
