import React from "react";
import type { MedExaminerRegStepProps } from "~/types";
import { Check } from "lucide-react";
export const Step8ThankYou: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-20 md:px-8">
      <div className="py-auto mx-auto max-w-2xl text-center">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 sm:h-16 sm:w-16">
            <Check
              className="h-7 w-7 text-white sm:h-10 sm:w-10"
              strokeWidth={3}
            />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-black sm:mb-4 sm:text-4xl md:text-5xl">
          Thank You!
        </h1>

        <h2 className="mb-6 px-2 text-lg font-medium text-blue-400 sm:mb-8 sm:text-xl md:text-2xl">
          Your Profile Has Been Submitted.
        </h2>
        <p className="mx-auto max-w-sm px-4 text-base leading-relaxed text-gray-500 sm:max-w-lg sm:px-0 sm:text-lg">
          We've received your application and our team is now reviewing your
          information. You'll be notified by email once your profile has been
          verified.
        </p>
      </div>
    </div>
  );
};
