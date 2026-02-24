'use client';

import { useState, useMemo } from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordForm from './PasswordForm';
import SuccessScreen from '../Register/SuccessScreen';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import type { Department } from '@thrive/database';
import type getDepartments from '@/domains/auth/server/handlers/getDepartments';

interface InvitationData {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  officialEmailAddress: string;
  jobTitle?: string;
  department: string;
}

interface PasswordData {
  password: string;
  confirmPassword: string;
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
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordData | null>(null);

  // Convert departments to options format
  const departmentTypes = useMemo(() => convertToTypeOptions(departments), [departments]);

  const handlePersonalInfoNext = (data: PersonalInfoData) => {
    setPersonalInfo(data);
    setCurrentStep(2);
  };

  const handlePasswordNext = (data: PasswordData) => {
    setPasswordData(data);
    setCurrentStep(3);
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
      if (!personalInfo || !passwordData) {
        // If data is missing, go back to appropriate step
        if (!personalInfo) {
          setCurrentStep(1);
        } else if (!passwordData) {
          setCurrentStep(2);
        }
        return null;
      }
      return (
        <SuccessScreen
          organizationName={invitationData.organizationName}
          token={token}
          invitationData={invitationData}
          personalInfo={personalInfo}
          passwordData={passwordData}
          onContinue={() => {
            // Will be handled by SuccessScreen's auto-redirect
          }}
        />
      );
    }

    if (currentStep === 1) {
      return (
        <PersonalInfoForm
          onNext={handlePersonalInfoNext}
          onPrevious={goToPrevious}
          currentStep={currentStep}
          totalSteps={2}
          token={token}
          invitationData={invitationData}
          departmentTypes={departmentTypes}
          initialPersonalInfo={personalInfo}
        />
      );
    }

    if (currentStep === 2) {
      if (!personalInfo) {
        // If personalInfo is missing, go back to step 1
        setCurrentStep(1);
        return null;
      }
      return (
        <PasswordForm
          onNext={handlePasswordNext}
          onPrevious={goToPrevious}
          currentStep={currentStep}
          totalSteps={2}
          token={token}
          invitationData={invitationData}
          personalInfo={personalInfo}
        />
      );
    }

    return null;
  };

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
