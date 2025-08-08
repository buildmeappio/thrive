import React, { useState } from "react";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { provinceOptions } from "~/config/medicalExaminerRegister/ProvinceDropdownOptions";
import { yearsOfExperienceOptions } from "~/config/medicalExaminerRegister/YrsExperienceDropdownOptions";
import { languageOptions } from "~/config/medicalExaminerRegister/LanguageDropdownOptions";
import { Checkbox } from "~/components/ui/checkbox";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step3IMEExperince: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [formData, setFormData] = useState({
    yearsOfIMEExperience: "",
    provinceOfLicensure: "",
    languagesSpoken: "",
    forensicAssessmentTrained: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h3 className="my-10 text-3xl font-medium text-[#140047]">
          IME Experience & Qualifications
        </h3>
      </div>

      {/* Form fields */}
      <div className="grid flex-1 grid-cols-1 gap-x-14 gap-y-6 md:grid-cols-2">
        <Dropdown
          id="yearsOfIMEExperience"
          label="Years of IME Experience"
          value={formData.yearsOfIMEExperience}
          onChange={(value) => handleInputChange("yearsOfIMEExperience", value)}
          options={yearsOfExperienceOptions}
          required={true}
          placeholder="12 Years"
        />
        <Dropdown
          id="provinceOfLicensure"
          label="Province of Licensure"
          value={formData.provinceOfLicensure}
          onChange={(value) => handleInputChange("provinceOfLicensure", value)}
          options={provinceOptions}
          required={true}
          placeholder="Select Province"
        />
        <Dropdown
          id="languagesSpoken"
          label="Languages Spoken"
          value={formData.languagesSpoken}
          onChange={(value) => handleInputChange("languagesSpoken", value)}
          options={languageOptions}
          required={true}
          placeholder="Select Language"
        />

        <div className="space-y-2">
          <Label className="text-black">
            Forensic Assessment Trained<span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex cursor-pointer items-center space-x-2">
              <Checkbox
                checked={formData.forensicAssessmentTrained === "yes"}
                onCheckedChange={(checked) =>
                  handleInputChange(
                    "forensicAssessmentTrained",
                    checked ? "yes" : "",
                  )
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
              />
              <span className="text-sm font-medium text-gray-700">Yes</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <Checkbox
                checked={formData.forensicAssessmentTrained === "no"}
                onCheckedChange={(checked) =>
                  handleInputChange(
                    "forensicAssessmentTrained",
                    checked ? "no" : "",
                  )
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
              />
              <span className="text-sm font-medium text-gray-700">No</span>
            </label>
          </div>
        </div>
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
  );
};
