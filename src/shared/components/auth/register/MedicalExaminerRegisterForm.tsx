'use client';
import React, { useState } from 'react';
import {
  Step1PersonalInfo,
  Step2MedicalCredentials,
  Step3IMEExperince,
  Step4ExperienceDetails,
  Step5Availablity,
  Step6Legal,
  Step7SubmitConfirmation,
  Step8ThankYou,
  Step9Password as _Step9Password,
  Step10Success as _Step10Success,
} from './medicalExaminerSteps';
import ProgressIndicator from './progressIndicator/ProgressIndicator';

export const MedicalExaminerRegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: any[] = [
    { component: Step1PersonalInfo },
    { component: Step2MedicalCredentials },
    { component: Step3IMEExperince },
    { component: Step4ExperienceDetails },
    { component: Step5Availablity },
    { component: Step6Legal },
    { component: Step7SubmitConfirmation },
    { component: Step8ThankYou },
    // { component: Step9Password },
    // { component: Step10Success },
  ];

  const goToNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
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
    <div className="mx-auto max-w-[900px] p-4 md:min-h-screen md:p-6">
      <div className="mb-4 flex h-[60px] items-center justify-between">
        {showTitle && (
          <h2 className="text-[19px] font-semibold md:text-[40px]">
            Let's complete your profile to join <span className="text-[#00A8FF]">Thrive.</span>
          </h2>
        )}
      </div>

      <div
        className="mt-4 rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:rounded-[47px] md:px-[50px] md:pb-10"
        style={{
          boxShadow: '0px 0px 36.35px 0px #00000008',
        }}
      >
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          gradientFrom="#89D7FF"
          gradientTo="#00A8FF"
        />

        {getCurrentStepComponent()}
      </div>
    </div>
  );
};
