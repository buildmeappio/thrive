"use client";
import React, { useState } from "react";
import {
  Step1PersonalInfo,
  Step2ProfessionalInfo,
  Step3Credentials,
  Step4Specializations,
  Step5Experience,
  Step6Availability,
  Step7Documents,
  Step8Verification,
  Step9Review,
  Step10Completion,
} from "./medicalExaminerSteps";
import ProgressIndicator from "./progressIndicator/ProgressIndicator";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";

export const MedicalExaminerRegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const steps: any[] = [
    {
      component: Step1PersonalInfo,
    },
    {
      component: Step2ProfessionalInfo,
    },
    {
      component: Step3Credentials,
    },
    {
      component: Step4Specializations,
    },
    {
      component: Step5Experience,
    },
    {
      component: Step6Availability,
    },
    {
      component: Step7Documents,
    },
    {
      component: Step8Verification,
    },
    {
      component: Step9Review,
    },
    {
      component: Step10Completion,
    },
  ];

  const goToNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getCurrentStepComponent = () => {
    const stepConfig = steps[currentStep - 1];
    if (!stepConfig) return null;
    const StepComponent = stepConfig.component;
    return <StepComponent />;
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-4xl font-semibold">
          Let’s complete your profile to join
          <span className="text-[#00A8FF]">Thrive.</span>
        </h2>
      </div>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={steps.length}
        color="#00A8FF"
      />

      <div className="min-h-[500px] rounded-lg bg-white p-6">
        {getCurrentStepComponent()}
        <div className="mt-6 flex justify-between">
          <BackButton
            onClick={goToPrevious}
            disabled={currentStep === 1}
            borderColor="#00A8FF"
            iconColor="#00A8FF"
          />

          <ContinueButton
            onClick={goToNext}
            isLastStep={currentStep === steps.length}
            gradientFrom="#89D7FF"
            gradientTo="#00A8FF"
          />
        </div>
      </div>
    </div>
  );
};
