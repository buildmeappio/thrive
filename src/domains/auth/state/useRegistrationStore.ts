// domains/auth/state/useRegistrationStore.ts
"use client";

import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { ExaminerData, MedicalLicenseDocument } from "@/types/components";
import { YearsOfExperience } from "@/domains/auth/types";

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
  city: string;
  province: string;
  languagesSpoken: string[];
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
  licenseIssuingProvince: string;
  yearsOfIMEExperience: string;
  licenseExpiryDate?: string; // ISO yyyy-mm-dd (optional)
  medicalLicense: DocumentFile | DocumentFile[]; // Support both single file (backward compatibility) and array
};

export type Step3IMEExperience = {
  imesCompleted: string; // "yes" or "no"
  currentlyConductingIMEs: string; // "yes" or "no"
  assessmentTypes: string[]; // Multi-select checkboxes
  redactedIMEReport?: DocumentFile; // Optional file upload
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
  city: "",
  province: "",
  languagesSpoken: [],
  // Step 2 - Address
  address: "",
  street: "",
  suite: "",
  postalCode: "",
  // Step 2 - Medical Credentials
  medicalSpecialty: [],
  licenseNumber: "",
  licenseIssuingProvince: "",
  yearsOfIMEExperience: "",
  licenseExpiryDate: "",
  medicalLicense: [],
  // Step 3
  imesCompleted: "",
  currentlyConductingIMEs: "",
  assessmentTypes: [],
  redactedIMEReport: null,
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
  applicationId: string | null; // For ExaminerApplication updates
  setEditMode: (isEdit: boolean, profileId?: string) => void;
  loadExaminerData: (examinerData: ExaminerData) => void;
};

