// domains/auth/state/useRegistrationStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type YearsOfExperience = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

// Removed - not used in current flow
// type MaximumDistanceTravel = {
//   id: string;
//   name: string;
//   description: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt: Date | null;
// };

// Document types for handling both new uploads and existing documents
export type ExistingDocument = {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  size: number;
  isExisting: true;
};

export type DocumentFile = File | ExistingDocument | null;
/**
 * Types per step
 */
export type Step1PersonalInfo = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  landlineNumber: string;
};

export type Step2Address = {
  address: string;
  street?: string;
  suite?: string;
  postalCode?: string;
  province?: string;
  city?: string;
};

export type Step2MedicalCredentials = {
  medicalSpecialty: string[];
  licenseNumber: string;
  licenseExpiryDate?: string; // ISO yyyy-mm-dd (optional)
  medicalLicense: DocumentFile;
  cvResume: DocumentFile;
};

export type Step3IMEExperience = {
  yearsOfIMEExperience: string;
  languagesSpoken?: string[]; // Optional - not used in current flow
  forensicAssessmentTrained: string; // "yes"/"no" or similar
};

export type Step4ExperienceDetails = {
  experienceDetails: string;
};

export type Step6Legal = {
  signedNDA?: File | null; // Optional - not used in current flow
  insuranceProof?: File | null; // Optional - not used in current flow
  consentBackgroundVerification: boolean;
  agreeTermsConditions: boolean;
};

export type Step7PaymentDetails = {
  IMEFee?: string; // Optional - not used in current flow
  recordReviewFee?: string; // Optional - not used in current flow
  hourlyRate?: string; // Optional - not used in current flow
  cancellationFee?: string; // Optional - not used in current flow
};

export type Step9Password = {
  password: string;
  confirmPassword: string;
};

/**
 * Full registration payload
 * - Province of licensure appears in Step2 schema and Step3 schema. We keep one field.
 */
export type RegistrationData = Step1PersonalInfo &
  Step2Address &
  Step2MedicalCredentials &
  Step3IMEExperience &
  Step4ExperienceDetails &
  Step6Legal &
  Step7PaymentDetails &
  Step9Password;
/**
 * Initial values matching your Yup schemas' initialValues
 * Keep in sync with register.validation.ts
 */
export const initialData: RegistrationData = {
  // Step 1
  firstName: "",
  lastName: "",
  phoneNumber: "",
  emailAddress: "",
  landlineNumber: "",
  // Step 2 - Address
  address: "",
  street: "",
  suite: "",
  postalCode: "",
  province: "",
  city: "",
  // Step 2 - Medical Credentials
  medicalSpecialty: [],
  licenseNumber: "",
  licenseExpiryDate: "",
  medicalLicense: null,
  cvResume: null,
  // Step 3
  yearsOfIMEExperience: "",
  languagesSpoken: [],
  forensicAssessmentTrained: "",
  // Step 4
  experienceDetails: "",
  // Step 6
  signedNDA: null,
  insuranceProof: null,
  consentBackgroundVerification: false,
  agreeTermsConditions: false,
  // Step 7
  IMEFee: "",
  recordReviewFee: "",
  hourlyRate: "",
  cancellationFee: "",
  // Step 9
  password: "",
  confirmPassword: "",
};

/**
 * Store shape
 */
type Store = {
  data: RegistrationData;
  /** Merge a partial patch from any step */
  merge: (patch: Partial<RegistrationData>) => void;
  /** Replace whole data object */
  setAll: (all: RegistrationData) => void;
  /** Reset to initial */
  reset: () => void;

  yearsOfExperience: YearsOfExperience[];
  setYearsOfExperience: (years: YearsOfExperience[]) => void;

  // Edit mode state
  isEditMode: boolean;
  examinerProfileId: string | null;
  setEditMode: (isEdit: boolean, profileId?: string) => void;
  loadExaminerData: (examinerData: any) => void;
};

// Custom storage to handle File objects
const createRegistrationStorage = () => {
  return {
    getItem: (name: string) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      return str;
    },
    setItem: (name: string, value: string) => {
      // Parse the state to exclude File objects (non-serializable)
      try {
        const state = JSON.parse(value);
        if (state?.state?.data) {
          // Remove File objects before storing
          const sanitizedData = { ...state.state.data };
          if (
            sanitizedData.medicalLicense &&
            sanitizedData.medicalLicense instanceof File
          ) {
            sanitizedData.medicalLicense = null;
          }
          if (
            sanitizedData.cvResume &&
            sanitizedData.cvResume instanceof File
          ) {
            sanitizedData.cvResume = null;
          }
          if (
            sanitizedData.signedNDA &&
            sanitizedData.signedNDA instanceof File
          ) {
            sanitizedData.signedNDA = null;
          }
          if (
            sanitizedData.insuranceProof &&
            sanitizedData.insuranceProof instanceof File
          ) {
            sanitizedData.insuranceProof = null;
          }
          state.state.data = sanitizedData;
        }
        localStorage.setItem(name, JSON.stringify(state));
      } catch {
        localStorage.setItem(name, value);
      }
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
    },
  };
};

