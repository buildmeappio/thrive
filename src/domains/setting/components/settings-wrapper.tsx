"use client";

import React, { useState, useCallback } from "react";
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
  profileData: initialProfileData,
  servicesData: initialServicesData,
  availabilityData: initialAvailabilityData,
  payoutData: initialPayoutData,
  documentsData: initialDocumentsData,
  complianceData: initialComplianceData,
  notificationsData: initialNotificationsData,
  assessmentTypes,
  maxTravelDistances,
}) => {
  const [activeStep, setActiveStep] = useState<string>("profile");

  // Manage state for each form's data so we can update it after saves
  const [profileData, setProfileData] = useState(initialProfileData);
  const [servicesData, setServicesData] = useState(initialServicesData);
  const [availabilityData, setAvailabilityData] = useState(
    initialAvailabilityData,
  );
  const [payoutData, setPayoutData] = useState(initialPayoutData);
  const [documentsData, setDocumentsData] = useState(initialDocumentsData);
  const [complianceData, setComplianceData] = useState(initialComplianceData);
  const [notificationsData, setNotificationsData] = useState(
    initialNotificationsData,
  );

  // Callbacks to update data after successful saves
  const handleServicesDataUpdate = useCallback(
    (newData: ServicesAssessmentFormProps["initialData"]) => {
      setServicesData(newData);
    },
    [],
  );

  const handleProfileDataUpdate = useCallback(
    (newData: ProfileInfoFormProps["initialData"]) => {
      setProfileData(newData);
    },
    [],
  );

  const handleAvailabilityDataUpdate = useCallback(
    (newData: AvailabilityPreferencesFormProps["initialData"]) => {
      setAvailabilityData(newData);
    },
    [],
  );

  const handlePayoutDataUpdate = useCallback(
    (newData: PayoutDetailsFormProps["initialData"]) => {
      setPayoutData(newData);
    },
    [],
  );

  const handleDocumentsDataUpdate = useCallback(
    (newData: DocumentsUploadFormProps["initialData"]) => {
      setDocumentsData(newData);
    },
    [],
  );

  const handleComplianceDataUpdate = useCallback(
    (newData: ComplianceFormProps["initialData"]) => {
      setComplianceData(newData);
    },
    [],
  );

  const handleNotificationsDataUpdate = useCallback(
    (newData: NotificationsFormProps["initialData"]) => {
      setNotificationsData(newData);
    },
    [],
  );

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
        onServicesDataUpdate={handleServicesDataUpdate}
        onProfileDataUpdate={handleProfileDataUpdate}
        onAvailabilityDataUpdate={handleAvailabilityDataUpdate}
        onPayoutDataUpdate={handlePayoutDataUpdate}
        onDocumentsDataUpdate={handleDocumentsDataUpdate}
        onComplianceDataUpdate={handleComplianceDataUpdate}
        onNotificationsDataUpdate={handleNotificationsDataUpdate}
      />
    </div>
  );
};

export default SettingsWrapper;
