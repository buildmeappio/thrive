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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="my-10 text-3xl font-medium text-[#140047]">
          Enter Your Personal Details
        </h3>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-14 gap-y-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-black">
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
          <Label htmlFor="lastName" className="text-black">
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
          <Label htmlFor="phoneNumber" className="text-black">
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
          <Label htmlFor="emailAddress" className="text-black">
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
          <Label htmlFor="mailingAddress" className="text-black">
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
      <div className="mt-8 flex justify-between">
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
