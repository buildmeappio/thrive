'use client';

import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';
import {
  ProfileInfoInput,
  ServicesAssessmentInput,
  AvailabilityPreferencesInput,
  PayoutDetailsInput,
} from '../schemas/onboardingSteps.schema';

// Types for documents and compliance
export type DocumentsUploadInput = {
  medicalLicenseDocumentIds?: string[];
  governmentIdDocumentId?: string;
  resumeDocumentId?: string;
  insuranceDocumentId?: string;
  specialtyCertificatesDocumentIds?: string[];
};

export type ComplianceInput = {
  phipaCompliance: boolean;
  pipedaCompliance: boolean;
  medicalLicenseActive: boolean;
};

export type NotificationsInput = {
  emailPaymentPayout: boolean;
  smsNotifications: boolean;
  emailMarketing: boolean;
};

/**
 * Persisted state (only data, no actions)
 */
type PersistedOnboardingState = {
  profileData: Partial<ProfileInfoInput> | null;
  servicesData: Partial<ServicesAssessmentInput> | null;
  availabilityData: Partial<AvailabilityPreferencesInput> | null;
  payoutData: Partial<PayoutDetailsInput> | null;
  documentsData: Partial<DocumentsUploadInput> | null;
  complianceData: Partial<ComplianceInput> | null;
  notificationsData: Partial<NotificationsInput> | null;
  examinerProfileId: string | null;
};

/**
 * Onboarding store shape
 */
type OnboardingStore = PersistedOnboardingState & {
  // Actions to merge data for each step
  mergeProfileData: (data: Partial<ProfileInfoInput>) => void;
  mergeServicesData: (data: Partial<ServicesAssessmentInput>) => void;
  mergeAvailabilityData: (data: Partial<AvailabilityPreferencesInput>) => void;
  mergePayoutData: (data: Partial<PayoutDetailsInput>) => void;
  mergeDocumentsData: (data: Partial<DocumentsUploadInput>) => void;
  mergeComplianceData: (data: Partial<ComplianceInput>) => void;
  mergeNotificationsData: (data: Partial<NotificationsInput>) => void;

  // Set examiner profile ID
  setExaminerProfileId: (id: string | null) => void;

  // Load initial data from server (merge with existing store data)
  loadInitialData: (data: {
    profile?: Partial<ProfileInfoInput>;
    services?: Partial<ServicesAssessmentInput>;
    availability?: Partial<AvailabilityPreferencesInput>;
    payout?: Partial<PayoutDetailsInput>;
    documents?: Partial<DocumentsUploadInput>;
    compliance?: Partial<ComplianceInput>;
    notifications?: Partial<NotificationsInput>;
  }) => void;

  // Reset store (clear all data)
  reset: () => void;
};

// Helper to get storage key based on examiner profile ID
const getStorageKey = (examinerProfileId: string | null): string => {
  return examinerProfileId ? `onboarding-storage-${examinerProfileId}` : 'onboarding-storage';
};

// Custom storage that uses dynamic key based on examinerProfileId
// Checks for browser environment to avoid SSR errors
// The storage type matches PersistedOnboardingState (what partialize returns)
// not the full OnboardingStore (which includes actions)
const createOnboardingStorage = (): PersistStorage<PersistedOnboardingState> => {
  return {
    getItem: (name: string): StorageValue<PersistedOnboardingState> | null => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return null;
      }
      try {
        const str = localStorage.getItem(name);
        if (!str) return null;
        const parsed = JSON.parse(str);
        return parsed as StorageValue<PersistedOnboardingState>;
      } catch (error) {
        console.warn('Failed to get onboarding storage:', error);
        return null;
      }
    },
    setItem: (name: string, value: StorageValue<PersistedOnboardingState>): void => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      try {
        // Store with dynamic key if examinerProfileId exists
        const examinerProfileId = value?.state?.examinerProfileId;
        if (examinerProfileId) {
          const dynamicKey = getStorageKey(examinerProfileId);
          localStorage.setItem(dynamicKey, JSON.stringify(value));
        }
        // Also save to base storage
        localStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to set onboarding storage:', error);
      }
    },
    removeItem: (name: string): void => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      try {
        // Try to get current state to find examinerProfileId
        const str = localStorage.getItem(name);
        if (str) {
          const parsed = JSON.parse(str);
          const examinerProfileId = parsed?.state?.examinerProfileId;
          if (examinerProfileId) {
            const dynamicKey = getStorageKey(examinerProfileId);
            localStorage.removeItem(dynamicKey);
          }
        }
        localStorage.removeItem(name);
      } catch (error) {
        console.warn('Failed to remove onboarding storage:', error);
      }
    },
  };
};

