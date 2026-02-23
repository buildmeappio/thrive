import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FormData = {
  step1?: {
    organizationType: string;
    organizationName: string;
    addressLookup: string;
    streetAddress: string;
    aptUnitSuite: string;
    city: string;
    provinceOfResidence: string;
    postalCode: string;
    organizationWebsite: string;
  };
  step2?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    officialEmailAddress: string;
    jobTitle?: string;
    department: string;
  };
  step3?: {
    agreeTermsConditions: boolean;
    consentSecureDataHandling: boolean;
    authorizedToCreateAccount: boolean;
  };
  step4?: {
    code: string;
  };
  step5?: {
    password: string;
    confirmPassword: string;
  };
};

type FormStore = {
  data: FormData;
  _hasHydrated: boolean;
  setData: <K extends keyof FormData>(step: K, value: FormData[K]) => void;
  reset: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useRegistrationStore = create<FormStore>()(
  persist(
    set => ({
      data: {},
      _hasHydrated: false,
      setData: (step, value) =>
        set(state => ({
          data: { ...state.data, [step]: value },
        })),
      reset: () => set({ data: {} }),
      setHasHydrated: state => set({ _hasHydrated: state }),
    }),
    {
      name: 'registration-form',
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
