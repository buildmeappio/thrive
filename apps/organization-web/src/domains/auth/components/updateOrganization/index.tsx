'use client';

import { useMemo, useState, useEffect } from 'react';
import { registerStepsTitles } from '@/config/registerStepsTitles';
import OrganizationInfo from '../Register/OrganizationInfo';
import OfficeDetails from '../Register/OfficeDetails';
import ComplianceAccess from '../Register/ComplianceAccess';
import VerificationCode from './VerificationCode';
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

interface UpdateOrganizationFormProps {
  organizationTypes: Awaited<ReturnType<typeof getOrganizationTypes>>;
  departmentTypes: Awaited<ReturnType<typeof getDepartments>>;
}

const UpdateOrganizationForm: React.FC<UpdateOrganizationFormProps> = ({
  organizationTypes,
  departmentTypes,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { setData } = useRegistrationStore();

  // Steps without password form (with read-only fields for update mode)
  const STEPS: StepConfig[] = useMemo(
    () => [
      {
        component: (prop: StepProps) => (
          <OrganizationInfo
            organizationTypes={convertToTypeOptions(organizationTypes)}
            isUpdateMode={true}
            {...prop}
          />
        ),
      },
      {
        component: (prop: StepProps) => (
          <OfficeDetails
            departmentTypes={convertToTypeOptions(departmentTypes)}
            isUpdateMode={true}
            {...prop}
          />
        ),
      },
      { component: ComplianceAccess },
      {
        component: (prop: StepProps) => <VerificationCode token={token || ''} {...prop} />,
      },
    ],
    [organizationTypes, departmentTypes, token]
  );

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
          toast.error('Invalid or missing token');
          return;
        }

        setToken(tokenParam);

        const result = await verifyAndGetOrganizationInfo(tokenParam);
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

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] flex-col items-center justify-center px-4 md:px-0">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#140047]"></div>
          <p className="text-lg text-gray-600">Loading organization information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center px-4 pb-12 md:px-0">
      <div className="flex items-center">
        <div className="grid place-items-center">
          {stepLabel && (
            <h2 className="mt-4 whitespace-nowrap py-2 text-center text-[24px] font-semibold leading-none tracking-[-0.03em] md:py-8 md:text-4xl md:text-[22px] lg:text-5xl xl:text-[54px]">
              {stepLabel}
            </h2>
          )}
        </div>
      </div>
      {renderCurrentStep()}
    </div>
  );
};

export default UpdateOrganizationForm;