// Custom storage to handle File objects
const createRegistrationStorage = (): PersistStorage<Store> => {
  return {
    getItem: (name: string) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      return JSON.parse(str);
    },
    setItem: (name: string, value: unknown): void => {
      // Zustand passes the parsed state object, not a string
      // We need to sanitize it to remove File objects before storing
      try {
        const state = value as { state?: { data?: Record<string, unknown> } };
        if (state?.state?.data) {
          // Remove File objects before storing
          const sanitizedData = { ...state.state.data };
          // Handle medicalLicense as single File, array of Files, or array of ExistingDocuments
          if (sanitizedData.medicalLicense) {
            if (sanitizedData.medicalLicense instanceof File) {
              sanitizedData.medicalLicense = null;
            } else if (Array.isArray(sanitizedData.medicalLicense)) {
              // Keep serializable objects: ExistingDocument (plain objects with id)
              // Filter out File instances which can't be serialized to JSON
              const filtered = sanitizedData.medicalLicense.filter(
                (item: File | { id: string; [key: string]: unknown }) => {
                  // File instances can't be in parsed JSON, but check anyway during stringification
                  if (item instanceof File) {
                    return false;
                  }

                  // Keep plain objects (ExistingDocument objects)
                  // These have been serialized to JSON already, so they're plain objects with properties
                  if (
                    item &&
                    typeof item === "object" &&
                    "id" in item &&
                    item.id
                  ) {
                    return true;
                  }

                  return false;
                },
              );
              sanitizedData.medicalLicense = filtered;
            }
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
        // Fallback: try to stringify the value as-is
        localStorage.setItem(name, JSON.stringify(value));
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
        patch: Partial<RegistrationData>, // <- ensure Partial here
      ) => set((s) => ({ data: { ...s.data, ...patch } })),
      setAll: (all: RegistrationData) => set({ data: all }),
      reset: () => set({ data: initialData }),
      yearsOfExperience: [],
      setYearsOfExperience: (years: YearsOfExperience[]) =>
        set({ yearsOfExperience: years }),

      // Edit mode state
      isEditMode: false,
      examinerProfileId: null,
      applicationId: null,
      setEditMode: (isEdit: boolean, profileId?: string) =>
        set({ isEditMode: isEdit, examinerProfileId: profileId || null }),
      loadExaminerData: (examinerData: ExaminerData) => {
        // Clear localStorage before loading to prevent stale data from overwriting
        // This ensures fresh data from the server is used
        try {
          localStorage.removeItem("examiner-registration-storage");
        } catch (e) {
          console.warn("Failed to clear localStorage:", e);
        }

        // Check if this is ExaminerApplication (has email directly) or ExaminerProfile (has account.user)
        const isApplication = examinerData.email && !examinerData.account;

        const mappedData: Partial<RegistrationData> = {
          // Step 1: Personal Info
          firstName: isApplication
            ? examinerData.firstName || ""
            : examinerData.account?.user?.firstName || "",
          lastName: isApplication
            ? examinerData.lastName || ""
            : examinerData.account?.user?.lastName || "",
          emailAddress: isApplication
            ? examinerData.email || ""
            : examinerData.account?.user?.email || "",
          phoneNumber: isApplication
            ? examinerData.phone || ""
            : examinerData.account?.user?.phone || "",
          landlineNumber: examinerData.landlineNumber || "",
          city: examinerData.address?.city || "",
          province:
            examinerData.address?.province ||
            examinerData.provinceOfResidence ||
            "",
          languagesSpoken: isApplication
            ? examinerData.languagesSpoken || [] // Array of language IDs
            : examinerData.examinerLanguages?.map(
                (l: { languageId: string }) => l.languageId,
              ) || [],

          // Step 2: Address
          address:
            examinerData.address?.address || examinerData.mailingAddress || "",
          street: examinerData.address?.street || "",
          suite: examinerData.address?.suite || "",
          postalCode: examinerData.address?.postalCode || "",

          // Step 2: Medical Credentials
          medicalSpecialty: examinerData.specialties || [],
          licenseNumber: examinerData.licenseNumber || "",
          licenseIssuingProvince:
            examinerData.provinceOfLicensure ||
            examinerData.licenseIssuingProvince ||
            "",
          yearsOfIMEExperience: examinerData.yearsOfIMEExperience || "",
          licenseExpiryDate: examinerData.licenseExpiryDate
            ? new Date(examinerData.licenseExpiryDate)
                .toISOString()
                .split("T")[0]
            : "",
          // Documents - store document info for display (support multiple documents)
          medicalLicense:
            examinerData.medicalLicenseDocuments &&
            Array.isArray(examinerData.medicalLicenseDocuments) &&
            examinerData.medicalLicenseDocuments.length > 0
              ? examinerData.medicalLicenseDocuments.map(
                  (doc: MedicalLicenseDocument) => ({
                    id: doc.id,
                    name: doc.name,
                    displayName: doc.displayName || doc.name,
                    type: doc.type,
                    size: doc.size,
                    isExisting: true,
                  }),
                )
              : [],

          // Step 3: IME Experience
          imesCompleted: examinerData.imesCompleted || "",
          currentlyConductingIMEs: examinerData.currentlyConductingIMEs
            ? "yes"
            : "no",
          assessmentTypes: isApplication
            ? examinerData.assessmentTypeIds || [] // From ExaminerApplication
            : examinerData.assessmentTypes || [], // From ExaminerProfile
          redactedIMEReport: examinerData.redactedIMEReportDocument
            ? {
                id: examinerData.redactedIMEReportDocument.id,
                name: examinerData.redactedIMEReportDocument.name,
                displayName:
                  examinerData.redactedIMEReportDocument.displayName ||
                  examinerData.redactedIMEReportDocument.name,
                type: examinerData.redactedIMEReportDocument.type,
                size: examinerData.redactedIMEReportDocument.size,
                isExisting: true,
              }
            : null,

          // Step 4: Experience Details
          experienceDetails: isApplication
            ? examinerData.experienceDetails || "" // From ExaminerApplication
            : examinerData.bio || "", // From ExaminerProfile

          // Step 6: Legal
          consentBackgroundVerification:
            examinerData.isConsentToBackgroundVerification || false,
          agreeTermsConditions: examinerData.agreeToTerms || false,

          // Step 7: Payment Details (only for ExaminerProfile, not in Application)
          IMEFee:
            !isApplication && examinerData.feeStructure?.[0]?.IMEFee
              ? examinerData.feeStructure[0].IMEFee.toString()
              : "",

          recordReviewFee:
            !isApplication && examinerData.feeStructure?.[0]?.recordReviewFee
              ? examinerData.feeStructure[0].recordReviewFee.toString()
              : "",
          hourlyRate:
            !isApplication && examinerData.feeStructure?.[0]?.hourlyRate
              ? examinerData.feeStructure[0].hourlyRate.toString()
              : "",

          cancellationFee:
            !isApplication && examinerData.feeStructure?.[0]?.cancellationFee
              ? examinerData.feeStructure[0].cancellationFee.toString()
              : "",
        };

        set(() => ({
          data: { ...initialData, ...mappedData },
          isEditMode: true,
          examinerProfileId: isApplication ? null : examinerData.id, // Applications don't have profileId yet
          applicationId: isApplication ? examinerData.id : null, // Store applicationId for application updates
        }));
      },
    }),
    {
      name: "examiner-registration-storage",
      storage: createRegistrationStorage(),
      onRehydrateStorage: () => () => {
        // Rehydration completed
      },
    },
  ),
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
  city: d.city || "",
  province: d.province || "",
  languagesSpoken: d.languagesSpoken || [],
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
  licenseIssuingProvince: d.licenseIssuingProvince,
  yearsOfIMEExperience: d.yearsOfIMEExperience,
  licenseExpiryDate: d.licenseExpiryDate,
  medicalLicense: d.medicalLicense,
});

export const selectStep3 = (d: RegistrationData): Step3IMEExperience => ({
  imesCompleted: d.imesCompleted,
  currentlyConductingIMEs: d.currentlyConductingIMEs,
  assessmentTypes: d.assessmentTypes || [],
  redactedIMEReport: d.redactedIMEReport,
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
