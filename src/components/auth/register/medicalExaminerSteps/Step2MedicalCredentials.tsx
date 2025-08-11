"use client";
import React, { useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { FileText, Upload, Calendar, MapPin } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { medicalSpecialtyOptions } from "~/config/medicalExaminerRegister/MedicalSpecialtyDropdownOptions";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step2MedicalCredentials: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const medicalLicenseRef = useRef<HTMLInputElement>(null);
  const cvResumeRef = useRef<HTMLInputElement>(null);
  const licenseExpiryRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    medicalSpecialty: "",
    licenseNumber: "",
    provinceOfLicensure: "",
    licenseExpiryDate: "",
    medicalLicense: null as File | null,
    cvResume: null as File | null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };
  const handleMedicalLicenseClick = () => {
    medicalLicenseRef.current?.click();
  };

  const handleCvResumeClick = () => {
    cvResumeRef.current?.click();
  };

  const handleLicenseExpiryClick = () => {
    licenseExpiryRef.current?.showPicker();
  };
  return (
    <div className="space-y-4 md:space-y-6 pb-6 px-4 md:px-0">
      <div className="text-center">
        <h3 className="my-4 md:my-10 text-xl md:text-2xl mt-4-md:mt-0 font-normal md:font-medium text-[#140047]">
          Enter Your Medical Credentials
        </h3>
      </div>

      <div className="mt-2 md:mt-8 grid grid-cols-1 gap-x-14 gap-y-6 md:grid-cols-2">
        <Dropdown
          id="medicalSpecialty"
          label="Medical Specialties"
          value={formData.medicalSpecialty}
          onChange={(value) => handleInputChange("medicalSpecialty", value)}
          options={medicalSpecialtyOptions}
          required={true}
          placeholder="Select Specialty"
        />

        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="text-black">
            License Number<span className="text-red-500">*</span>
          </Label>
          <Input
            icon={FileText}
            placeholder="Enter License Number"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="provinceOfLicensure" className="text-black">
            Province of Licensure<span className="text-red-500">*</span>
          </Label>
          <Input
            icon={MapPin}
            placeholder="Enter Province"
            value={formData.provinceOfLicensure}
            onChange={(e) =>
              handleInputChange("provinceOfLicensure", e.target.value)
            }
          />
        </div>

        <div className="space-y-2" onClick={handleLicenseExpiryClick}>
          <Label htmlFor="licenseExpiryDate" className="text-black">
            License Expiry Date<span className="text-red-500">*</span>
          </Label>
          <Input
            ref={licenseExpiryRef}
            icon={Calendar}
            type="date"
            placeholder="December 31, 2025"
            value={formData.licenseExpiryDate}
            onChange={(e) =>
              handleInputChange("licenseExpiryDate", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalLicense" className="text-black">
            Upload Medical License<span className="text-red-500">*</span>
          </Label>
          <div>
            <Input
              onClick={handleMedicalLicenseClick}
              icon={Upload}
              type="text"
              placeholder="Upload Medical License"
              value={
                formData.medicalLicense ? formData.medicalLicense.name : ""
              }
              readOnly
            />
            {/* Hidden real file input. */}
            <input
              type="file"
              ref={medicalLicenseRef}
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) =>
                handleFileChange("medicalLicense", e.target.files?.[0] || null)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvResume" className="text-black">
            Upload CV / Resume<span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            onClick={handleCvResumeClick}
            icon={Upload}
            placeholder="Upload CV / Resume"
            value={formData.cvResume ? formData.cvResume.name : ""}
            readOnly
          />

          {/* Hidden real file input */}
          <input
            type="file"
            ref={cvResumeRef}
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={(e) =>
              handleFileChange("cvResume", e.target.files?.[0] || null)
            }
          />
        </div>
      </div>

      <div className="mt-10 md:mt-8 flex justify-between">
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