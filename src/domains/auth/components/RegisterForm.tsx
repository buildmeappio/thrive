"use client";
import React, { useEffect, useState } from "react";
import {
  PersonalInfo,
  MedicalCredentials,
  VerificationDocuments,
  IMEExperince,
  ExperienceDetails,
  SubmitConfirmation,
  ThankYou,
} from "./RegisterationSteps";
import { useRegistrationStore } from "@/domains/auth/state/useRegistrationStore";
import { log } from "@/utils/logger";
import { useGoogleMaps } from "@/lib/useGoogleMaps";
import { ExaminerProfileDetailsData } from "@/types/components";
import { YearsOfExperience, RegistrationStep } from "@/domains/auth/types";

const RegisterForm: React.FC<{
  yearsOfExperience: YearsOfExperience[];
  examinerData?: ExaminerProfileDetailsData;
}> = ({ yearsOfExperience, examinerData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { setYearsOfExperience, data, loadExaminerData, isEditMode } =
    useRegistrationStore();

  // Preload Google Maps API when the registration form loads
  useGoogleMaps();

  useEffect(() => {
    if (yearsOfExperience.length > 0) {
      setYearsOfExperience(yearsOfExperience);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearsOfExperience]);

  // Load examiner data if in edit mode
  useEffect(() => {
    if (examinerData) {
      // Check if it's an ExaminerApplication or ExaminerProfile
      if (examinerData.examinerApplication) {
        loadExaminerData(examinerData.examinerApplication);
      } else if (examinerData.examinerProfile) {
        loadExaminerData(examinerData.examinerProfile);
      }
    }
  }, [examinerData, loadExaminerData]);

  const steps: RegistrationStep[] = [
    { component: PersonalInfo },
    { component: MedicalCredentials },
    { component: VerificationDocuments },
    { component: IMEExperince },
    { component: ExperienceDetails },
    // { component: PaymentDetails },
    { component: SubmitConfirmation },
    { component: ThankYou },
  ];

  const goToNext = () => {
    log("goToNext", currentStep);
    log("data", data);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    const stepConfig = steps[currentStep - 1];
    if (!stepConfig) return null;
    const StepComponent = stepConfig.component;
    return (
      <StepComponent
        onNext={goToNext}
        onPrevious={goToPrevious}
        currentStep={currentStep}
        totalSteps={steps.length}
      />
    );
  };

  const showTitle = currentStep <= 6;
  return (
    <div className="mx-auto max-w-[900px] p-4 md:py-5 py-4">
      <div className="mb-2 flex h-[50px] items-center justify-between ">
        {showTitle && (
          <h2 className="md:ml-12 text-center text-3xl md:text-5xl font-semibold md:whitespace-nowrap">
            {isEditMode
              ? "Let's update your profile to join "
              : "Let's complete your profile to join "}
            <span className="text-[#00A8FF]">Thrive.</span>
          </h2>
        )}
      </div>
      {getCurrentStepComponent()}
    </div>
  );
};

export default RegisterForm;
