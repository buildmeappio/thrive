import { useState, useCallback } from "react";
import {
  CreateOrganizationFormData,
  CreateOrganizationFormErrors,
} from "../types/CreateOrganizationForm.types";
import { GoogleMapsPlaceData } from "@/types/google-maps";
import { provinceOptions } from "@/constants/options";
import organizationActions from "../actions";

// Canadian postal code validation regex (A1A 1A1 or A1A1A1 format)
const CANADIAN_POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

// Character limits for organization form fields
const FIELD_LIMITS = {
  organizationName: 100,
  addressLookup: 500,
  streetAddress: 200,
  aptUnitSuite: 50,
  city: 100,
  organizationWebsite: 255,
} as const;

// Helper function to check if value contains at least one alphanumeric character
const hasAlphanumeric = (value: string): boolean => {
  return /[a-zA-Z0-9]/.test(value);
};

// Helper function to check if value contains at least one letter
const hasAtLeastOneLetter = (value: string): boolean => {
  return /[a-zA-Z]/.test(value.trim());
};

// Province code to full name mapping
const PROVINCE_CODE_TO_NAME: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NT: "Northwest Territories",
  NS: "Nova Scotia",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

const INITIAL_FORM_DATA: CreateOrganizationFormData = {
  organizationType: "",
  organizationName: "",
  addressLookup: "",
  streetAddress: "",
  aptUnitSuite: "",
  city: "",
  postalCode: "",
  province: "",
  organizationWebsite: "",
};

