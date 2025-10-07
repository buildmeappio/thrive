'use client';

import { useMemo, useState } from 'react';
import ClaimantDetails from './ClaimantDetails';
import ConsentInfo from './ConsentInfo';
import ReferralSubmitted from './ReferralSubmitted';
import ExaminationDetails from './ExaminationDetails';
import LegalAndInsuranceDetailsForm from './LegalDetails';
import ExaminationType from './ExaminationType';
import type { getClaimTypes, getCaseTypes } from '../actions';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import DocumentUpload from './DocumentUpload';
import { type getExaminationTypes } from '@/domains/auth/actions';
import InsuranceDetails from './InsuranceDetails';
import type { getLanguages } from '@/domains/claimant/actions';

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
  claimTypes: Awaited<ReturnType<typeof getClaimTypes>>['result'];
  examinationTypes: Awaited<ReturnType<typeof getCaseTypes>>['result'];
  caseTypes: Awaited<ReturnType<typeof getExaminationTypes>>['result'];
  languages: Awaited<ReturnType<typeof getLanguages>>['result'];
}

const IMEReferral: React.FC<IMEReferralProps> = ({
  claimTypes,
  examinationTypes,
  caseTypes,
  languages,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS: StepConfig[] = useMemo(
    () => [
      {
        component: (props: StepProps) => (
          <ClaimantDetails claimTypes={convertToTypeOptions(claimTypes)} {...props} />
        ),
      },
      { component: InsuranceDetails },
      { component: LegalAndInsuranceDetailsForm },
      {
        component: (props: StepProps) => (
          <ExaminationType caseTypes={convertToTypeOptions(caseTypes)} {...props} />
        ),
      },
      {
        component: (props: StepProps) => (
          <ExaminationDetails
            examinationTypes={convertToTypeOptions(examinationTypes)}
            languages={convertToTypeOptions(languages)}
            {...props}
          />
        ),
      },
      { component: DocumentUpload },
      { component: ConsentInfo },
      { component: ReferralSubmitted },
    ],
    [claimTypes, caseTypes, examinationTypes, languages]
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
