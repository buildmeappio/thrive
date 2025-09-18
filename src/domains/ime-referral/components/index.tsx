'use client';

import { useMemo, useState } from 'react';
import ClaimantDetails from './ClaimantDetails';
import ConsentInfo from './ConsentInfo';
import ReferralSubmitted from './ReferralSubmitted';
import ExaminationDetails from './ExaminationDetails';
import type { getCaseTypes } from '@/domains/auth/actions';
import LegalAndInsuranceDetailsForm from './LegalAndInsuranceDetails';
import ExamType from './ExamType';
import { type getExamTypes } from '../actions';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import DocumentUpload from './DocumentUpload';

interface StepConfig {
  component: React.ComponentType<StepProps>;
}

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

interface IMEReferralProps {
  caseTypes: Awaited<ReturnType<typeof getCaseTypes>>['result'];
  examTypes: Awaited<ReturnType<typeof getExamTypes>>['result'];
}

const IMEReferral: React.FC<IMEReferralProps> = ({ caseTypes, examTypes }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS: StepConfig[] = useMemo(
    () => [
      { component: ClaimantDetails },
      { component: LegalAndInsuranceDetailsForm },
      {
        component: (props: StepProps) => (
          <ExamType examTypes={convertToTypeOptions(examTypes)} {...props} />
        ),
      },
      {
        component: (props: StepProps) => (
          <ExaminationDetails caseTypes={convertToTypeOptions(caseTypes)} {...props} />
        ),
      },
      { component: DocumentUpload },
      { component: ConsentInfo },
      { component: ReferralSubmitted },
    ],
    [examTypes, caseTypes]
  );

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

  return <div>{renderCurrentStep()}</div>;
};

export default IMEReferral;
