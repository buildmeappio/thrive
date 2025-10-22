'use client';

import { useMemo, useState } from 'react';
import ClaimantDetails from './ClaimantDetails';
import ConsentInfo from './ConsentInfo';
import ReferralSubmitted from './ReferralSubmitted';
import ExaminationDetails from './ExaminationDetails';
import LegalAndInsuranceDetailsForm from './LegalDetails';
import type { getClaimTypes, getCaseTypes, getCaseData } from '../actions';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import DocumentUpload from './DocumentUpload';
import { type getExaminationTypes } from '@/domains/auth/server/handlers';
import InsuranceDetails from './InsuranceDetails';
import type { getLanguages } from '@/domains/claimant/actions';

type StepConfig = {
  component: React.ComponentType<StepProps>;
};

type StepProps = {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
  mode?: 'create' | 'edit';
  initialData?: Awaited<ReturnType<typeof getCaseData>>['result'];
};

type IMEReferralProps = {
  examinationId: string;
  claimTypes: Awaited<ReturnType<typeof getClaimTypes>>['result'];
  examinationTypes: Awaited<ReturnType<typeof getExaminationTypes>>;
  caseTypes: Awaited<ReturnType<typeof getCaseTypes>>['result'];
  languages: Awaited<ReturnType<typeof getLanguages>>['result'];
  mode?: 'create' | 'edit';
  initialData?: Awaited<ReturnType<typeof getCaseData>>['result'];
};

const IMEReferralEdit: React.FC<IMEReferralProps> = ({
  examinationId,
  claimTypes,
  examinationTypes,
  caseTypes,
  languages,
  mode = 'edit',
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS: StepConfig[] = useMemo(
    () => [
      {
        component: (props: StepProps) => (
          <ClaimantDetails
            claimTypes={convertToTypeOptions(claimTypes)}
            claimantData={initialData?.step1}
            {...props}
          />
        ),
      },
      {
        component: (props: StepProps) => (
          <InsuranceDetails insuranceData={initialData?.step2} {...props} />
        ),
      },
      {
        component: (props: StepProps) => (
          <LegalAndInsuranceDetailsForm legalData={initialData?.step3} {...props} />
        ),
      },
      {
        component: (props: StepProps) => (
          <ExaminationDetails
            examinationTypes={convertToTypeOptions(examinationTypes)}
            languages={convertToTypeOptions(languages)}
            examinationData={initialData?.step5}
            caseData={initialData?.step4}
            {...props}
          />
        ),
      },
      {
        component: (props: StepProps) => (
          <DocumentUpload initialData={initialData?.step6} {...props} />
        ),
      },
      {
        component: (props: StepProps) => (
          <ConsentInfo
            examinationId={examinationId}
            mode={mode}
            initialData={initialData?.step7}
            {...props}
          />
        ),
      },
      { component: ReferralSubmitted },
    ],
    [claimTypes, caseTypes, examinationTypes, languages, mode, initialData]
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
        mode={mode}
      />
    );
  };

  return <div>{renderCurrentStep()}</div>;
};

export default IMEReferralEdit;
