"use client";
import React, { useState } from "react";
import { ContinueButton, BackButton, ProgressIndicator } from "@/components";
import { RegStepProps } from "@/domains/auth/types/index";
import { useRegistrationStore } from "@/domains/auth/state/useRegistrationStore";
import { uploadFileToS3 } from "@/lib/s3";
import authActions from "@/domains/auth/actions";
import { CreateMedicalExaminerInput } from "@/domains/auth/server/handlers/createMedicalExaminer";

const SubmitConfirmation: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  totalSteps,
  currentStep,
}) => {
  const { data, isEditMode, examinerProfileId, reset } = useRegistrationStore();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setErr(null);
    try {
      console.log(data);

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
        provinceOfResidence: data.provinceOfResidence,
        mailingAddress: data.mailingAddress,

        // step 2
        specialties: data.medicalSpecialty,
        licenseNumber: data.licenseNumber,
        provinceOfLicensure: data.provinceOfLicensure,
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        medicalLicenseDocumentId: medicalLicenseDocument.document.id,
        resumeDocumentId: cvResumeDocument.document.id,

        // Step3
        yearsOfIMEExperience: data.yearsOfIMEExperience,
        languagesSpoken: data.languagesSpoken,
        forensicAssessmentTrained:
          data.forensicAssessmentTrained.toLowerCase() === "yes",

        // Step4
        experienceDetails: data.experienceDetails,

        // Step5
        preferredRegions: data.preferredRegions,
        maxTravelDistance: data.maxTravelDistance,
        acceptVirtualAssessments: data.acceptVirtualAssessments === "yes",
        // signedNDADocumentId: signedNDADocument.document.id,
        // insuranceProofDocumentId: insuranceProofDocument.document.id,
        agreeTermsConditions: data.agreeTermsConditions,
        consentBackgroundVerification: data.consentBackgroundVerification,
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
      console.error("Submission error:", e);
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

      <div className="space-y-6 px-4 pt-4 pb-8 md:px-20 md:py-15">
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

        <div className="mt-8 flex flex-row justify-start gap-4 md:mt-14 md:justify-center md:gap-26">
          <BackButton
            onClick={onPrevious}
            disabled={currentStep === 1 || loading}
            borderColor="#00A8FF"
            iconColor="#00A8FF"
          />
          <ContinueButton
            onClick={handleSubmit}
            isLastStep={true}
            gradientFrom="#89D7FF"
            gradientTo="#00A8FF"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmation;