export const useOrganizationForm = () => {
  const [formData, setFormData] =
    useState<CreateOrganizationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<CreateOrganizationFormErrors>({});
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Format Canadian postal code (A1A 1A1)
  const formatPostalCode = useCallback((value: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    // Format as A1A 1A1 if we have 6 characters
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      // Limit to 6 characters
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
    }
  }, []);

  // Check if organization name already exists
  const checkOrganizationName = useCallback(
    async (name: string): Promise<boolean> => {
      if (!name.trim() || name.trim().length < 4) {
        return false;
      }

      setIsCheckingName(true);
      try {
        const result = await organizationActions.checkOrganizationNameExists(
          name.trim(),
        );
        console.log("Name check result:", result); // Debug log
        return result?.exists ?? false;
      } catch (error) {
        console.error("Error checking organization name:", error);
        // Return false on error to allow form submission, but log the error
        return false;
      } finally {
        setIsCheckingName(false);
      }
    },
    [],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      // Format postal code in real-time
      if (name === "postalCode") {
        const formatted = formatPostalCode(value);
        setFormData((prev) => ({
          ...prev,
          [name]: formatted,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    [formatPostalCode],
  );

  const handleAddressLookupChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, addressLookup: value }));
  }, []);

  const handlePlaceSelect = useCallback(
    (placeData: GoogleMapsPlaceData) => {
      if (!placeData.components) return;

      // Extract address components
      let streetNumber = "";
      let route = "";
      let city = "";
      let provinceCode = "";
      let postalCode = "";

      placeData.components.forEach((component) => {
        const types = component.types;
        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        } else if (types.includes("route")) {
          route = component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          provinceCode = component.short_name;
        } else if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      });

      // Convert province code to full name
      const provinceName = PROVINCE_CODE_TO_NAME[provinceCode] || provinceCode;

      // Format postal code
      const formattedPostalCode = formatPostalCode(postalCode);

      // Update form data with extracted components
      setFormData((prev) => ({
        ...prev,
        streetAddress:
          streetNumber && route
            ? `${streetNumber} ${route}`
            : route || streetNumber,
        city: city || prev.city,
        postalCode: formattedPostalCode || prev.postalCode,
        province: provinceName || prev.province,
      }));
    },
    [formatPostalCode],
  );

  const validate = useCallback(async (): Promise<boolean> => {
    const newErrors: CreateOrganizationFormErrors = {};

    if (!formData.organizationType) {
      newErrors.organizationType = "Organization Type is required";
    }

    // Validate Organization Name
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization Name is required";
    } else {
      const trimmedName = formData.organizationName.trim();
      if (trimmedName.length < 4) {
        newErrors.organizationName =
          "Organization Name must be at least 4 characters";
      } else if (trimmedName.length > FIELD_LIMITS.organizationName) {
        newErrors.organizationName = `Organization Name must not exceed ${FIELD_LIMITS.organizationName} characters`;
      } else if (!/^[a-zA-Z0-9\s\-'.,()&]+$/.test(trimmedName)) {
        newErrors.organizationName =
          "Organization Name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands";
      } else if (!hasAtLeastOneLetter(trimmedName)) {
        newErrors.organizationName =
          "Organization Name must contain at least one letter";
      } else {
        // Check if organization name already exists (only on submit)
        const nameExists = await checkOrganizationName(trimmedName);
        if (nameExists) {
          newErrors.organizationName =
            "An organization with this name already exists";
        }
      }
    }

    // Validate Address Lookup
    if (!formData.addressLookup.trim()) {
      newErrors.addressLookup = "Address Lookup is required";
    } else {
      const trimmedAddress = formData.addressLookup.trim();
      if (trimmedAddress.length < 6) {
        newErrors.addressLookup = "Address must be at least 6 characters";
      } else if (trimmedAddress.length > FIELD_LIMITS.addressLookup) {
        newErrors.addressLookup = `Address must not exceed ${FIELD_LIMITS.addressLookup} characters`;
      } else if (!hasAlphanumeric(trimmedAddress)) {
        newErrors.addressLookup =
          "Address must contain at least one letter or number";
      }
    }

    // Validate Street Address
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street Address is required";
    } else {
      const trimmedStreet = formData.streetAddress.trim();
      if (trimmedStreet.length > FIELD_LIMITS.streetAddress) {
        newErrors.streetAddress = `Street Address must not exceed ${FIELD_LIMITS.streetAddress} characters`;
      } else if (!hasAlphanumeric(trimmedStreet)) {
        newErrors.streetAddress =
          "Street Address must contain at least one letter or number";
      }
    }

    // Validate Apt/Unit/Suite (optional field)
    if (formData.aptUnitSuite && formData.aptUnitSuite.trim()) {
      const trimmedApt = formData.aptUnitSuite.trim();
      if (trimmedApt.length > FIELD_LIMITS.aptUnitSuite) {
        newErrors.aptUnitSuite = `Apt/Unit/Suite must not exceed ${FIELD_LIMITS.aptUnitSuite} characters`;
      } else if (!hasAlphanumeric(trimmedApt)) {
        newErrors.aptUnitSuite =
          "Apt/Unit/Suite must contain at least one letter or number";
      }
    }

    // Validate City
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else {
      const trimmedCity = formData.city.trim();
      if (trimmedCity.length > FIELD_LIMITS.city) {
        newErrors.city = `City must not exceed ${FIELD_LIMITS.city} characters`;
      } else if (!hasAlphanumeric(trimmedCity)) {
        newErrors.city = "City must contain at least one letter or number";
      }
    }

    // Validate Postal Code
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal Code is required";
    } else {
      // Normalize postal code (remove spaces and convert to uppercase)
      const normalizedPostalCode = formData.postalCode
        .replace(/\s+/g, "")
        .toUpperCase();
      if (!CANADIAN_POSTAL_CODE_REGEX.test(normalizedPostalCode)) {
        newErrors.postalCode =
          "Please enter a valid Canadian postal code (e.g., A1A 1A1)";
      }
    }

    // Validate Organization Website (optional field)
    if (formData.organizationWebsite && formData.organizationWebsite.trim()) {
      const trimmedWebsite = formData.organizationWebsite.trim();
      if (trimmedWebsite.length > FIELD_LIMITS.organizationWebsite) {
        newErrors.organizationWebsite = `Website must not exceed ${FIELD_LIMITS.organizationWebsite} characters`;
      } else if (!hasAlphanumeric(trimmedWebsite)) {
        newErrors.organizationWebsite =
          "Website must contain at least one letter or number";
      } else {
        // Basic URL validation (must start with http:// or https:// or be a valid domain)
        const urlPattern =
          /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (!urlPattern.test(trimmedWebsite)) {
          newErrors.organizationWebsite =
            "Please enter a valid website URL (e.g., https://example.com)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, checkOrganizationName]);

  // Check if all required fields have at least one character (for button enable state)
  // Button should be enabled as soon as user types something in all required fields
  const isFormValid = useCallback((): boolean => {
    return (
      formData.organizationType.length > 0 &&
      formData.organizationName.trim().length > 0 &&
      formData.addressLookup.trim().length > 0 &&
      formData.streetAddress.trim().length > 0 &&
      formData.city.trim().length > 0 &&
      formData.postalCode.trim().length > 0
    );
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isCheckingName,
    handleChange,
    handleAddressLookupChange,
    handlePlaceSelect,
    validate,
    isFormValid,
    resetForm,
  };
};