export const useRegistrationStore = create<Store>()(
  persist(
    (set) => ({
      data: initialData,
      merge: (
        patch: Partial<RegistrationData> // <- ensure Partial here
      ) => set((s) => ({ data: { ...s.data, ...patch } })),
      setAll: (all: RegistrationData) => set({ data: all }),
      reset: () => set({ data: initialData }),
      yearsOfExperience: [],
      setYearsOfExperience: (years: YearsOfExperience[]) =>
        set({ yearsOfExperience: years }),

      // Edit mode state
      isEditMode: false,
      examinerProfileId: null,
      setEditMode: (isEdit: boolean, profileId?: string) =>
        set({ isEditMode: isEdit, examinerProfileId: profileId || null }),
      loadExaminerData: (examinerData: any) => {
        const mappedData: Partial<RegistrationData> = {
          // Step 1: Personal Info
          firstName: examinerData.account?.user?.firstName || "",
          lastName: examinerData.account?.user?.lastName || "",
          emailAddress: examinerData.account?.user?.email || "",
          phoneNumber: examinerData.account?.user?.phone || "",
          landlineNumber: examinerData.landlineNumber || "",

          // Step 2: Address
          address: examinerData.address?.address || "",
          street: examinerData.address?.street || "",
          suite: examinerData.address?.suite || "",
          postalCode: examinerData.address?.postalCode || "",
          province: examinerData.address?.province || "",
          city: examinerData.address?.city || "",

          // Step 2: Medical Credentials
          medicalSpecialty: examinerData.specialties || [],
          licenseNumber: examinerData.licenseNumber || "",
          licenseExpiryDate: examinerData.licenseExpiryDate
            ? new Date(examinerData.licenseExpiryDate)
                .toISOString()
                .split("T")[0]
            : "",
          // Documents - store document info for display
          medicalLicense: examinerData.medicalLicenseDocument
            ? {
                id: examinerData.medicalLicenseDocument.id,
                name: examinerData.medicalLicenseDocument.name,
                displayName:
                  examinerData.medicalLicenseDocument.displayName ||
                  examinerData.medicalLicenseDocument.name,
                type: examinerData.medicalLicenseDocument.type,
                size: examinerData.medicalLicenseDocument.size,
                isExisting: true,
              }
            : null,
          cvResume: examinerData.resumeDocument
            ? {
                id: examinerData.resumeDocument.id,
                name: examinerData.resumeDocument.name,
                displayName:
                  examinerData.resumeDocument.displayName ||
                  examinerData.resumeDocument.name,
                type: examinerData.resumeDocument.type,
                size: examinerData.resumeDocument.size,
                isExisting: true,
              }
            : null,

          // Step 3: IME Experience
          yearsOfIMEExperience: examinerData.yearsOfIMEExperience || "",
          languagesSpoken:
            examinerData.examinerLanguages?.map((l: any) => l.languageId) || [],
          forensicAssessmentTrained: examinerData.isForensicAssessmentTrained
            ? "yes"
            : "no",

          // Step 4: Experience Details
          experienceDetails: examinerData.bio || "",

          // Step 6: Legal
          consentBackgroundVerification:
            examinerData.isConsentToBackgroundVerification || false,
          agreeTermsConditions: examinerData.agreeToTerms || false,

          // Step 7: Payment Details
          IMEFee: examinerData.feeStructure?.[0]?.IMEFee
            ? examinerData.feeStructure[0].IMEFee.toString()
            : "",

          recordReviewFee: examinerData.feeStructure?.[0]?.recordReviewFee
            ? examinerData.feeStructure[0].recordReviewFee.toString()
            : "",
          hourlyRate: examinerData.feeStructure?.[0]?.hourlyRate
            ? examinerData.feeStructure[0].hourlyRate.toString()
            : "",

          cancellationFee: examinerData.feeStructure?.[0]?.cancellationFee
            ? examinerData.feeStructure[0].cancellationFee.toString()
            : "",
        };

        set((state) => ({
          data: { ...state.data, ...mappedData },
          isEditMode: true,
          examinerProfileId: examinerData.id,
        }));
      },
    }),
    {
      name: "examiner-registration-storage",
      storage: createRegistrationStorage() as any,
    }
  )
);

/**
 * Optional selectors per step to reduce re-renders in components.
 * Usage: const step1 = useRegistrationStore((s) => selectStep1(s.data))
 */
export const selectStep1 = (d: RegistrationData): Step1PersonalInfo => ({
  firstName: d.firstName,
  lastName: d.lastName,
  phoneNumber: d.phoneNumber,
  emailAddress: d.emailAddress,
  landlineNumber: d.landlineNumber,
});

export const selectStep2Address = (d: RegistrationData): Step2Address => ({
  address: d.address || "",
  street: d.street || "",
  suite: d.suite || "",
  postalCode: d.postalCode || "",
  province: d.province || "",
  city: d.city || "",
});

export const selectStep2 = (d: RegistrationData): Step2MedicalCredentials => ({
  medicalSpecialty: d.medicalSpecialty || [],
  licenseNumber: d.licenseNumber,
  licenseExpiryDate: d.licenseExpiryDate,
  medicalLicense: d.medicalLicense,
  cvResume: d.cvResume,
});

export const selectStep3 = (d: RegistrationData): Step3IMEExperience => ({
  yearsOfIMEExperience: d.yearsOfIMEExperience,
  languagesSpoken: d.languagesSpoken || [],
  forensicAssessmentTrained: d.forensicAssessmentTrained,
});

export const selectStep4 = (d: RegistrationData): Step4ExperienceDetails => ({
  experienceDetails: d.experienceDetails,
});

export const selectStep6 = (d: RegistrationData): Step6Legal => ({
  signedNDA: d.signedNDA,
  insuranceProof: d.insuranceProof,
  consentBackgroundVerification: d.consentBackgroundVerification,
  agreeTermsConditions: d.agreeTermsConditions,
});

export const selectStep7 = (d: RegistrationData): Step7PaymentDetails => ({
  IMEFee: d.IMEFee,
  recordReviewFee: d.recordReviewFee,
  hourlyRate: d.hourlyRate,
  cancellationFee: d.cancellationFee,
});

export const selectStep9 = (d: RegistrationData): Step9Password => ({
  password: d.password,
  confirmPassword: d.confirmPassword,
});
