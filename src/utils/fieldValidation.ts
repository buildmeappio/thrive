/**
 * Field validation utility that provides validation rules based on field names/labels
 * This ensures consistent validation across the application
 */

import ErrorMessages from '@/constants/ErrorMessages';

export type FieldType =
  | 'name'
  | 'firstName'
  | 'lastName'
  | 'organizationName'
  | 'companyName'
  | 'address'
  | 'streetAddress'
  | 'addressLookup'
  | 'city'
  | 'postalCode'
  | 'jobTitle'
  | 'department'
  | 'email'
  | 'phone'
  | 'fax'
  | 'website'
  | 'url'
  | 'notes'
  | 'description'
  | 'reason'
  | 'instructions'
  | 'claimNumber'
  | 'policyNumber'
  | 'contactPerson'
  | 'doctorName'
  | 'familyDoctorName'
  | 'caseDetails'
  | 'relatedCases'
  | 'apt'
  | 'suite'
  | 'aptUnitSuite';

/**
 * Get validation pattern based on field name
 */
export const getFieldValidationPattern = (fieldName: string): RegExp | null => {
  const normalizedName = fieldName.toLowerCase().trim();

  // Name fields - only letters, spaces, hyphens, apostrophes, and accented characters
  if (
    normalizedName.includes('name') &&
    (normalizedName.includes('first') ||
      normalizedName.includes('last') ||
      normalizedName.includes('doctor') ||
      normalizedName.includes('family') ||
      normalizedName.includes('contact') ||
      normalizedName.includes('person') ||
      normalizedName.includes('adjuster'))
  ) {
    return /^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/;
  }

  // Organization/Company names - letters, numbers, spaces, hyphens, apostrophes, periods, commas, ampersands
  if (
    normalizedName.includes('organization') ||
    normalizedName.includes('company') ||
    normalizedName.includes('clinic')
  ) {
    return /^[A-Za-z0-9À-ÿ' .,&-]+$/;
  }

  // Address lookup - letters, numbers, spaces, hyphens, periods, commas, #, /, \
  if (normalizedName.includes('lookup') && normalizedName.includes('address')) {
    return /^[A-Za-z0-9À-ÿ' .,#/\\-]+$/;
  }

  // Street addresses - letters, numbers, spaces, hyphens, periods, commas, #, /, \
  if (normalizedName.includes('street') || normalizedName.includes('address')) {
    return /^[A-Za-z0-9À-ÿ' .,#/\\-]+$/;
  }

  // City - only letters, spaces, hyphens, apostrophes
  if (normalizedName.includes('city')) {
    return /^[A-Za-zÀ-ÿ' -]+$/;
  }

  // Apt/Unit/Suite - letters, numbers, spaces, hyphens, #, /
  if (
    normalizedName.includes('apt') ||
    normalizedName.includes('unit') ||
    normalizedName.includes('suite')
  ) {
    return /^[A-Za-z0-9#/ -]+$/;
  }

  // Job Title - letters, spaces, hyphens, apostrophes, numbers
  if (normalizedName.includes('job') || normalizedName.includes('title')) {
    return /^[A-Za-zÀ-ÿ0-9' -]+$/;
  }

  // Department - letters, numbers, spaces, hyphens, apostrophes
  if (normalizedName.includes('department')) {
    return /^[A-Za-zÀ-ÿ0-9' -]+$/;
  }

  // Notes, descriptions, reasons, instructions - allow more characters but prevent only special chars
  if (
    normalizedName.includes('note') ||
    normalizedName.includes('description') ||
    normalizedName.includes('reason') ||
    normalizedName.includes('instruction') ||
    (normalizedName.includes('detail') && !normalizedName.includes('address')) ||
    (normalizedName.includes('case') && normalizedName.includes('related'))
  ) {
    // Must contain at least one letter or number - pattern allows common punctuation
    return /^[A-Za-z0-9À-ÿ' .,!?;:()\-&@#$%*+=<>[\]{}|\\/"]+$/;
  }

  // Claim/Policy numbers - letters, numbers, hyphens
  if (
    normalizedName.includes('claim') ||
    normalizedName.includes('policy') ||
    normalizedName.includes('number')
  ) {
    return /^[A-Za-z0-9-]+$/;
  }

  return null;
};

/**
 * Check if a value contains only special characters (no letters or numbers)
 */
export const containsOnlySpecialChars = (value: string): boolean => {
  if (!value || value.trim().length === 0) return false;
  // Check if the value contains at least one letter or number
  return !/[A-Za-z0-9À-ÿ]/.test(value);
};

/**
 * Get minimum length for a field based on its name
 */
export const getFieldMinLength = (fieldName: string): number => {
  const normalizedName = fieldName.toLowerCase().trim();

  if (normalizedName.includes('first') || normalizedName.includes('last')) {
    return 2;
  }
  if (normalizedName.includes('organization') || normalizedName.includes('company')) {
    return 6;
  }
  if (normalizedName.includes('street') || normalizedName.includes('address')) {
    if (normalizedName.includes('lookup')) return 5;
    return 5;
  }
  if (normalizedName.includes('city')) {
    return 4;
  }
  if (
    normalizedName.includes('apt') ||
    normalizedName.includes('unit') ||
    normalizedName.includes('suite')
  ) {
    return 2;
  }
  if (normalizedName.includes('job') || normalizedName.includes('title')) {
    return 2;
  }
  if (
    normalizedName.includes('contact') ||
    normalizedName.includes('person') ||
    normalizedName.includes('adjuster')
  ) {
    return 4;
  }
  if (normalizedName.includes('doctor') || normalizedName.includes('family')) {
    return 5;
  }
  if (normalizedName.includes('claim') || normalizedName.includes('policy')) {
    return 3;
  }
  if (
    normalizedName.includes('note') ||
    normalizedName.includes('description') ||
    normalizedName.includes('reason') ||
    normalizedName.includes('instruction')
  ) {
    return 10;
  }
  if (normalizedName.includes('case') || normalizedName.includes('related')) {
    return 10;
  }

  return 1;
};

/**
 * Get error message for invalid field format
 */
export const getFieldFormatErrorMessage = (fieldName: string): string => {
  const normalizedName = fieldName.toLowerCase().trim();

  if (
    normalizedName.includes('name') &&
    (normalizedName.includes('first') || normalizedName.includes('last'))
  ) {
    return ErrorMessages.NAME_INVALID;
  }
  if (normalizedName.includes('organization') || normalizedName.includes('company')) {
    return (
      ErrorMessages.ORGANIZATION_NAME_INVALID || 'Organization name contains invalid characters'
    );
  }
  if (normalizedName.includes('street') || normalizedName.includes('address')) {
    return ErrorMessages.STREET_ADDRESS_INVALID || 'Street address contains invalid characters';
  }
  if (normalizedName.includes('city')) {
    return ErrorMessages.INVALID_NAME;
  }
  if (normalizedName.includes('job') || normalizedName.includes('title')) {
    return ErrorMessages.JOB_TITLE_INVALID;
  }

  return 'This field contains invalid characters';
};

/**
 * Validate field value based on field name
 * Returns error message if invalid, null if valid
 */
export const validateFieldByLabel = (fieldName: string, value: string): string | null => {
  if (!value || value.trim().length === 0) {
    return null; // Empty values are handled by required validation
  }

  const trimmedValue = value.trim();

  // Check if value contains only special characters
  if (containsOnlySpecialChars(trimmedValue)) {
    return getFieldFormatErrorMessage(fieldName);
  }

  // Get pattern for field
  const pattern = getFieldValidationPattern(fieldName);
  if (pattern && !pattern.test(trimmedValue)) {
    return getFieldFormatErrorMessage(fieldName);
  }

  // Check minimum length
  const minLength = getFieldMinLength(fieldName);
  if (trimmedValue.length < minLength) {
    // Return null here as min length is handled by schema
    return null;
  }

  return null;
};
