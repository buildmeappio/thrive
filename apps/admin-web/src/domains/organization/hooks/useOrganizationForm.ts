import { useState, useCallback } from 'react';
import {
  CreateOrganizationFormData,
  CreateOrganizationFormErrors,
} from '../types/CreateOrganizationForm.types';
import organizationActions from '../actions';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const INITIAL_FORM_DATA: CreateOrganizationFormData = {
  organizationName: '',
  firstName: '',
  lastName: '',
  email: '',
  organizationType: undefined,
  organizationSize: undefined,
  website: undefined,
  timezone: undefined,
  hqAddress: undefined,
  hqAddressTimezone: undefined,
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useOrganizationForm = () => {
  const [formData, setFormData] = useState<CreateOrganizationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<CreateOrganizationFormErrors>({});
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Check if organization name already exists
  const checkOrganizationName = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim() || name.trim().length < 2) {
      return false;
    }

    setIsCheckingName(true);
    try {
      const result = await organizationActions.checkOrganizationNameExists(name.trim());
      return result?.exists ?? false;
    } catch (error) {
      console.error('Error checking organization name:', error);
      return false;
    } finally {
      setIsCheckingName(false);
    }
  }, []);

  // Handle input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear error for this field when user starts typing
      if (errors[name as keyof CreateOrganizationFormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  // Handle HQ address changes
  const handleHqAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const fieldName = name.replace('hqAddress.', '');

      setFormData(prev => {
        const currentHqAddress = prev.hqAddress || {
          line1: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'CA',
        };
        const updatedValue =
          fieldName === 'latitude' || fieldName === 'longitude'
            ? value
              ? parseFloat(value)
              : undefined
            : value;

        // Build the updated address object with all required fields (using empty strings as defaults)
        const updatedHqAddress: CreateOrganizationFormData['hqAddress'] = {
          line1: currentHqAddress.line1 || '',
          city: currentHqAddress.city || '',
          state: currentHqAddress.state || '',
          postalCode: currentHqAddress.postalCode || '',
          ...currentHqAddress,
          [fieldName]: updatedValue,
          country: currentHqAddress.country || 'CA', // Default to Canada
        };

        return {
          ...prev,
          hqAddress: updatedHqAddress,
        };
      });

      // Clear error for this field when user starts typing
      if (
        errors.hqAddress?.[
          fieldName as keyof NonNullable<CreateOrganizationFormErrors['hqAddress']>
        ]
      ) {
        setErrors(prev => ({
          ...prev,
          hqAddress: {
            ...prev.hqAddress,
            [fieldName]: undefined,
          },
        }));
      }
    },
    [errors]
  );

  // Handle blur event for organization name (check availability when user finishes typing)
  const handleOrganizationNameBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      if (value.length >= 2) {
        await checkOrganizationName(value);
      }
    },
    [checkOrganizationName]
  );

  // Helper function to check if string contains at least one alphabetic character
  const hasAlphabeticCharacter = (text: string): boolean => {
    return /[a-zA-Z]/.test(text);
  };

  // Validate form
  const validate = useCallback(async (): Promise<boolean> => {
    const newErrors: CreateOrganizationFormErrors = {};

    // Validate organization name
    const trimmedOrgName = formData.organizationName.trim();
    if (!trimmedOrgName) {
      newErrors.organizationName = ORGANIZATION_MESSAGES.VALIDATION.ORGANIZATION_NAME.REQUIRED;
    } else if (trimmedOrgName.length < 2) {
      newErrors.organizationName = ORGANIZATION_MESSAGES.VALIDATION.ORGANIZATION_NAME.MIN_LENGTH;
    } else if (!hasAlphabeticCharacter(trimmedOrgName)) {
      newErrors.organizationName = ORGANIZATION_MESSAGES.VALIDATION.ORGANIZATION_NAME.ALPHABETIC;
    } else {
      const nameExists = await checkOrganizationName(formData.organizationName);
      if (nameExists) {
        newErrors.organizationName =
          ORGANIZATION_MESSAGES.VALIDATION.ORGANIZATION_NAME.ALREADY_EXISTS;
      }
    }

    // Validate first name
    const trimmedFirstName = formData.firstName.trim();
    if (!trimmedFirstName) {
      newErrors.firstName = ORGANIZATION_MESSAGES.VALIDATION.FIRST_NAME.REQUIRED;
    } else if (trimmedFirstName.length < 2) {
      newErrors.firstName = ORGANIZATION_MESSAGES.VALIDATION.FIRST_NAME.MIN_LENGTH;
    } else if (!hasAlphabeticCharacter(trimmedFirstName)) {
      newErrors.firstName = ORGANIZATION_MESSAGES.VALIDATION.FIRST_NAME.ALPHABETIC;
    }

    // Validate last name
    const trimmedLastName = formData.lastName.trim();
    if (!trimmedLastName) {
      newErrors.lastName = ORGANIZATION_MESSAGES.VALIDATION.LAST_NAME.REQUIRED;
    } else if (trimmedLastName.length < 2) {
      newErrors.lastName = ORGANIZATION_MESSAGES.VALIDATION.LAST_NAME.MIN_LENGTH;
    } else if (!hasAlphabeticCharacter(trimmedLastName)) {
      newErrors.lastName = ORGANIZATION_MESSAGES.VALIDATION.LAST_NAME.ALPHABETIC;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = ORGANIZATION_MESSAGES.VALIDATION.EMAIL.REQUIRED;
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = ORGANIZATION_MESSAGES.VALIDATION.EMAIL.INVALID;
    }

    // Validate HQ address if provided (optional, but if any field is filled, all required fields must be filled)
    if (formData.hqAddress) {
      const hqErrors: CreateOrganizationFormErrors['hqAddress'] = {};
      const hasAnyHqField =
        formData.hqAddress.line1 ||
        formData.hqAddress.city ||
        formData.hqAddress.state ||
        formData.hqAddress.postalCode;

      if (hasAnyHqField) {
        if (!formData.hqAddress.line1?.trim()) {
          hqErrors.line1 = 'Address line 1 is required';
        } else if (formData.hqAddress.line1.trim().length < 4) {
          hqErrors.line1 = 'Address line 1 must be at least 4 characters';
        }

        if (!formData.hqAddress.city?.trim()) {
          hqErrors.city = 'City is required';
        } else if (formData.hqAddress.city.trim().length < 4) {
          hqErrors.city = 'City must be at least 4 characters';
        }

        if (!formData.hqAddress.state?.trim()) {
          hqErrors.state = 'State/Province is required';
        }

        if (!formData.hqAddress.postalCode?.trim()) {
          hqErrors.postalCode = 'Postal code is required';
        } else {
          // Validate postal code format
          const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
          if (!postalCodeRegex.test(formData.hqAddress.postalCode.trim())) {
            hqErrors.postalCode = 'Invalid postal code format';
          }
        }

        if (Object.keys(hqErrors).length > 0) {
          newErrors.hqAddress = hqErrors;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, checkOrganizationName]);

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    const trimmedOrgName = formData.organizationName.trim();
    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedEmail = formData.email.trim();

    return (
      trimmedOrgName.length >= 2 &&
      hasAlphabeticCharacter(trimmedOrgName) &&
      trimmedFirstName.length >= 2 &&
      hasAlphabeticCharacter(trimmedFirstName) &&
      trimmedLastName.length >= 2 &&
      hasAlphabeticCharacter(trimmedLastName) &&
      EMAIL_REGEX.test(trimmedEmail) &&
      !isCheckingName
    );
  }, [formData, isCheckingName]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setIsCheckingName(false);
  }, []);

  return {
    formData,
    errors,
    isCheckingName,
    handleChange,
    handleHqAddressChange,
    handleOrganizationNameBlur,
    validate,
    isFormValid,
    resetForm,
  };
};
