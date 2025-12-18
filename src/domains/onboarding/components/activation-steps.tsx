"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Play, CircleCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ProfileInfoForm,
  ServicesAssessmentForm,
  AvailabilityPreferencesForm,
  PayoutDetailsForm,
  DocumentsUploadForm,
  ComplianceForm,
  NotificationsForm,
} from "./OnboardingSteps";
import { type ActivationStep, initializeActivationSteps } from "../constants";
import type { ActivationStepsProps } from "../types";
import { completeOnboardingAction } from "../server/actions";

const ActivationSteps: React.FC<ActivationStepsProps> = ({
  initialActivationStep: _initialActivationStep,
  examinerProfileId,
  profileData,
  availabilityData,
  payoutData,
  assessmentTypes,
  maxTravelDistances,
}) => {
  const router = useRouter();
  const { update } = useSession();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [steps] = useState<ActivationStep[]>(initializeActivationSteps());
  const [completing, setCompleting] = useState(false);
  // Track which steps are completed
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Check if all steps are completed and redirect to dashboard
  useEffect(() => {
    if (profileData?.activationStep === "notifications") {
      router.push("/dashboard");
    }
  }, [router, profileData?.activationStep]);

  const handleStepClick = (step: ActivationStep) => {
    // All steps are always clickable
    // Refresh router to refetch fresh data from database when opening a step
    router.refresh();
    setActiveStep(step.id);
  };

  const handleStepCancel = () => {
    setActiveStep(null);
  };

  // Handle step completion - called when "Mark as Complete" is clicked
  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId));
  };

  // Handle step incomplete - called when a completed step is edited
  const handleStepIncomplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  };

  // Check if all steps are completed
  const areAllStepsCompleted = (): boolean => {
    const allStepIds = steps.map((step) => step.id);
    return allStepIds.every((stepId) => completedSteps.has(stepId));
  };

  // Helper function to check if a value is filled (not empty)
  const isFieldFilled = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "boolean") return value === true;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  // Check if a specific step is complete based on saved data
  const isStepComplete = (stepId: string): boolean => {
    switch (stepId) {
      case "profile": {
        return (
          isFieldFilled(profileData?.firstName) &&
          isFieldFilled(profileData?.lastName) &&
          isFieldFilled(profileData?.emailAddress) &&
          isFieldFilled(profileData?.professionalTitle) &&
          isFieldFilled(profileData?.yearsOfExperience) &&
          isFieldFilled(profileData?.clinicName) &&
          isFieldFilled(profileData?.clinicAddress) &&
          isFieldFilled(profileData?.profilePhotoId)
        );
      }
      case "services": {
        const assessmentTypes = Array.isArray(profileData?.assessmentTypes)
          ? profileData.assessmentTypes
          : [];
        const hasAssessmentTypes = isFieldFilled(assessmentTypes);
        const travelToClaimants = !!profileData?.maxTravelDistance;
        const travelValid =
          !travelToClaimants ||
          (travelToClaimants && isFieldFilled(profileData?.maxTravelDistance));
        const otherValid =
          !assessmentTypes.includes("other") ||
          isFieldFilled(profileData?.assessmentTypeOther);
        return hasAssessmentTypes && travelValid && otherValid;
      }
      case "availability": {
        const weeklyHours = availabilityData?.weeklyHours;
        if (!weeklyHours || typeof weeklyHours !== "object") {
          return false;
        }
        const hasTimeSlots = Object.values(weeklyHours).some(
          (day: unknown) =>
            day &&
            typeof day === "object" &&
            "enabled" in day &&
            day.enabled === true &&
            "timeSlots" in day &&
            Array.isArray(day.timeSlots) &&
            day.timeSlots.length > 0,
        );
        const bookingOptions = availabilityData?.bookingOptions;
        const hasBookingOptions = Boolean(
          bookingOptions &&
          typeof bookingOptions === "object" &&
          "maxIMEsPerWeek" in bookingOptions &&
          "minimumNotice" in bookingOptions &&
          isFieldFilled(bookingOptions.maxIMEsPerWeek) &&
          isFieldFilled(bookingOptions.minimumNotice),
        );
        return hasTimeSlots && hasBookingOptions;
      }
      case "payout": {
        return (
          isFieldFilled(payoutData?.transitNumber) &&
          isFieldFilled(payoutData?.institutionNumber) &&
          isFieldFilled(payoutData?.accountNumber)
        );
      }
      case "documents": {
        // Just check if there are any documents uploaded
        return isFieldFilled(profileData?.medicalLicenseDocumentIds);
      }
      case "compliance": {
        // For compliance, check if all fields are boolean (not undefined/null)
        // They must all be true to be considered complete
        return (
          typeof profileData?.phipaCompliance === "boolean" &&
          profileData.phipaCompliance === true &&
          typeof profileData?.pipedaCompliance === "boolean" &&
          profileData.pipedaCompliance === true &&
          typeof profileData?.medicalLicenseActive === "boolean" &&
          profileData.medicalLicenseActive === true
        );
      }
      case "notifications": {
        // Notifications are optional, so we consider it complete if data exists
        // (even if all are false, that's still valid data)
        return (
          typeof profileData?.emailPaymentPayout === "boolean" ||
          typeof profileData?.smsNotifications === "boolean" ||
          typeof profileData?.emailMarketing === "boolean"
        );
      }
      default:
        return false;
    }
  };

  // Initialize completed steps based on saved data when component mounts or server data changes
  useEffect(() => {
    if (!examinerProfileId || !profileData) return;

    const initialCompletedSteps = new Set<string>();
    steps.forEach((step) => {
      if (isStepComplete(step.id)) {
        initialCompletedSteps.add(step.id);
      }
    });

    // Only update if the set has changed to prevent unnecessary re-renders
    setCompletedSteps((prev) => {
      const prevArray = Array.from(prev).sort();
      const newArray = Array.from(initialCompletedSteps).sort();
      if (
        prevArray.length !== newArray.length ||
        prevArray.some((val, idx) => val !== newArray[idx])
      ) {
        return initialCompletedSteps;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    examinerProfileId,
    profileData?.firstName,
    profileData?.profilePhotoId,
    profileData?.phipaCompliance,
    profileData?.pipedaCompliance,
    profileData?.medicalLicenseActive,
    profileData?.assessmentTypes,
    profileData?.maxTravelDistance,
    profileData?.assessmentTypeOther,
    profileData?.medicalLicenseDocumentIds,
    profileData?.emailPaymentPayout,
    profileData?.smsNotifications,
    profileData?.emailMarketing,
    availabilityData?.weeklyHours,
    availabilityData?.bookingOptions,
    payoutData?.transitNumber,
    payoutData?.institutionNumber,
    payoutData?.accountNumber,
  ]);

  // Check if all required fields are filled (not validated, just filled)
  const areAllFieldsFilled = (): boolean => {
    // Profile fields
    if (
      !isFieldFilled(profileData?.firstName) ||
      !isFieldFilled(profileData?.lastName) ||
      !isFieldFilled(profileData?.emailAddress) ||
      !isFieldFilled(profileData?.professionalTitle) ||
      !isFieldFilled(profileData?.yearsOfExperience) ||
      !isFieldFilled(profileData?.clinicName) ||
      !isFieldFilled(profileData?.clinicAddress) ||
      !isFieldFilled(profileData?.profilePhotoId)
    ) {
      return false;
    }

    // Services fields
    const assessmentTypes = Array.isArray(profileData?.assessmentTypes)
      ? profileData.assessmentTypes
      : [];
    if (!isFieldFilled(assessmentTypes)) {
      return false;
    }
    // If travelToClaimants is true, travelRadius is required
    if (
      profileData?.maxTravelDistance &&
      !isFieldFilled(profileData.maxTravelDistance)
    ) {
      return false;
    }
    // If "other" is selected, assessmentTypeOther is required
    if (
      assessmentTypes.includes("other") &&
      !isFieldFilled(profileData?.assessmentTypeOther)
    ) {
      return false;
    }

    // Availability fields - check if weeklyHours has at least one day with timeSlots
    const weeklyHours = availabilityData?.weeklyHours;
    if (!weeklyHours || typeof weeklyHours !== "object") {
      return false;
    }
    const hasTimeSlots = Object.values(weeklyHours).some(
      (day: unknown) =>
        day &&
        typeof day === "object" &&
        "enabled" in day &&
        day.enabled === true &&
        "timeSlots" in day &&
        Array.isArray(day.timeSlots) &&
        day.timeSlots.length > 0,
    );
    if (!hasTimeSlots) {
      return false;
    }
    // Check bookingOptions
    const bookingOptions = availabilityData?.bookingOptions;
    if (
      !bookingOptions ||
      typeof bookingOptions !== "object" ||
      !("maxIMEsPerWeek" in bookingOptions) ||
      !("minimumNotice" in bookingOptions) ||
      !isFieldFilled(bookingOptions.maxIMEsPerWeek) ||
      !isFieldFilled(bookingOptions.minimumNotice)
    ) {
      return false;
    }

    // Payout fields
    if (
      !isFieldFilled(payoutData?.transitNumber) ||
      !isFieldFilled(payoutData?.institutionNumber) ||
      !isFieldFilled(payoutData?.accountNumber)
    ) {
      return false;
    }

    // Documents fields - just check if any documents are uploaded
    if (!isFieldFilled(profileData?.medicalLicenseDocumentIds)) {
      return false;
    }

    // Compliance fields
    if (
      !isFieldFilled(profileData?.phipaCompliance) ||
      !isFieldFilled(profileData?.pipedaCompliance) ||
      !isFieldFilled(profileData?.medicalLicenseActive)
    ) {
      return false;
    }

    // Notifications are optional, so we don't check them

    return true;
  };

  const handleCompleteOnboarding = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Check if all steps are completed
    if (!areAllStepsCompleted()) {
      toast.error("Please complete all steps before finishing onboarding");
      return;
    }

    // First check if all fields are filled
    if (!areAllFieldsFilled()) {
      // Find the first incomplete step and navigate to it
      const incompleteSteps: string[] = [];

      if (
        !isFieldFilled(profileData?.firstName) ||
        !isFieldFilled(profileData?.lastName) ||
        !isFieldFilled(profileData?.emailAddress) ||
        !isFieldFilled(profileData?.professionalTitle) ||
        !isFieldFilled(profileData?.yearsOfExperience) ||
        !isFieldFilled(profileData?.clinicName) ||
        !isFieldFilled(profileData?.clinicAddress) ||
        !isFieldFilled(profileData?.profilePhotoId)
      ) {
        incompleteSteps.push("profile");
      }

      const assessmentTypes = Array.isArray(profileData?.assessmentTypes)
        ? profileData.assessmentTypes
        : [];
      if (
        !isFieldFilled(assessmentTypes) ||
        (profileData?.maxTravelDistance &&
          !isFieldFilled(profileData.maxTravelDistance)) ||
        (assessmentTypes.includes("other") &&
          !isFieldFilled(profileData?.assessmentTypeOther))
      ) {
        incompleteSteps.push("services");
      }

      const weeklyHours = availabilityData?.weeklyHours;
      const hasTimeSlots =
        weeklyHours &&
        typeof weeklyHours === "object" &&
        Object.values(weeklyHours).some(
          (day: unknown) =>
            day &&
            typeof day === "object" &&
            "enabled" in day &&
            day.enabled === true &&
            "timeSlots" in day &&
            Array.isArray(day.timeSlots) &&
            day.timeSlots.length > 0,
        );
      const bookingOptions = availabilityData?.bookingOptions;
      if (
        !hasTimeSlots ||
        !bookingOptions ||
        typeof bookingOptions !== "object" ||
        !("maxIMEsPerWeek" in bookingOptions) ||
        !("minimumNotice" in bookingOptions) ||
        !isFieldFilled(bookingOptions.maxIMEsPerWeek) ||
        !isFieldFilled(bookingOptions.minimumNotice)
      ) {
        incompleteSteps.push("availability");
      }

      if (
        !isFieldFilled(payoutData?.transitNumber) ||
        !isFieldFilled(payoutData?.institutionNumber) ||
        !isFieldFilled(payoutData?.accountNumber)
      ) {
        incompleteSteps.push("payout");
      }

      // Documents fields - just check if any documents are uploaded
      if (!isFieldFilled(profileData?.medicalLicenseDocumentIds)) {
        incompleteSteps.push("documents");
      }

      // Compliance fields
      if (
        !isFieldFilled(profileData?.phipaCompliance) ||
        !isFieldFilled(profileData?.pipedaCompliance) ||
        !isFieldFilled(profileData?.medicalLicenseActive)
      ) {
        incompleteSteps.push("compliance");
      }

      // Navigate to first incomplete step
      if (incompleteSteps.length > 0) {
        setActiveStep(incompleteSteps[0]);
        toast.error(
          "Please complete all required fields before completing onboarding",
        );
        return;
      }
    }

    // All fields are filled, now trigger validation by trying to submit forms
    // This will show validation errors if any
    let hasValidationErrors = false;
    const validationErrors: string[] = [];

    // Check each step and collect validation errors
    // Profile validation
    if (
      !isFieldFilled(profileData?.firstName) ||
      !isFieldFilled(profileData?.lastName) ||
      !isFieldFilled(profileData?.emailAddress) ||
      !isFieldFilled(profileData?.professionalTitle) ||
      !isFieldFilled(profileData?.yearsOfExperience) ||
      !isFieldFilled(profileData?.clinicName) ||
      !isFieldFilled(profileData?.clinicAddress) ||
      !isFieldFilled(profileData?.profilePhotoId)
    ) {
      validationErrors.push(
        "Profile: Please complete all required fields including profile photo",
      );
      if (!activeStep || activeStep !== "profile") {
        setActiveStep("profile");
      }
      hasValidationErrors = true;
    }

    // Services validation
    const assessmentTypes = Array.isArray(profileData?.assessmentTypes)
      ? profileData.assessmentTypes
      : [];
    if (
      !isFieldFilled(assessmentTypes) ||
      (profileData?.maxTravelDistance &&
        !isFieldFilled(profileData.maxTravelDistance)) ||
      (assessmentTypes.includes("other") &&
        !isFieldFilled(profileData?.assessmentTypeOther))
    ) {
      validationErrors.push(
        "Services: Please select at least one assessment type and complete all required fields",
      );
      if (!activeStep || activeStep !== "services") {
        setActiveStep("services");
      }
      hasValidationErrors = true;
    }

    // Availability validation
    const weeklyHours = availabilityData?.weeklyHours;
    const hasTimeSlots =
      weeklyHours &&
      typeof weeklyHours === "object" &&
      Object.values(weeklyHours).some(
        (day: unknown) =>
          day &&
          typeof day === "object" &&
          "enabled" in day &&
          day.enabled === true &&
          "timeSlots" in day &&
          Array.isArray(day.timeSlots) &&
          day.timeSlots.length > 0,
      );
    const bookingOptions = availabilityData?.bookingOptions;
    if (
      !hasTimeSlots ||
      !bookingOptions ||
      typeof bookingOptions !== "object" ||
      !("maxIMEsPerWeek" in bookingOptions) ||
      !("minimumNotice" in bookingOptions) ||
      !isFieldFilled(bookingOptions.maxIMEsPerWeek) ||
      !isFieldFilled(bookingOptions.minimumNotice)
    ) {
      validationErrors.push(
        "Availability: Please set at least one day with time slots and complete booking options",
      );
      if (!activeStep || activeStep !== "availability") {
        setActiveStep("availability");
      }
      hasValidationErrors = true;
    }

    // Payout validation
    if (
      !isFieldFilled(payoutData?.transitNumber) ||
      !isFieldFilled(payoutData?.institutionNumber) ||
      !isFieldFilled(payoutData?.accountNumber)
    ) {
      validationErrors.push(
        "Payout: Please complete all direct deposit fields",
      );
      if (!activeStep || activeStep !== "payout") {
        setActiveStep("payout");
      }
      hasValidationErrors = true;
    }

    // Documents validation
    const documentIds = Array.isArray(profileData?.medicalLicenseDocumentIds)
      ? profileData.medicalLicenseDocumentIds
      : [];
    if (documentIds.length === 0) {
      validationErrors.push("Documents: Please upload at least one document");
      if (!activeStep || activeStep !== "documents") {
        setActiveStep("documents");
      }
      hasValidationErrors = true;
    }

    // Compliance validation
    if (
      !isFieldFilled(profileData?.phipaCompliance) ||
      !isFieldFilled(profileData?.pipedaCompliance) ||
      !isFieldFilled(profileData?.medicalLicenseActive)
    ) {
      validationErrors.push(
        "Compliance: Please acknowledge all required compliance statements",
      );
      if (!activeStep || activeStep !== "compliance") {
        setActiveStep("compliance");
      }
      hasValidationErrors = true;
    }

    // If there are validation errors, show them and don't proceed
    if (hasValidationErrors) {
      // Show all validation errors
      validationErrors.forEach((error) => {
        toast.error(error, { duration: 5000 });
      });
      return;
    }

    // Try to trigger validation on the currently active form to show any field-level validation errors
    if (activeStep) {
      const formIdMap: Record<string, string> = {
        profile: "profile-form",
        services: "services-form",
        availability: "availability-form",
        payout: "payout-form",
      };

      const formId = formIdMap[activeStep];
      if (formId) {
        // Wait for form to be rendered
        await new Promise((resolve) => setTimeout(resolve, 100));
        const form = document.getElementById(formId) as HTMLFormElement;
        if (form) {
          // Try to find and click the submit button to trigger validation
          const submitButton = form.querySelector(
            'button[type="submit"]',
          ) as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            // Trigger validation by clicking submit (this will show errors if invalid)
            submitButton.click();
            // Wait a bit to allow validation to process and show errors
            await new Promise((resolve) => setTimeout(resolve, 300));
            // If validation fails, the form's onSubmit will handle showing errors
            // Check if there are any visible error messages
            const errorMessages = form.querySelectorAll(
              ".text-red-500, [role='alert']",
            );
            if (errorMessages.length > 0) {
              toast.error("Please fix the validation errors shown in the form");
              return;
            }
          }
        }
      }
    }

    // Proceed with completion
    setCompleting(true);
    try {
      const result = await completeOnboardingAction({
        examinerProfileId,
      });

      if (result.success) {
        toast.success("Onboarding completed successfully!");
        // Update session to refresh JWT token
        await update();
        // Redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to complete onboarding");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setCompleting(false);
    }
  };

  const renderStepIcon = (stepId: string) => {
    if (completedSteps.has(stepId)) {
      return <CircleCheck className="h-6 w-6 text-green-500 shrink-0" />;
    }
    return <Play className="h-6 w-6 text-[#00A8FF] shrink-0 fill-[#00A8FF]" />;
  };

  // Render step form component
  const renderStepForm = (stepId: string) => {
    switch (stepId) {
      case "profile":
        return (
          <ProfileInfoForm
            key="profile"
            examinerProfileId={examinerProfileId}
            initialData={profileData}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("profile")}
            onStepEdited={() => handleStepIncomplete("profile")}
            isCompleted={completedSteps.has("profile")}
          />
        );
      case "services":
        return (
          <ServicesAssessmentForm
            key="services"
            examinerProfileId={examinerProfileId}
            initialData={{
              assessmentTypes: (Array.isArray(profileData.assessmentTypes)
                ? profileData.assessmentTypes
                : []) as string[],
              acceptVirtualAssessments:
                (typeof profileData.acceptVirtualAssessments === "boolean"
                  ? profileData.acceptVirtualAssessments
                  : true) as boolean,
              acceptInPersonAssessments: true,
              travelToClaimants: !!profileData.maxTravelDistance,
              travelRadius: (typeof profileData.maxTravelDistance === "string"
                ? profileData.maxTravelDistance
                : "") as string,
              assessmentTypeOther: (typeof profileData.assessmentTypeOther ===
              "string"
                ? profileData.assessmentTypeOther
                : "") as string,
            }}
            assessmentTypes={assessmentTypes}
            maxTravelDistances={maxTravelDistances}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("services")}
            onStepEdited={() => handleStepIncomplete("services")}
            isCompleted={completedSteps.has("services")}
          />
        );
      case "availability":
        return (
          <AvailabilityPreferencesForm
            key="availability"
            examinerProfileId={examinerProfileId}
            initialData={availabilityData}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("availability")}
            onStepEdited={() => handleStepIncomplete("availability")}
            isCompleted={completedSteps.has("availability")}
          />
        );
      case "payout":
        return (
          <PayoutDetailsForm
            key="payout"
            examinerProfileId={examinerProfileId}
            initialData={payoutData}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("payout")}
            onStepEdited={() => handleStepIncomplete("payout")}
            isCompleted={completedSteps.has("payout")}
          />
        );
      case "documents":
        return (
          <DocumentsUploadForm
            key="documents"
            examinerProfileId={examinerProfileId}
            initialData={{
              medicalLicenseDocumentIds: Array.isArray(
                profileData.medicalLicenseDocumentIds,
              )
                ? profileData.medicalLicenseDocumentIds
                : [],
              governmentIdDocumentId:
                typeof profileData.governmentIdDocumentId === "string"
                  ? profileData.governmentIdDocumentId
                  : undefined,
              resumeDocumentId:
                typeof profileData.resumeDocumentId === "string"
                  ? profileData.resumeDocumentId
                  : undefined,
              insuranceDocumentId:
                typeof profileData.insuranceDocumentId === "string"
                  ? profileData.insuranceDocumentId
                  : undefined,
              specialtyCertificatesDocumentIds: Array.isArray(
                profileData.specialtyCertificatesDocumentIds,
              )
                ? profileData.specialtyCertificatesDocumentIds
                : [],
            }}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("documents")}
            onStepEdited={() => handleStepIncomplete("documents")}
            isCompleted={completedSteps.has("documents")}
          />
        );
      case "compliance":
        return (
          <ComplianceForm
            key="compliance"
            examinerProfileId={examinerProfileId}
            initialData={{
              phipaCompliance:
                typeof profileData.phipaCompliance === "boolean"
                  ? profileData.phipaCompliance
                  : false,
              pipedaCompliance:
                typeof profileData.pipedaCompliance === "boolean"
                  ? profileData.pipedaCompliance
                  : false,
              medicalLicenseActive:
                typeof profileData.medicalLicenseActive === "boolean"
                  ? profileData.medicalLicenseActive
                  : false,
            }}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("compliance")}
            onStepEdited={() => handleStepIncomplete("compliance")}
            isCompleted={completedSteps.has("compliance")}
          />
        );
      case "notifications":
        return (
          <NotificationsForm
            key="notifications"
            examinerProfileId={examinerProfileId}
            initialData={{
              emailPaymentPayout:
                typeof profileData.emailPaymentPayout === "boolean"
                  ? profileData.emailPaymentPayout
                  : true,
              smsNotifications:
                typeof profileData.smsNotifications === "boolean"
                  ? profileData.smsNotifications
                  : false,
              emailMarketing:
                typeof profileData.emailMarketing === "boolean"
                  ? profileData.emailMarketing
                  : false,
            }}
            onComplete={handleStepCancel}
            onCancel={handleStepCancel}
            onMarkComplete={() => handleStepComplete("notifications")}
            onStepEdited={() => handleStepIncomplete("notifications")}
            isCompleted={completedSteps.has("notifications")}
          />
        );
      default:
        return null;
    }
  };

  // If a step is active, show all steps with the active one's form inline
  if (activeStep) {
    return (
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="space-y-4">
            {/* Step Button */}
            <button
              onClick={() => handleStepClick(step)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200",
                "border-2 bg-white",
                step.id === activeStep
                  ? "border-[#00A8FF] bg-[#F0F9FF]"
                  : "border-transparent hover:border-[#00A8FF]/20 cursor-pointer",
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                {renderStepIcon(step.id)}
                <span
                  className={cn(
                    "text-lg font-medium text-left",
                    step.id === activeStep ? "text-[#00A8FF]" : "text-gray-700",
                  )}
                >
                  {step.title}
                </span>
              </div>
            </button>

            {/* Step Form - Show inline with the active step */}
            {step.id === activeStep && <div>{renderStepForm(step.id)}</div>}
          </div>
        ))}
        {/* Complete Onboarding Button */}
        <div className="flex justify-end pt-4 mt-6">
          <Button
            onClick={handleCompleteOnboarding}
            disabled={completing}
            className="rounded-full bg-[#00A8FF] hover:bg-[#0099E6] text-white px-8 py-2 flex items-center justify-center gap-2"
          >
            <span>Complete Onboarding</span>
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Show all steps as clickable when no step is active
  return (
    <div className="space-y-4 mt-8">
      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => handleStepClick(step)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200",
            "border-2 bg-white cursor-pointer border-transparent hover:border-[#00A8FF]/20",
          )}
        >
          <div className="flex items-center gap-4 flex-1">
            {renderStepIcon(step.id)}
            <span className="text-lg font-medium text-left text-gray-700">
              {step.title}
            </span>
          </div>
        </button>
      ))}
      {/* Complete Onboarding Button */}
      <div className="flex justify-end pt-4 mt-6">
        <Button
          onClick={handleCompleteOnboarding}
          disabled={completing}
          className="rounded-full bg-[#00A8FF] hover:bg-[#0099E6] text-white px-8 py-2 flex items-center justify-center gap-2"
        >
          <span>Complete Onboarding</span>
          <CheckCircle2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ActivationSteps;
