import React, { useState } from "react";
import BackButton from "~/components/ui/BackButton";
import ContinueButton from "~/components/ui/ContinueButton";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { MedExaminerRegStepProps } from "~/types";

export const Step4ExperienceDetails: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [formData, setFormData] = useState({
    experienceDetails: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sm:pt-0">
      <div className="flex-1 space-y-4 sm:space-y-6 sm:space-y-0">
        {/* Desktop View - Heading */}
       <div className="text-center mt-0 sm:mt-0 hidden md:block">
  <h3 className="my-10 text-3xl whitespace-nowrap font-medium text-[#140047]">Share Some Details About Your Past Experience</h3>
</div>

        {/* Mobile View - Center aligned heading */}
        <div className="text-center mt-0 sm:mt-0 md:hidden">
          <h3 className="my-2 text-xl font-medium text-[#140047]">
            Share Some Details About Your Past Experience
          </h3>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div className="relative">
              <Textarea
                id="experienceDetails"
                placeholder="Type here"
                value={formData.experienceDetails}
                onChange={(e) =>
                  handleInputChange("experienceDetails", e.target.value)
                }
                className="min-h-[150px] sm:min-h-[200px] w-full resize-none text-sm sm:text-base"
                maxLength={500}
              />
              <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 text-xs sm:text-sm text-gray-400">
                {formData.experienceDetails.length}/500
              </div>
            </div>
            <Label
              htmlFor="experienceDetails"
              className="-mt-2 text-xs sm:text-sm font-normal text-[#8A8A8A]"
            >
              Talk about yourself and your background
            </Label>
          </div>
          
          <div className="mt-6 sm:mt-8 lg:mt-auto flex justify-between items-center gap-4 pt-6 sm:pt-8 lg:pt-15 sm:pt-0">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#00A8FF"
              iconColor="#00A8FF"
            />
            <ContinueButton
              onClick={onNext}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
            />
          </div>
        </div>
      </div>
    </div>
  );
};