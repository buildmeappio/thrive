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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="my-10 text-3xl font-medium text-[#140047]">
          Share Some Details About Your Past Experience
        </h3>
      </div>

      <div className="mt-8">
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              id="experienceDetails"
              placeholder="Type here"
              value={formData.experienceDetails}
              onChange={(e) =>
                handleInputChange("experienceDetails", e.target.value)
              }
              className="min-h-[200px] w-full resize-none"
              maxLength={500}
            />
            <div className="absolute right-3 bottom-3 text-sm text-gray-400">
              {formData.experienceDetails.length}/500
            </div>
          </div>
          <Label
            htmlFor="experienceDetails"
            className="-mt-2 text-sm font-normal text-[#8A8A8A]"
          >
            Talk about yourself and your background
          </Label>
        </div>
        <div className="mt-auto flex justify-between pt-15">
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
  );
};
