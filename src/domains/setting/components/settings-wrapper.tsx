"use client";

import React, { useState } from "react";
import SettingsSidebar from "./settings-sidebar";
import SettingsContent from "./settings-content";
import type {
  ProfileInfoFormProps,
  ServicesAssessmentFormProps,
  AvailabilityPreferencesFormProps,
  PayoutDetailsFormProps,
  DocumentsUploadFormProps,
  ComplianceFormProps,
  NotificationsFormProps,
} from "@/domains/onboarding/types/onboarding-forms.types";

interface SettingsWrapperProps {
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

const SettingsWrapper: React.FC<SettingsWrapperProps> = ({
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
  const [activeStep, setActiveStep] = useState<string>("profile");

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <SettingsSidebar activeStep={activeStep} onStepChange={setActiveStep} />
      <SettingsContent
        activeStep={activeStep}
        examinerProfileId={examinerProfileId}
        userId={userId}
        profileData={profileData}
        servicesData={servicesData}
        availabilityData={availabilityData}
        payoutData={payoutData}
        documentsData={documentsData}
        complianceData={complianceData}
        notificationsData={notificationsData}
        assessmentTypes={assessmentTypes}
        maxTravelDistances={maxTravelDistances}
      />
    </div>
  );
};

export default SettingsWrapper;

