'use client';

import { useMemo, useState } from 'react';
import { registerStepsTitles } from '@/shared/config/registerStepsTitles';
import OrganizationInfo from './OrganizationInfo';
import OfficeDetails from './OfficeDetails';
import ComplianceAccess from './ComplianceAccess';
import VerificationCode from './VerificationCode';
import PasswordForm from './PasswordForm';
import type {
  getDepartmentAction,
  getOrganizationTypeAction,
} from '@/features/organization.actions';
import { formatLabel } from '@/shared/utils/labelFormat.utils';

interface StepConfig {
  component: React.ComponentType<StepProps>;
}

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

interface RegisterFormProps {
  organizationTypes: Awaited<ReturnType<typeof getOrganizationTypeAction>>['result'];
  departmentTypes: Awaited<ReturnType<typeof getDepartmentAction>>['result'];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ organizationTypes, departmentTypes }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const convertToTypeOptions = (
    types: RegisterFormProps['organizationTypes'] | RegisterFormProps['departmentTypes']
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
      {
        component: (prop: StepProps) => (
          <OrganizationInfo organizationTypes={convertToTypeOptions(organizationTypes)} {...prop} />
        ),
      },
      {
        component: (prop: StepProps) => (
          <OfficeDetails departmentTypes={convertToTypeOptions(departmentTypes)} {...prop} />
        ),
      },
      { component: ComplianceAccess },
      { component: VerificationCode },
      { component: PasswordForm },
    ],
    [organizationTypes, departmentTypes]
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

  const getStepLabel = (): string | null => {
    return currentStep <= registerStepsTitles.length
      ? registerStepsTitles[currentStep - 1].label
      : null;
  };

  const stepLabel = getStepLabel();

  return (
    <div className="mx-auto flex flex-col items-center justify-center px-4 pb-12 md:px-0">
      <div className="flex items-center">
        <div className="grid place-items-center">
          {stepLabel && (
            <h2 className="mt-4 py-2 text-center text-[18px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap md:py-8 md:text-4xl md:text-[22px] lg:text-5xl xl:text-[54px]">
              {stepLabel}
            </h2>
          )}
        </div>
      </div>
      {renderCurrentStep()}
    </div>
  );
};
export default RegisterForm;
