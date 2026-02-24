'use client';

import React from 'react';
import {
  ProfileInfoForm,
  ServicesAssessmentForm,
  AvailabilityPreferencesForm,
  PayoutDetailsForm,
  DocumentsUploadForm,
  ComplianceForm,
  NotificationsForm,
} from '@/domains/onboarding/components/OnboardingSteps';
import ChangePasswordSection from './change-password-section';
import FeeStructureSection from './fee-structure-section';
import type {
  ProfileInfoFormProps,
  ServicesAssessmentFormProps,
  AvailabilityPreferencesFormProps,
  PayoutDetailsFormProps,
  DocumentsUploadFormProps,
  ComplianceFormProps,
  NotificationsFormProps,
} from '@/domains/onboarding/types/onboarding-forms.types';
import type { FeeStructureData, ContractData } from '../types';

interface SettingsContentProps {
  activeStep: string;
  examinerProfileId: string;
  userId: string;
  profileData: ProfileInfoFormProps['initialData'];
  servicesData: ServicesAssessmentFormProps['initialData'];
  availabilityData: AvailabilityPreferencesFormProps['initialData'];
  payoutData: PayoutDetailsFormProps['initialData'];
  documentsData: DocumentsUploadFormProps['initialData'];
  complianceData: ComplianceFormProps['initialData'];
  notificationsData: NotificationsFormProps['initialData'];
  feeStructureData: FeeStructureData | null;
  contractData: ContractData | null;
  contractHtml?: string | null;
  assessmentTypes: ServicesAssessmentFormProps['assessmentTypes'];
  maxTravelDistances: ServicesAssessmentFormProps['maxTravelDistances'];
  onServicesDataUpdate?: (data: ServicesAssessmentFormProps['initialData']) => void;
  onProfileDataUpdate?: (data: ProfileInfoFormProps['initialData']) => void;
  onAvailabilityDataUpdate?: (data: AvailabilityPreferencesFormProps['initialData']) => void;
  onPayoutDataUpdate?: (data: PayoutDetailsFormProps['initialData']) => void;
  onDocumentsDataUpdate?: (data: DocumentsUploadFormProps['initialData']) => void;
  onComplianceDataUpdate?: (data: ComplianceFormProps['initialData']) => void;
  onNotificationsDataUpdate?: (data: NotificationsFormProps['initialData']) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({
  activeStep,
  examinerProfileId,
  userId,
  profileData,
  servicesData,
  availabilityData,
  payoutData,
  documentsData,
  complianceData,
  notificationsData,
  feeStructureData,
  contractData,
  contractHtml,
  assessmentTypes,
  maxTravelDistances,
  onServicesDataUpdate,
  onProfileDataUpdate,
  onAvailabilityDataUpdate,
  onPayoutDataUpdate,
  onDocumentsDataUpdate,
  onComplianceDataUpdate,
  onNotificationsDataUpdate,
}) => {
  const handleComplete = () => {
    // No-op for settings - forms will handle their own save
  };

  const handleCancel = () => {
    // No-op for settings
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'profile':
        return (
          <ProfileInfoForm
            examinerProfileId={examinerProfileId}
            initialData={profileData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onProfileDataUpdate}
          />
        );

      case 'services':
        return (
          <ServicesAssessmentForm
            examinerProfileId={examinerProfileId}
            initialData={servicesData}
            assessmentTypes={assessmentTypes}
            maxTravelDistances={maxTravelDistances}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onServicesDataUpdate}
          />
        );

      case 'availability':
        return (
          <AvailabilityPreferencesForm
            examinerProfileId={examinerProfileId}
            initialData={availabilityData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onAvailabilityDataUpdate}
          />
        );

      case 'payout':
        return (
          <PayoutDetailsForm
            examinerProfileId={examinerProfileId}
            initialData={payoutData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onPayoutDataUpdate}
          />
        );

      case 'documents':
        return (
          <DocumentsUploadForm
            examinerProfileId={examinerProfileId}
            initialData={documentsData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onDocumentsDataUpdate}
          />
        );

      case 'compliance':
        return (
          <ComplianceForm
            examinerProfileId={examinerProfileId}
            initialData={complianceData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onComplianceDataUpdate}
          />
        );

      case 'fee-structure':
        return (
          <FeeStructureSection
            feeStructure={feeStructureData}
            contract={contractData}
            contractHtml={contractHtml}
          />
        );

      case 'notifications':
        return (
          <NotificationsForm
            examinerProfileId={examinerProfileId}
            initialData={notificationsData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
            onDataUpdate={onNotificationsDataUpdate}
          />
        );

      case 'password':
        return <ChangePasswordSection userId={userId} />;

      default:
        return (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Select a setting to get started</p>
          </div>
        );
    }
  };

  return <div className="flex-1">{renderStepContent()}</div>;
};

export default SettingsContent;
