"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProfileInfoForm,
  ServicesAssessmentForm,
  SpecialtyPreferencesForm,
  AvailabilityPreferencesForm,
  PayoutDetailsForm,
} from "./OnboardingSteps";
import { type ActivationStep, initializeActivationSteps } from "../constants";
import { ProfileData, SpecialtyData, AvailabilityData, PayoutData, LanguageOption } from "@/types/components";

interface ActivationStepsProps {
  initialActivationStep: string | null;
  examinerProfileId: string | null;
  profileData: ProfileData;
  specialtyData: SpecialtyData;
  availabilityData: AvailabilityData;
  payoutData: PayoutData;
  languages: LanguageOption[];
  assessmentTypes: Array<{ id: string; name: string; description: string | null }>;
}

const ActivationSteps: React.FC<ActivationStepsProps> = ({
  initialActivationStep: _initialActivationStep,
  examinerProfileId,
  profileData,
  specialtyData,
  availabilityData,
  payoutData,
  languages,
  assessmentTypes,
}) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [steps, setSteps] = useState<ActivationStep[]>(
    initializeActivationSteps()
  );

  // Initialize steps based on activationStep - steps must be completed in order
  useEffect(() => {
    if (!profileData?.activationStep) {
      // No steps completed yet
      setSteps(initializeActivationSteps());
      return;
    }

    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        // Mark steps as completed based on activation order
        switch (profileData.activationStep) {
          case "profile":
            return { ...step, completed: step.id === "profile" };
          case "services":
            return {
              ...step,
              completed: step.id === "profile" || step.id === "services",
            };
          case "specialty":
            return {
              ...step,
              completed:
                step.id === "profile" ||
                step.id === "services" ||
                step.id === "specialty",
            };
          case "availability":
            return {
              ...step,
              completed:
                step.id === "profile" ||
                step.id === "services" ||
                step.id === "specialty" ||
                step.id === "availability",
            };
          case "payout":
            return { ...step, completed: true }; // All steps completed
          default:
            return step;
        }
      })
    );
  }, [profileData?.activationStep]);

  // Check if all steps are completed and redirect to dashboard
  // When activationStep is "payout", all 5 steps are complete in order
  useEffect(() => {
    if (profileData?.activationStep === "payout") {
      router.push("/dashboard");
    }
  }, [router, profileData?.activationStep]);

  const getNextUncompletedStepOrder = () => {
    const uncompletedStep = steps.find((step) => !step.completed);
    return uncompletedStep ? uncompletedStep.order : steps.length + 1;
  };

  const isStepClickable = (stepOrder: number) => {
    // Only the next uncompleted step is clickable
    return stepOrder === getNextUncompletedStepOrder();
  };

  const handleStepClick = (step: ActivationStep) => {
    if (isStepClickable(step.order) && !step.completed) {
      setActiveStep(step.id);
    }
  };

  const handleStepComplete = (stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
    setActiveStep(null);
  };

  const handleStepCancel = () => {
    setActiveStep(null);
  };

  const renderStepIcon = () => {
    return (
      <Play className="h-6 w-6 text-[#00A8FF] flex-shrink-0 fill-[#00A8FF]" />
    );
  };

  // If a step is active, show all steps with the active one as a form
  if (activeStep) {
    return (
      <div className="space-y-4">
        {steps.map((step) => {
          // If this is the active step, show the form
          if (step.id === activeStep) {
            if (step.id === "profile") {
              return (
                <ProfileInfoForm
                  key={step.id}
                  examinerProfileId={examinerProfileId}
                  initialData={profileData}
                  onComplete={() => handleStepComplete("profile")}
                  onCancel={handleStepCancel}
                />
              );
            }
            if (step.id === "services") {
              return (
                <ServicesAssessmentForm
                  key={step.id}
                  examinerProfileId={examinerProfileId}
                  initialData={{
                    assessmentTypes: profileData.assessmentTypes || [],
                    acceptVirtualAssessments: profileData.acceptVirtualAssessments ?? true,
                    acceptInPersonAssessments: true, // Default to true since not stored in DB
                    travelToClaimants: !!profileData.maxTravelDistance,
                    travelRadius: profileData.maxTravelDistance || "",
                    assessmentTypeOther: profileData.assessmentTypeOther || "",
                  }}
                  assessmentTypes={assessmentTypes}
                  onComplete={() => handleStepComplete("services")}
                  onCancel={handleStepCancel}
                />
              );
            }
            if (step.id === "specialty") {
              return (
                <SpecialtyPreferencesForm
                  key={step.id}
                  examinerProfileId={examinerProfileId}
                  initialData={specialtyData}
                  languages={languages}
                  onComplete={() => handleStepComplete("specialty")}
                  onCancel={handleStepCancel}
                />
              );
            }
            if (step.id === "availability") {
              return (
                <AvailabilityPreferencesForm
                  key={step.id}
                  examinerProfileId={examinerProfileId}
                  initialData={availabilityData}
                  onComplete={() => handleStepComplete("availability")}
                  onCancel={handleStepCancel}
                />
              );
            }
            if (step.id === "payout") {
              return (
                <PayoutDetailsForm
                  key={step.id}
                  examinerProfileId={examinerProfileId}
                  initialData={payoutData}
                  onComplete={() => handleStepComplete("payout")}
                  onCancel={handleStepCancel}
                />
              );
            }
            return null;
          }

          // Otherwise, show a locked/completed card
          return (
            <div
              key={step.id}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-2xl",
                "border-2 bg-white cursor-not-allowed",
                step.completed
                  ? "border-none bg-white"
                  : "opacity-50 border-transparent"
              )}>
              <div className="flex items-center gap-4 flex-1">
                {renderStepIcon()}
                <span
                  className={cn(
                    "text-lg font-medium text-left",
                    step.completed
                      ? "text-gray-400 line-through decoration-2"
                      : "text-gray-400"
                  )}>
                  {step.title}
                </span>
              </div>
              {step.completed && (
                <CircleCheck className="h-6 w-6 text-white border-none flex-shrink-0 fill-green-600" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {steps.map((step) => {
        const clickable = isStepClickable(step.order);

        return (
          <button
            key={step.id}
            onClick={() => handleStepClick(step)}
            disabled={!clickable}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200",
              "border-2 bg-white",
              step.completed
                ? "border-none bg-white cursor-default"
                : clickable
                ? "cursor-pointer border-transparent hover:border-[#00A8FF]/20"
                : "opacity-50 cursor-not-allowed border-transparent"
            )}>
            <div className="flex items-center gap-4 flex-1">
              {renderStepIcon()}
              <span
                className={cn(
                  "text-lg font-medium text-left",
                  step.completed
                    ? "text-gray-400 line-through decoration-2"
                    : clickable
                    ? "text-gray-700"
                    : "text-gray-400"
                )}>
                {step.title}
              </span>
            </div>
            {step.completed && (
              <CircleCheck className="h-6 w-6 text-white border-none flex-shrink-0 fill-green-600" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ActivationSteps;
