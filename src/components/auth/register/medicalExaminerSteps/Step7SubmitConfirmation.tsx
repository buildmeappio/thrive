import React from "react";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step7SubmitConfirmation: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
}) => {
  const handleSubmit = () => {
    // Handle final submission logic here
    console.log("Form submitted successfully!");
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 px-4 pt-4 pb-8 md:px-20 md:py-20">
      <div className="pt-1 md:pt-0">
        <h3 className="mt-4 mb-2 text-center text-2xl font-medium text-[#140047] md:mt-10 md:mb-0 md:text-3xl">
          Ready to Submit?
        </h3>
        <div className="mt-4 text-center text-base leading-relaxed text-gray-600 sm:text-lg">
          <p className="text-center">
            Your Medical Examiner profile is ready for review. Please confirm
            that all information and documents are accurate. Once submitted, our
            team will begin the verification process.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-row justify-start gap-4 md:justify-center md:gap-8">
        <BackButton
          onClick={onPrevious}
          disabled={currentStep === 1}
          borderColor="#00A8FF"
          iconColor="#00A8FF"
        />
        <ContinueButton
          onClick={handleSubmit}
          isLastStep={true}
          gradientFrom="#89D7FF"
          gradientTo="#00A8FF"
        />
      </div>
    </div>
  );
};
