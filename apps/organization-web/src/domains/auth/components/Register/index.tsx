'use client';

import { useMemo, useState, useEffect } from 'react';
import { registerStepsTitles } from '@/config/registerStepsTitles';
import OrganizationInfo from './OrganizationInfo';
import OfficeDetails from './OfficeDetails';
import ComplianceAccess from './ComplianceAccess';
import VerificationCode from './VerificationCode';
import PasswordForm from './PasswordForm';
import type getDepartments from '../../server/handlers/getDepartments';
import type getOrganizationTypes from '../../../organization/server/handlers/getOrganizationTypes';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import { useSearchParams } from 'next/navigation';
import { verifyAndGetOrganizationInfo } from '@/domains/auth/actions';
import { toast } from 'sonner';
import { useRegistrationStore } from '@/store/useRegistration';
import log from '@/utils/log';

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
  organizationTypes: Awaited<ReturnType<typeof getOrganizationTypes>>;
  departmentTypes: Awaited<ReturnType<typeof getDepartments>>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ organizationTypes, departmentTypes }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { setData, _hasHydrated } = useRegistrationStore();

  // Check if we're in update mode (has token) - check searchParams directly for immediate check
  const tokenParam = searchParams.get('token');
  const isUpdateMode = !!tokenParam;

  // Load organization data if token is present
  useEffect(() => {
    const loadOrganizationData = async () => {
      const tokenParamFromUrl = searchParams.get('token');
      if (!tokenParamFromUrl) {
        return; // No token, proceed with normal registration
      }

      setIsLoading(true);
      try {
        const result = await verifyAndGetOrganizationInfo(tokenParamFromUrl);
        if (!result.success || !result.data) {
          toast.error('Failed to load organization information');
          return;
        }

        // Pre-fill the form with existing data
        const orgData = result.data;
        // Convert null values to empty strings to match FormData type
        if (orgData.step1) {
          setData('step1', {
            ...orgData.step1,
            streetAddress: orgData.step1.streetAddress ?? '',
            aptUnitSuite: orgData.step1.aptUnitSuite ?? '',
            city: orgData.step1.city ?? '',
            provinceOfResidence: orgData.step1.provinceOfResidence ?? '',
            postalCode: orgData.step1.postalCode ?? '',
          });
        }
        if (orgData.step2) {
          setData('step2', {
            ...orgData.step2,
            phoneNumber: orgData.step2.phoneNumber ?? '',
            jobTitle: orgData.step2.jobTitle ?? '',
            department: orgData.step2.department ?? '',
          });
        }
        if (orgData.step3) setData('step3', orgData.step3);

        toast.success('Organization information loaded successfully');
      } catch (error) {
        log.error('Error loading organization data:', error);
        toast.error('Failed to load organization information');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, [searchParams, setData]);

  const STEPS: StepConfig[] = useMemo(
    () => [
      {
        component: (prop: StepProps) => (
          <OrganizationInfo
            organizationTypes={convertToTypeOptions(organizationTypes)}
            isUpdateMode={isUpdateMode}
            {...prop}
          />
        ),
      },
      {
        component: (prop: StepProps) => (
          <OfficeDetails
            departmentTypes={convertToTypeOptions(departmentTypes)}
            isUpdateMode={isUpdateMode}
            {...prop}
          />
        ),
      },
      {
        component: (prop: StepProps) => (
          <ComplianceAccess isUpdateMode={isUpdateMode} token={tokenParam || undefined} {...prop} />
        ),
      },
      // Only show VerificationCode and PasswordForm if not in update mode
      ...(isUpdateMode ? [] : [{ component: VerificationCode }, { component: PasswordForm }]),
    ],
    [organizationTypes, departmentTypes, isUpdateMode, tokenParam]
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

  // Wait for store to hydrate before rendering
  if (!_hasHydrated || isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] flex-col items-center justify-center px-4 md:px-0">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#140047]"></div>
          <p className="text-lg text-gray-600">
            {isLoading ? 'Loading organization information...' : 'Loading form...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center px-4 pb-6 md:px-0">
      <div className="flex items-center">
        <div className="grid place-items-center">
          {stepLabel && (
            <h2 className="mt-2 text-center text-[24px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap md:py-4 md:text-4xl md:text-[20px] lg:text-4xl xl:text-[50px]">
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
