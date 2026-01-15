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

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization Name is required";
    } else if (formData.organizationName.trim().length < 4) {
      newErrors.organizationName =
        "Organization Name must be at least 4 characters";
    } else {
      // Check if organization name already exists (only on submit)
      const nameExists = await checkOrganizationName(formData.organizationName);
      if (nameExists) {
        newErrors.organizationName =
          "An organization with this name already exists";
      }
    }

    if (!formData.addressLookup.trim()) {
      newErrors.addressLookup = "Address Lookup is required";
    } else if (formData.addressLookup.trim().length < 6) {
      newErrors.addressLookup = "Address must be at least 6 characters";
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

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
