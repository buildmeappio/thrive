import React, { useState } from "react";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import { Upload, Download } from "lucide-react";
import type { MedExaminerRegStepProps } from "~/types";

export const Step6Legal: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [formData, setFormData] = useState({
    signedNDA: null as File | null,
    insuranceProof: null as File | null,
    consentBackgroundVerification: false,
    agreeTermsConditions: false,
  });

  const handleFileUpload = (field: 'signedNDA' | 'insuranceProof', file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleFileInputChange = (field: 'signedNDA' | 'insuranceProof') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    handleFileUpload(field, file);
  };

  const downloadNDA = () => {
    // This would trigger download of NDA template
    console.log("Downloading NDA template...");
  };

 

  return (
    <div className="min-h-screen flex flex-col px-3 sm:px-6 lg:px-8 py-3 sm:py-6 bg-white">
      <div className="flex-1 space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-3xl font-medium text-gray-700">Legal & Compliance</h2>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* File Upload Section */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 mt-8 sm:mt-16 md:grid-cols-2">
            {/* Upload Signed NDA */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label className="text-black text-sm sm:text-base font-medium">
                  Upload Signed NDA<span className="text-red-500">*</span>
                </Label>
                
                <button
                  onClick={downloadNDA}
                  className="flex items-center gap-2 text-[#00A8FF] hover:text-[#0088CC] text-xs sm:text-sm font-medium transition-colors self-start sm:self-auto"
                >
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  Download NDA
                </button>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="signedNDA"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange('signedNDA')}
                  className="hidden"
                />
                <label
                  htmlFor="signedNDA"
                  className={`flex items-center justify-between w-full h-11 sm:h-12 px-3 py-2 sm:py-3 text-xs sm:text-sm rounded-lg cursor-pointer border ${
                    formData.signedNDA 
                      ? 'bg-white border-gray-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className={`truncate pr-2 ${formData.signedNDA ? "text-gray-900" : "text-gray-500"}`}>
                    {formData.signedNDA ? formData.signedNDA.name : "DrAhmed_NDA.pdf"}
                  </span>
                  <Upload size={14} className="text-gray-500 flex-shrink-0 sm:w-4 sm:h-4" />
                </label>
              </div>
            </div>

            {/* Upload Insurance Proof */}
            <div className="space-y-3">
              <Label className="text-black text-sm sm:text-base font-medium">
                Upload Insurance Proof<span className="text-red-500">*</span>
              </Label>
              
              <div className="relative">
                <input
                  type="file"
                  id="insuranceProof"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleFileInputChange('insuranceProof')}
                  className="hidden"
                />
                <label
                  htmlFor="insuranceProof"
                  className={`flex items-center justify-between w-full h-11 sm:h-12 px-3 py-2 sm:py-3 text-xs sm:text-sm rounded-lg cursor-pointer border ${
                    formData.insuranceProof 
                      ? 'bg-white border-gray-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className={`truncate pr-2 ${formData.insuranceProof ? "text-gray-900" : "text-gray-500"}`}>
                    {formData.insuranceProof ? formData.insuranceProof.name : "DrAhmed_Insurance.pdf"}
                  </span>
                  <Upload size={14} className="text-gray-500 flex-shrink-0 sm:w-4 sm:h-4" />
                </label>
              </div>
            </div>
          </div>

          {/* Checkboxes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 sm:mt-16">
            {/* Consent to Background Verification */}
            <label className="flex cursor-pointer items-center space-x-3">
              <Checkbox
                checked={formData.consentBackgroundVerification}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("consentBackgroundVerification", checked as boolean)
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Consent to Background Verification<span className="text-red-500">*</span>
              </span>
            </label>

            {/* Terms & Conditions */}
            <label className="flex cursor-pointer items-center space-x-3">
              <Checkbox
                checked={formData.agreeTermsConditions}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("agreeTermsConditions", checked as boolean)
                }
                checkedColor="#00A8FF"
                checkIconColor="white"
                className="flex-shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                Agree to{" "}
                <a href="#" className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                  Privacy Policy
                </a>
                <span className="text-red-500">*</span>
              </span>
            </label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-3 sm:gap-4 pt-8 sm:pt-16">
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