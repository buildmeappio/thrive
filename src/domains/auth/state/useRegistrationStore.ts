// domains/auth/state/useRegistrationStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Types per step
 */
export type Step1PersonalInfo = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    emailAddress: string;
    provinceOfResidence: string;
    mailingAddress: string;
};

export type Step2MedicalCredentials = {
    medicalSpecialty: string;
    licenseNumber: string;
    provinceOfLicensure: string; // reused in step 3 as well
    licenseExpiryDate: string;   // ISO yyyy-mm-dd
    medicalLicense: File | null;
    cvResume: File | null;
};

export type Step3IMEExperience = {
    yearsOfIMEExperience: string;
    languagesSpoken: string;
    forensicAssessmentTrained: string; // "yes"/"no" or similar
};

export type Step4ExperienceDetails = {
    experienceDetails: string;
};

export type Step5Availability = {
    preferredRegions: string;
    maxTravelDistance: string;
    daysAvailable: string;
    timeWindows: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
    };
    acceptVirtualAssessments: string; // "yes"/"no"
};

export type Step6Legal = {
    signedNDA: File | null;
    insuranceProof: File | null;
    consentBackgroundVerification: boolean;
    agreeTermsConditions: boolean;
};

export type Step9Password = {
    password: string;
    confirmPassword: string;
};

/**
 * Full registration payload
 * - Province of licensure appears in Step2 schema and Step3 schema. We keep one field.
 */
export type RegistrationData =
    Step1PersonalInfo &
    Step2MedicalCredentials &
    Step3IMEExperience &
    Step4ExperienceDetails &
    Step5Availability &
    Step6Legal &
    Step9Password;

/**
 * Initial values matching your Yup schemas' initialValues
 * Keep in sync with register.validation.ts
 */
export const initialData: RegistrationData = {
    // Step 1
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailAddress: '',
    provinceOfResidence: '',
    mailingAddress: '',
    // Step 2
    medicalSpecialty: '',
    licenseNumber: '',
    provinceOfLicensure: '',
    licenseExpiryDate: '',
    medicalLicense: null,
    cvResume: null,
    // Step 3
    yearsOfIMEExperience: '',
    languagesSpoken: '',
    forensicAssessmentTrained: '',
    // Step 4
    experienceDetails: '',
    // Step 5
    preferredRegions: '',
    maxTravelDistance: '',
    daysAvailable: '',
    timeWindows: { morning: false, afternoon: false, evening: false },
    acceptVirtualAssessments: '',
    // Step 6
    signedNDA: null,
    insuranceProof: null,
    consentBackgroundVerification: false,
    agreeTermsConditions: false,
    // Step 9
    password: '',
    confirmPassword: '',
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
};

/**
 * Persist to sessionStorage to survive route changes without leaving PII at rest long-term.
 * Switch to localStorage by replacing createJSONStorage(() => sessionStorage) if you prefer.
 */
export const useRegistrationStore = create<Store>()(
    persist(
        (set) => ({
            data: initialData,
            merge: (patch: Partial<RegistrationData>) =>   // <- ensure Partial here
                set((s) => ({ data: { ...s.data, ...patch } })),
            setAll: (all: RegistrationData) => set({ data: all }),
            reset: () => set({ data: initialData }),
        }),
        {
            name: 'thrive:examiner-registration',
            storage: createJSONStorage(() => sessionStorage),
            // Files cannot be serialized. We drop them on rehydrate to avoid JSON errors.
            partialize: (state) => {
                const { data } = state as Store;
                const { medicalLicense, cvResume, signedNDA, insuranceProof, ...rest } = data;
                return {
                    data: {
                        ...rest,
                        medicalLicense: null,
                        cvResume: null,
                        signedNDA: null,
                        insuranceProof: null,
                    } as RegistrationData,
                };
            },
            onRehydrateStorage: () => (state) => {
                // No-op, but kept for clarity if you want to hook logs
                // Note: File fields stay null after refresh; ask user to re-upload.
            },
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
    provinceOfResidence: d.provinceOfResidence,
    mailingAddress: d.mailingAddress,
});

export const selectStep2 = (d: RegistrationData): Step2MedicalCredentials => ({
    medicalSpecialty: d.medicalSpecialty,
    licenseNumber: d.licenseNumber,
    provinceOfLicensure: d.provinceOfLicensure,
    licenseExpiryDate: d.licenseExpiryDate,
    medicalLicense: d.medicalLicense,
    cvResume: d.cvResume,
});

export const selectStep3 = (d: RegistrationData): Step3IMEExperience => ({
    yearsOfIMEExperience: d.yearsOfIMEExperience,
    languagesSpoken: d.languagesSpoken,
    forensicAssessmentTrained: d.forensicAssessmentTrained,
});

export const selectStep4 = (d: RegistrationData): Step4ExperienceDetails => ({
    experienceDetails: d.experienceDetails,
});

export const selectStep5 = (d: RegistrationData): Step5Availability => ({
    preferredRegions: d.preferredRegions,
    maxTravelDistance: d.maxTravelDistance,
    daysAvailable: d.daysAvailable,
    timeWindows: d.timeWindows,
    acceptVirtualAssessments: d.acceptVirtualAssessments,
});

export const selectStep6 = (d: RegistrationData): Step6Legal => ({
    signedNDA: d.signedNDA,
    insuranceProof: d.insuranceProof,
    consentBackgroundVerification: d.consentBackgroundVerification,
    agreeTermsConditions: d.agreeTermsConditions,
});

export const selectStep9 = (d: RegistrationData): Step9Password => ({
    password: d.password,
    confirmPassword: d.confirmPassword,
});