// Initial state
const initialState: Omit<
  OnboardingStore,
  | 'examinerProfileId'
  | 'setExaminerProfileId'
  | 'mergeProfileData'
  | 'mergeServicesData'
  | 'mergeAvailabilityData'
  | 'mergePayoutData'
  | 'mergeDocumentsData'
  | 'mergeComplianceData'
  | 'mergeNotificationsData'
  | 'loadInitialData'
  | 'reset'
> = {
  profileData: null,
  servicesData: null,
  availabilityData: null,
  payoutData: null,
  documentsData: null,
  complianceData: null,
  notificationsData: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      examinerProfileId: null,

      setExaminerProfileId: (id: string | null) => {
        const currentId = get().examinerProfileId;
        // If examinerProfileId changes, clear old data and reset
        if (currentId && currentId !== id) {
          // Only clear localStorage in browser environment
          if (typeof window !== 'undefined') {
            const oldStorageKey = getStorageKey(currentId);
            try {
              localStorage.removeItem(oldStorageKey);
            } catch (err) {
              console.warn('Failed to clear old onboarding storage:', err);
            }
          }
          set({ ...initialState, examinerProfileId: id });
        } else {
          set({ examinerProfileId: id });
        }
      },

      mergeProfileData: (data: Partial<ProfileInfoInput>) => {
        set(state => ({
          profileData: { ...state.profileData, ...data },
        }));
      },

      mergeServicesData: (data: Partial<ServicesAssessmentInput>) => {
        set(state => ({
          servicesData: { ...state.servicesData, ...data },
        }));
      },

      mergeAvailabilityData: (data: Partial<AvailabilityPreferencesInput>) => {
        set(state => ({
          availabilityData: { ...state.availabilityData, ...data },
        }));
      },

      mergePayoutData: (data: Partial<PayoutDetailsInput>) => {
        set(state => ({
          payoutData: { ...state.payoutData, ...data },
        }));
      },

      mergeDocumentsData: (data: Partial<DocumentsUploadInput>) => {
        set(state => ({
          documentsData: { ...state.documentsData, ...data },
        }));
      },

      mergeComplianceData: (data: Partial<ComplianceInput>) => {
        set(state => ({
          complianceData: { ...state.complianceData, ...data },
        }));
      },

      mergeNotificationsData: (data: Partial<NotificationsInput>) => {
        set(state => ({
          notificationsData: { ...state.notificationsData, ...data },
        }));
      },

      loadInitialData: data => {
        set(state => ({
          profileData: data.profile ? { ...state.profileData, ...data.profile } : state.profileData,
          servicesData: data.services
            ? { ...state.servicesData, ...data.services }
            : state.servicesData,
          availabilityData: data.availability
            ? { ...state.availabilityData, ...data.availability }
            : state.availabilityData,
          payoutData: data.payout ? { ...state.payoutData, ...data.payout } : state.payoutData,
          documentsData: data.documents
            ? { ...state.documentsData, ...data.documents }
            : state.documentsData,
          complianceData: data.compliance
            ? { ...state.complianceData, ...data.compliance }
            : state.complianceData,
          notificationsData: data.notifications
            ? { ...state.notificationsData, ...data.notifications }
            : state.notificationsData,
        }));
      },

      reset: () => {
        const { examinerProfileId } = get();
        // Clear localStorage for this examiner (only in browser)
        if (typeof window !== 'undefined') {
          const storageKey = getStorageKey(examinerProfileId);
          try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem('onboarding-storage');
          } catch (err) {
            console.warn('Failed to clear onboarding storage:', err);
          }
        }
        set(initialState);
      },
    }),
    {
      name: 'onboarding-storage', // Base name
      storage: createOnboardingStorage(),
      partialize: state => ({
        profileData: state.profileData,
        servicesData: state.servicesData,
        availabilityData: state.availabilityData,
        payoutData: state.payoutData,
        documentsData: state.documentsData,
        complianceData: state.complianceData,
        notificationsData: state.notificationsData,
        examinerProfileId: state.examinerProfileId,
      }),
    }
  )
);

// Helper function to get store key for a specific examiner
export const getOnboardingStorageKey = (examinerProfileId: string | null): string => {
  return getStorageKey(examinerProfileId);
};
