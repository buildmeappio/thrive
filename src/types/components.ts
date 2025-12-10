/**
 * Component prop types
 */

// Using a type alias to avoid potential circular type issues with Prisma Decimal
type PrismaDecimal = { toString(): string; toNumber(): number; [Symbol.toPrimitive]?: (hint: string) => number | string };

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
 * Note: Fields can be null (from Prisma) or undefined (optional)
 */
export interface MedicalLicenseDocument {
  id: string;
  name: string;
  displayName?: string | null;
  type: string;
  size: number;
  documentId?: string;
  languageId?: string;
}

/**
 * Examiner data structure for registration
 * Note: Fields can be null (from Prisma) or undefined (optional)
 * Can represent either ExaminerApplication (has email, firstName, lastName directly)
 * or ExaminerProfile (has account.user.firstName, account.user.lastName, etc.)
 */
export interface ExaminerData {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  specialties?: string[] | null;
  languages?: string[] | null;
  languagesSpoken?: string[] | null;
  examinerLanguages?: Array<{ languageId: string }> | null;
  medicalLicenseDocuments?: MedicalLicenseDocument[] | null;
  address?: {
    address?: string | null;
    street?: string | null;
    suite?: string | null;
    postalCode?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
  mailingAddress?: string | null;
  provinceOfResidence?: string | null;
  landlineNumber?: string | null;
  licenseNumber?: string | null;
  provinceOfLicensure?: string | null;
  licenseIssuingProvince?: string | null;
  yearsOfIMEExperience?: string | null;
  licenseExpiryDate?: string | Date | null;
  imesCompleted?: string | null;
  currentlyConductingIMEs?: boolean | null;
  assessmentTypeIds?: string[] | null;
  assessmentTypes?: string[] | null;
  redactedIMEReportDocument?: MedicalLicenseDocument | null;
  experienceDetails?: string | null;
  bio?: string | null;
  isConsentToBackgroundVerification?: boolean | null;
  agreeToTerms?: boolean | null;
  feeStructure?: Array<{
    IMEFee?: number | PrismaDecimal | null;
    recordReviewFee?: number | PrismaDecimal | null;
    hourlyRate?: number | PrismaDecimal | null;
    cancellationFee?: number | PrismaDecimal | null;
  }> | null;
  account?: {
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
  } | null;
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

/**
 * Examiner profile details data structure
 * Used for registration form when loading existing examiner data
 */
export interface ExaminerProfileDetailsData {
  examinerApplication?: ExaminerData;
  examinerProfile?: ExaminerData;
  tokenData?: {
    email?: string;
    applicationId?: string;
    userId?: string;
    accountId?: string;
    examinerId?: string;
  };
}

