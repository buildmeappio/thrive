"use client";
import React, { useState, useEffect } from "react";
import { Play, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProfileInfoForm,
  SpecialtyPreferencesForm,
  AvailabilityPreferencesForm,
} from "./OnboardingSteps";
import { type ActivationStep, initializeActivationSteps } from "../constants";

interface ActivationStepsProps {
  initialActivationStep: string | null;
  examinerProfileId: string | null;
}

const ActivationSteps: React.FC<ActivationStepsProps> = ({
  initialActivationStep,
  examinerProfileId,
}) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [steps, setSteps] = useState<ActivationStep[]>(
    initializeActivationSteps()
  );

  // Initialize steps based on the activation step from props
  useEffect(() => {
    if (initialActivationStep) {
      setSteps((prevSteps) =>
        prevSteps.map((step) => {
          const completedStep = prevSteps.find(
            (s) => s.id === initialActivationStep
          );
          if (completedStep && step.order <= completedStep.order) {
            return { ...step, completed: true };
          }
          return step;
        })
      );
    }
  }, [initialActivationStep]);

  const getNextUncompletedStepOrder = () => {
    const uncompletedStep = steps.find((step) => !step.completed);
    return uncompletedStep ? uncompletedStep.order : steps.length + 1;
  };

  const isStepClickable = (stepOrder: number) => {
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
                  onComplete={() => handleStepComplete("profile")}
                  onCancel={handleStepCancel}
                />
              );
            }
            if (step.id === "specialty") {
              return (
                <SpecialtyPreferencesForm
                  key={step.id}
                  examinerProfileId={examinerProfileId}
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
                  onComplete={() => handleStepComplete("availability")}
                  onCancel={handleStepCancel}
                />
              );
            }
            // TODO: Add payout form
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
            disabled={!clickable || step.completed}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200",
              "border-2 bg-white",
              step.completed
                ? "border-none bg-white"
                : clickable
                ? "cursor-pointer border-transparent"
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
