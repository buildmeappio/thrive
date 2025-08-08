import React, { useState } from "react";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { regionOptions } from "~/config/medicalExaminerRegister/RegionDropdownOptions";
import { travelDistanceOptions } from "~/config/medicalExaminerRegister/TravelDistanceDropdownOptions";
import { daysOptions } from "~/config/medicalExaminerRegister/DaysDropdownOptions";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step5Availablity: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [formData, setFormData] = useState({
    preferredRegions: "",
    maxTravelDistance: "",
    daysAvailable: "",
    timeWindows: {
      morning: false,
      afternoon: false,
      evening: false,
    },
    acceptVirtualAssessments: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTimeWindowChange = (timeWindow: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      timeWindows: {
        ...prev.timeWindows,
        [timeWindow]: checked,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="my-10 text-3xl font-medium text-[#140047]">
          Availability & Preferences
        </h3>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-14 gap-y-6 md:grid-cols-2">
        <Dropdown
          id="preferredRegions"
          label="Preferred Regions"
          value={formData.preferredRegions}
          onChange={(value) => handleInputChange("preferredRegions", value)}
          options={regionOptions}
          required={true}
          placeholder="Toronto"
        />

        <Dropdown
          id="maxTravelDistance"
          label="Max Travel Distance"
          value={formData.maxTravelDistance}
          onChange={(value) => handleInputChange("maxTravelDistance", value)}
          options={travelDistanceOptions}
          required={true}
          placeholder="Up to 25 km"
        />
        <Dropdown
          id="daysAvailable"
          label="Days Available"
          value={formData.daysAvailable}
          onChange={(value) => handleInputChange("daysAvailable", value)}
          options={daysOptions}
          required={true}
          placeholder="Monday"
        />

        <div className="space-y-2">
          <Label className="text-black">
            Time Windows<span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex cursor-pointer items-center space-x-2">
              <Checkbox
                checked={formData.timeWindows.morning}
                onCheckedChange={(checked) =>
                  handleTimeWindowChange("morning", checked as boolean)
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
              />
              <span className="text-sm font-medium text-gray-700">Morning</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <Checkbox
                checked={formData.timeWindows.afternoon}
                onCheckedChange={(checked) =>
                  handleTimeWindowChange("afternoon", checked as boolean)
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
              />
              <span className="text-sm font-medium text-gray-700">
                Afternoon
              </span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <Checkbox
                checked={formData.timeWindows.evening}
                onCheckedChange={(checked) =>
                  handleTimeWindowChange("evening", checked as boolean)
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
              />
              <span className="text-sm font-medium text-gray-700">Evening</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Label className="text-black">
          Accept Virtual Assessments<span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.acceptVirtualAssessments}
          onValueChange={(value) =>
            handleInputChange("acceptVirtualAssessments", value)
          }
          className="flex space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="yes"
              id="yes"
              checkedColor="#00A8FF"
              indicatorColor="#00A8FF"
            />
            <Label
              htmlFor="yes"
              className="cursor-pointer text-sm font-medium text-gray-700"
            >
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="no"
              id="no"
              checkedColor="#00A8FF"
              indicatorColor="#00A8FF"
            />
            <Label
              htmlFor="no"
              className="cursor-pointer text-sm font-medium text-gray-700"
            >
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div className="mt-auto flex justify-between pt-8">
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
