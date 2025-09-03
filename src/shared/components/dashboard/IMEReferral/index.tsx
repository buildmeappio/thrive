'use client';

import { useState } from 'react';
import { registerStepsTitles } from '@/shared/config/organizationRegister/registerStepsTitles';
import ClaimantDetails from './ClaimantDetails';
import CaseInfo from './CaseInfo';
import ConsentInfo from '../ConsentInfo';
import DocumentUpload from './DocumentUpload';
import ReferralSubmitted from '../ReferralSubmitted';

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
  { component: ClaimantDetails },
  { component: CaseInfo },
  { component: ConsentInfo },
  { component: DocumentUpload },
  { component: ReferralSubmitted },
];

const IMEReferral: React.FC = () => {
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

  return <div>{renderCurrentStep()}</div>;
};
export default IMEReferral;
