"use client";
import React, { useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivationStep {
  id: string;
  title: string;
  completed: boolean;
}

const ActivationSteps = () => {
  const [steps, setSteps] = useState<ActivationStep[]>([
    {
      id: "profile",
      title: "Confirm or Complete Your Profile Info",
      completed: false,
    },
    {
      id: "specialty",
      title: "Choose Your Speciality & IME Preferences",
      completed: false,
    },
    {
      id: "availability",
      title: "Set Your Availability",
      completed: false,
    },
    {
      id: "payout",
      title: "Set Up Payout Details",
      completed: false,
    },
  ]);

  const handleStepClick = (stepId: string) => {
    // Handle step navigation here
    console.log("Navigating to step:", stepId);

    // For now, just toggle completion for demo
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => handleStepClick(step.id)}
          className={cn(
            "w-full flex items-center justify-between p-6 rounded-2xl transition-all duration-200",
            "border-2 bg-white hover:shadow-md",
            step.completed
              ? "border-[#00A8FF] bg-[#F0F9FF]"
              : "border-transparent hover:border-gray-200"
          )}>
          <div className="flex items-center gap-4">
            {step.completed ? (
              <CheckCircle2 className="h-6 w-6 text-[#00A8FF] flex-shrink-0" />
            ) : (
              <ChevronRight className="h-6 w-6 text-[#00A8FF] flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-lg font-medium text-left",
                step.completed ? "text-[#00A8FF]" : "text-gray-700"
              )}>
              {step.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ActivationSteps;
