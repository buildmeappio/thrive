"use client";

import { useCallback } from "react";

export type ContractFormValues = {
  // Contract variables
  province?: string;
  effective_date?: string;

  // Thrive/Organization variables
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
};

type ContractVariablesFormStepProps = {
  values: ContractFormValues;
  onChange: (values: ContractFormValues) => void;
};

/**
 * Renders contract and thrive variables as a dynamic form.
 * Similar to FeeStructureFormStep but specifically for contract.* and thrive.* variables.
 */
export default function ContractVariablesFormStep({
  values,
  onChange,
}: ContractVariablesFormStepProps) {
  // Handle field value change
  const handleFieldChange = useCallback(
    (key: keyof ContractFormValues, value: string) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange],
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-[#F6F6F6] rounded-xl sm:rounded-[15px] border border-[#E5E5E5]">
        <p className="text-sm sm:text-[15px] font-semibold font-poppins text-[#1A1A1A]">
          Contract & Organization Details
        </p>
        <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins mt-1">
          Fill in the contract and organization details below. These values will
          populate the contract placeholders.
        </p>
      </div>

      {/* Contract Variables Section */}
      <div className="space-y-4">
        <h3 className="font-[600] text-base sm:text-[17px] text-[#1A1A1A] font-poppins">
          Contract Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province */}
          <div>
            <label
              htmlFor="contract-province"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Province
            </label>
            <input
              id="contract-province"
              type="text"
              value={values.province || ""}
              onChange={(e) => handleFieldChange("province", e.target.value)}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="e.g., Ontario"
            />
          </div>

          {/* Effective Date */}
          <div>
            <label
              htmlFor="contract-effective-date"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Effective Date
            </label>
            <input
              id="contract-effective-date"
              type="date"
              value={values.effective_date || ""}
              onChange={(e) =>
                handleFieldChange("effective_date", e.target.value)
              }
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
            />
          </div>
        </div>
      </div>

      {/* Organization Variables Section */}
      <div className="space-y-4">
        <h3 className="font-[600] text-base sm:text-[17px] text-[#1A1A1A] font-poppins">
          Organization Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Name */}
          <div>
            <label
              htmlFor="thrive-company-name"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Company Name
            </label>
            <input
              id="thrive-company-name"
              type="text"
              value={values.company_name || ""}
              onChange={(e) =>
                handleFieldChange("company_name", e.target.value)
              }
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="e.g., Thrive IME Platform"
            />
          </div>

          {/* Company Address */}
          <div>
            <label
              htmlFor="thrive-company-address"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Company Address
            </label>
            <input
              id="thrive-company-address"
              type="text"
              value={values.company_address || ""}
              onChange={(e) =>
                handleFieldChange("company_address", e.target.value)
              }
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="e.g., 123 Main St, City, Province"
            />
          </div>

          {/* Company Phone */}
          <div>
            <label
              htmlFor="thrive-company-phone"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Company Phone
            </label>
            <input
              id="thrive-company-phone"
              type="tel"
              value={values.company_phone || ""}
              onChange={(e) =>
                handleFieldChange("company_phone", e.target.value)
              }
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="e.g., (123) 456-7890"
            />
          </div>

          {/* Company Email */}
          <div>
            <label
              htmlFor="thrive-company-email"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Company Email
            </label>
            <input
              id="thrive-company-email"
              type="email"
              value={values.company_email || ""}
              onChange={(e) =>
                handleFieldChange("company_email", e.target.value)
              }
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="e.g., contact@thrive.com"
            />
          </div>

          {/* Company Website */}
          <div className="sm:col-span-2">
            <label
              htmlFor="thrive-company-website"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Company Website
            </label>
            <input
              id="thrive-company-website"
              type="url"
              value={values.company_website || ""}
              onChange={(e) =>
                handleFieldChange("company_website", e.target.value)
              }
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="e.g., https://thrive.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Validates that required fields have values.
 * Currently all fields are optional since they may be pre-populated from settings.
 */
export function validateContractFormValues(values: ContractFormValues): {
  valid: boolean;
  missingFields: string[];
} {
  // All fields are optional for now
  return {
    valid: true,
    missingFields: [],
  };
}

/**
 * Initializes contract form values with defaults
 */
export function initializeContractFormValues(): ContractFormValues {
  return {
    effective_date: new Date().toISOString().split("T")[0], // Today's date
  };
}
