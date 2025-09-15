'use client';

import { useMemo, useState } from 'react';
import ClaimantDetails from './ClaimantDetails';
import CaseInfo from './CaseInfo';
import ConsentInfo from './ConsentInfo';
import ReferralSubmitted from './ReferralSubmitted';

import { formatLabel } from '@/shared/utils/labelFormat.utils';
import type { getCaseTypes, getExamFormats, getRequestedSpecialties } from '@/domains/auth/actions';

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
  examFormats: Awaited<ReturnType<typeof getExamFormats>>['result'];
  requestedSpecialties: Awaited<ReturnType<typeof getRequestedSpecialties>>['result'];
}

const IMEReferral: React.FC<IMEReferralProps> = ({
  caseTypes,
  examFormats,
  requestedSpecialties,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const convertToTypeOptions = (
    types:
      | IMEReferralProps['caseTypes']
      | IMEReferralProps['examFormats']
      | IMEReferralProps['requestedSpecialties']
  ) => {
    return (
      types?.map(type => ({
        value: type.id,
        label: formatLabel(type.name),
      })) || []
    );
  };

  const STEPS: StepConfig[] = useMemo(
    () => [
      { component: ClaimantDetails },
      {
        component: (props: StepProps) => (
          <CaseInfo
            caseTypes={convertToTypeOptions(caseTypes)}
            examFormats={convertToTypeOptions(examFormats)}
            requestedSpecialties={convertToTypeOptions(requestedSpecialties)}
            {...props}
          />
        ),
      },
      { component: ConsentInfo },
      { component: ReferralSubmitted },
    ],
    [caseTypes, examFormats, requestedSpecialties]
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
