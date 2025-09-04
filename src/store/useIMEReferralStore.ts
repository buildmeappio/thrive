import { create } from 'zustand';

export type FormData = {
  step1?: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    addressLookup: string;
    street?: string;
    apt?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  };
  step2?: {
    reason: string;
    caseType: string;
    urgencyLevel: string;
    examFormat: string;
    requestedSpecialty: string;
    preferredLocation: string;
  };
  step3?: {
    files: File[];
  };
  step4?: {
    consentConfirmation: boolean;
  };
};

type FormStore = {
  data: FormData;
  setData: <K extends keyof FormData>(step: K, value: FormData[K]) => void;
  reset: () => void;
};

export const useIMEReferralStore = create<FormStore>(set => ({
  data: {},
  setData: (step, value) =>
    set(state => ({
      data: { ...state.data, [step]: value },
    })),
  reset: () => set({ data: {} }),
}));
