'use client';

import { useState, useMemo, useEffect } from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordForm from './PasswordForm';
import SuccessScreen from '../Register/SuccessScreen';
import { useRegistrationStore } from '@/store/useRegistration';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import type { Department } from '@prisma/client';
import type getDepartments from '@/domains/auth/server/handlers/getDepartments';

interface InvitationData {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface InvitationRegisterFormProps {
  token: string;
  invitationData: InvitationData;
  departmentTypes: Awaited<ReturnType<typeof getDepartments>>;
}

const InvitationRegisterForm: React.FC<InvitationRegisterFormProps> = ({
  token,
  invitationData,
  departmentTypes: departments,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { setData, _hasHydrated } = useRegistrationStore();

  // Convert departments to options format
  const departmentTypes = useMemo(() => convertToTypeOptions(departments), [departments]);

  // Pre-fill email in store
  useEffect(() => {
    if (_hasHydrated && invitationData.email) {
      setData('step2', {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        officialEmailAddress: invitationData.email,
        department: '',
      });
    }
  }, [_hasHydrated, invitationData.email, setData]);

  const goToNext = (): void => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const STEPS = [
    {
      title: 'Enter Your Personal Details',
      component: PersonalInfoForm,
    },
    {
      title: 'Create Your Password',
      component: PasswordForm,
    },
    {
      title: 'Success',
      component: SuccessScreen,
    },
  ];

  const renderCurrentStep = () => {
    const stepConfig = STEPS[currentStep - 1];
    if (!stepConfig) return null;

    if (currentStep === 3) {
      // Success screen - render directly since it has different props
      return (
        <SuccessScreen
          organizationName={invitationData.organizationName}
          onContinue={() => {
            // Will be handled by SuccessScreen's auto-redirect
          }}
        />
      );
    }

    const StepComponent = stepConfig.component;
    return (
      <StepComponent
        onNext={goToNext}
        onPrevious={goToPrevious}
        currentStep={currentStep}
        totalSteps={2}
        token={token}
        invitationData={invitationData}
        departmentTypes={departmentTypes}
      />
    );
  };

  if (!_hasHydrated) {
    return (
      <div className="mx-auto flex min-h-[400px] flex-col items-center justify-center px-4 md:px-0">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#140047]"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center px-4 pb-6 md:px-0">
      <div className="flex items-center">
        <div className="grid place-items-center">
          {currentStep <= STEPS.length && (
            <h2 className="mt-2 text-center text-[24px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap md:py-4 md:text-4xl md:text-[20px] lg:text-4xl xl:text-[50px]">
              {STEPS[currentStep - 1].title}
            </h2>
          )}
        </div>
      </div>
      {renderCurrentStep()}
    </div>
  );
};

export default InvitationRegisterForm;
