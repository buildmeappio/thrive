import React from "react";
import type { MedExaminerRegStepProps } from "~/types";
import { Check } from "lucide-react";
export const Step8ThankYou: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const handleSubmit = () => {
    console.log("Form submitted successfully!");
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className=" px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center max-w-2xl py-auto mx-auto">
        {/* Success Checkmark */}
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full flex items-center justify-center">
            <Check className="w-7 h-7 sm:w-10 sm:h-10 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Thank You Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-3 sm:mb-4">
          Thank You!
        </h1>

        {/* Blue Subtitle */}
        <h2 className="text-lg sm:text-xl md:text-2xl text-blue-400 font-medium mb-6 sm:mb-8 px-2">
          Your Profile Has Been Submitted.
        </h2>

        {/* Description Text */}
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-sm sm:max-w-lg mx-auto px-4 sm:px-0">
          We've received your application and our team is now 
          reviewing your information. You'll be notified by email 
          once your profile has been verified.
        </p>
      </div>
    </div>
  );
};