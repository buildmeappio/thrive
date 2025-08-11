"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import ContinueButton from "~/components/ui/ContinueButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step10Success: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/login/medicalExaminer");
  };
  return (
    <div>
      <h3>Success</h3>
      <p>
        Your account has been successfully created. You can log in to view and
        manage your profile, documents, and upcoming IMEs.
      </p>
      <button className="bg-[#00A8FF] text-white flex items-center gap-2 rounded-2xl p-4">
        Continue
        <ArrowRight
          color="white"
          className="h-4 w-4 transition-all duration-300 ease-in-out"
          strokeWidth={2}
        />
      </button>
    </div>
  );
};
