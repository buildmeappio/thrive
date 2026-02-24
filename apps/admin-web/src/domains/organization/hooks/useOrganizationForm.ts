import { useState, useCallback } from 'react';
import {
  CreateOrganizationFormData,
  CreateOrganizationFormErrors,
} from '../types/CreateOrganizationForm.types';
import organizationActions from '../actions';

const INITIAL_FORM_DATA: CreateOrganizationFormData = {
  organizationName: '',
  firstName: '',
  lastName: '',
  email: '',
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

  // Validate form
  const validate = useCallback(async (): Promise<boolean> => {
    const newErrors: CreateOrganizationFormErrors = {};

    // Validate organization name
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.trim().length < 2) {
      newErrors.organizationName = 'Organization name must be at least 2 characters';
    } else {
      const nameExists = await checkOrganizationName(formData.organizationName);
      if (nameExists) {
        newErrors.organizationName = 'This organization name is already taken';
      }
    }

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, checkOrganizationName]);

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    return (
      formData.organizationName.trim().length >= 2 &&
      formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      EMAIL_REGEX.test(formData.email.trim()) &&
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
    handleOrganizationNameBlur,
    validate,
    isFormValid,
    resetForm,
  };
};
