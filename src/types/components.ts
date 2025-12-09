/**
 * Component prop types
 */

/**
 * Language option structure
 */
export interface LanguageOption {
  id: string;
  name: string;
  value: string;
  label?: string;
}

/**
 * Medical license document structure
 */
export interface MedicalLicenseDocument {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  size: number;
  documentId?: string;
  languageId?: string;
}

/**
 * Examiner data structure for registration
 */
export interface ExaminerData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  specialties?: string[];
  languages?: string[];
  examinerLanguages?: Array<{ languageId: string }>;
  medicalLicenseDocuments?: MedicalLicenseDocument[];
  [key: string]: unknown;
}

/**
 * Profile data structure
 */
export interface ProfileData {
  [key: string]: unknown;
}

/**
 * Specialty data structure
 */
export interface SpecialtyData {
  [key: string]: unknown;
}

/**
 * Availability data structure
 */
export interface AvailabilityData {
  [key: string]: unknown;
}

/**
 * Payout data structure
 */
export interface PayoutData {
  [key: string]: unknown;
}

/**
 * Initial form data structure
 */
export interface InitialFormData {
  [key: string]: unknown;
}

