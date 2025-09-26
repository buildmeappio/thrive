'use client';
import React, { useEffect, useState } from 'react';
import {
  Step1PersonalInfo,
  Step2MedicalCredentials,
  Step3IMEExperince,
  Step4ExperienceDetails,
  Step6Legal,
  Step7SubmitConfirmation,  
  Step8ThankYou,
} from './RegisterationSteps';
import { RegStepProps } from '@/domains/auth/types/index';
import { Language } from '@prisma/client';
import { useRegistrationStore } from '@/domains/auth/state/useRegistrationStore';


interface Step {
  component: React.ComponentType<RegStepProps>;
}

const RegisterForm: React.FC<{ languages: Language[] }> = ({ languages }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { setLanguages, data } = useRegistrationStore();

  useEffect(() => {
    if (languages.length > 0) {
      setLanguages(languages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages]);


  const steps: Step[] = [
    { component: Step1PersonalInfo },
    { component: Step2MedicalCredentials },
    { component: Step3IMEExperince },
    { component: Step4ExperienceDetails },
    { component: Step6Legal },
    { component: Step7SubmitConfirmation },
    { component: Step8ThankYou },
  ];

  const goToNext = () => {
    console.log('goToNext', currentStep);
    console.log('data', data);
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
    <div className="mx-auto max-w-[900px] p-4 md:min-h-screen md:p-0 md:py-6">
      <div className="mb-6 flex h-[60px] items-center justify-between">
        {showTitle && (
          <h2 className="text-center text-[22px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap md:text-4xl lg:text-5xl xl:text-[54px]">
            Let&apos;s complete your profile to join <span className="text-[#00A8FF]">Thrive.</span>
          </h2>
        )}
      </div>
      {getCurrentStepComponent()}
    </div>
  );
};

export default RegisterForm;