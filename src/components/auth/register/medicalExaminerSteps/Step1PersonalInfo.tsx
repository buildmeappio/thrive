import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { provinceOptions } from "~/config/medicalExaminerRegister/ProvinceDropdownOptions";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step1PersonalInfo: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    provinceOfResidence: "",
    mailingAddress: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Mobile View - Reduced spacing */}
      <div className="pt-1 md:pt-0">
        {/* Desktop View - Heading outside */}
        <div className="text-center hidden md:block">
          <h3 className="my-10 text-3xl font-medium text-[#140047]">
            Enter Your Personal Details
          </h3>
        </div>

        <div className="mt-0 md:mt-8 grid grid-cols-1 gap-x-14 gap-y-5 md:grid-cols-2">
          {/* Mobile View - Heading inside form with larger text */}
          <div className="col-span-1 text-center mt-1 mb-2 md:hidden">
            <h3 className="text-2xl mt-4 font-medium text-[#140047]">
              Enter Your Personal Details
            </h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-black text-sm">
              First Name<span className="text-red-500">*</span>
            </Label>
            <Input
              icon={User}
              placeholder="Dr. Sarah"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-black text-sm">
              Last Name<span className="text-red-500">*</span>
            </Label>
            <Input
              icon={User}
              placeholder="Ahmed"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-black text-sm">
              Phone Number<span className="text-red-500">*</span>
            </Label>
            <Input
              icon={Phone}
              type="tel"
              placeholder="(647) 555-1923"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailAddress" className="text-black text-sm">
              Email Address<span className="text-red-500">*</span>
            </Label>
            <Input
              icon={Mail}
              type="email"
              placeholder="s.ahmed@precisionmed.ca"
              value={formData.emailAddress}
              onChange={(e) => handleInputChange("emailAddress", e.target.value)}
            />
          </div>
          <Dropdown
            id="provinceOfResidence"
            label="Province of Residence"
            value={formData.provinceOfResidence}
            onChange={(value) => handleInputChange("provinceOfResidence", value)}
            options={provinceOptions}
            required={true}
            placeholder="Select Province"
          />

          <div className="space-y-2">
            <Label htmlFor="mailingAddress" className="text-black text-sm">
              Mailing Address<span className="text-red-500">*</span>
            </Label>
            <Input
              icon={MapPin}
              placeholder="125 Bay Street, Suite 600"
              value={formData.mailingAddress}
              onChange={(e) =>
                handleInputChange("mailingAddress", e.target.value)
              }
            />
          </div>
        </div>
        
        {/* Mobile View - Buttons in form area, left aligned with same size */}
        <div className="mt-14 flex flex-row justify-start gap-4 md:hidden">
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

      {/* Desktop View - Original layout */}
      <div className="mt-8 hidden md:flex justify-between">
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