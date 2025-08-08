"use client";
import React, { useState } from "react";
import {
  Step1PersonalInfo,
  Step2MedicalCredentials,
  Step3IMEExperince,
  Step4Specializations,
  Step5Experience,
  Step6Availability,
  Step7Documents,
  Step8Verification,
  Step9Review,
  Step10Completion,
} from "./medicalExaminerSteps";
import ProgressIndicator from "./progressIndicator/ProgressIndicator";

export const MedicalExaminerRegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: any[] = [
    { component: Step1PersonalInfo },
    { component: Step2MedicalCredentials },
    { component: Step3IMEExperince },
    { component: Step4Specializations },
    { component: Step5Experience },
    { component: Step6Availability },
    { component: Step7Documents },
    { component: Step8Verification },
    { component: Step9Review },
    { component: Step10Completion },
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
    <div className="mx-auto min-h-screen max-w-[900px] p-6">
      <div className="mb-4 flex h-[60px] items-center justify-between">
        {showTitle && (
          <h2 className="text-[40px] font-semibold">
            Let's complete your profile to join{" "}
            <span className="text-[#00A8FF]">Thrive.</span>
          </h2>
        )}
      </div>

      <div
        className="mt-6 min-h-[500px] rounded-[47px] bg-white px-[50px] pb-10"
        style={{
          boxShadow: "0px 0px 36.35px 0px #00000008",
        }}
      >
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          color="#00A8FF"
        />
        {getCurrentStepComponent()}
      </div>
    </div>
  );
};
