"use client";

import React from "react";
import {
  ProfileInfoForm,
  ServicesAssessmentForm,
  AvailabilityPreferencesForm,
  PayoutDetailsForm,
  DocumentsUploadForm,
  ComplianceForm,
  NotificationsForm,
} from "@/domains/onboarding/components/OnboardingSteps";
import ChangePasswordSection from "./change-password-section";
import type {
  ProfileInfoFormProps,
  ServicesAssessmentFormProps,
  AvailabilityPreferencesFormProps,
  PayoutDetailsFormProps,
  DocumentsUploadFormProps,
  ComplianceFormProps,
  NotificationsFormProps,
} from "@/domains/onboarding/types/onboarding-forms.types";

interface SettingsContentProps {
  activeStep: string;
  examinerProfileId: string;
  userId: string;
  profileData: ProfileInfoFormProps["initialData"];
  servicesData: ServicesAssessmentFormProps["initialData"];
  availabilityData: AvailabilityPreferencesFormProps["initialData"];
  payoutData: PayoutDetailsFormProps["initialData"];
  documentsData: DocumentsUploadFormProps["initialData"];
  complianceData: ComplianceFormProps["initialData"];
  notificationsData: NotificationsFormProps["initialData"];
  assessmentTypes: ServicesAssessmentFormProps["assessmentTypes"];
  maxTravelDistances: ServicesAssessmentFormProps["maxTravelDistances"];
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
  assessmentTypes,
  maxTravelDistances,
}) => {
  const handleComplete = () => {
    // No-op for settings - forms will handle their own save
  };

  const handleCancel = () => {
    // No-op for settings
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "profile":
        return (
          <ProfileInfoForm
            examinerProfileId={examinerProfileId}
            initialData={profileData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
          />
        );

      case "services":
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
          />
        );

      case "availability":
        return (
          <AvailabilityPreferencesForm
            examinerProfileId={examinerProfileId}
            initialData={availabilityData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
          />
        );

      case "payout":
        return (
          <PayoutDetailsForm
            examinerProfileId={examinerProfileId}
            initialData={payoutData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
          />
        );

      case "documents":
        return (
          <DocumentsUploadForm
            examinerProfileId={examinerProfileId}
            initialData={documentsData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
          />
        );

      case "compliance":
        return (
          <ComplianceForm
            examinerProfileId={examinerProfileId}
            initialData={complianceData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
          />
        );

      case "notifications":
        return (
          <NotificationsForm
            examinerProfileId={examinerProfileId}
            initialData={notificationsData}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isCompleted={true}
            isSettingsPage={true}
          />
        );

      case "password":
        return <ChangePasswordSection userId={userId} />;

      default:
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500">Select a setting to get started</p>
          </div>
        );
    }
  };

  return <div className="flex-1">{renderStepContent()}</div>;
};

export default SettingsContent;

