'use client';

import { useState } from 'react';
import { registerStepsTitles } from '@/shared/config/organizationRegister/registerStepsTitles';
import { ComplianceAccess, OfficeDetails, OrganizationInfo, PasswordForm, VerificationCode } from './steps';

interface StepConfig {
  component: React.ComponentType<StepProps>;
}

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

const STEPS: StepConfig[] = [
  { component: OrganizationInfo },
  { component: OfficeDetails },
  { component: ComplianceAccess },
  { component: VerificationCode },
  { component: PasswordForm },
];

const OrganizationRegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const goToNext = (): void => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderCurrentStep = (): React.ReactElement | null => {
    const stepConfig = STEPS[currentStep - 1];
    
    if (!stepConfig) return null;
    
    const StepComponent = stepConfig.component;
    
    return (
      <StepComponent
        onNext={goToNext}
        onPrevious={goToPrevious}
        currentStep={currentStep}
        totalSteps={STEPS.length}
      />
    );
  };

  const getStepLabel = (): string | null => {
    return currentStep <= registerStepsTitles.length 
      ? registerStepsTitles[currentStep - 1].label 
      : null;
  };

  const stepLabel = getStepLabel();

  return (
    <div className="mx-auto  flex flex-col items-center justify-center p-4 md:p-0">
      <div className="flex items-center">
        <div className="grid place-items-center">
          {stepLabel && (
            <h2 className="py-6 text-center text-[22px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap md:text-4xl lg:text-5xl xl:text-[54px]">
              {stepLabel}
            </h2>
          )}
        </div>
      </div>
      {renderCurrentStep()}
    </div>
  );
};
export default OrganizationRegisterForm;