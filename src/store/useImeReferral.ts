import { create } from 'zustand';

export type CaseData = {
  id?: string;
  reason: string;
  caseType: string;
  urgencyLevel: string;
  examFormat: string;
  requestedSpecialty: string;
  preferredLocation: string;
  files: File[];
};

export type IMEFormData = {
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
    cases: CaseData[];
  };
  step3?: {
    consentForSubmission: boolean;
  };
};

type FormStore = {
  data: IMEFormData;
  currentCaseIndex: number;
  setData: <K extends keyof IMEFormData>(step: K, value: IMEFormData[K]) => void;
  addCase: (caseData: CaseData) => void;
  updateCase: (index: number, caseData: CaseData) => void;
  removeCase: (index: number) => void;
  setCurrentCaseIndex: (index: number) => void;
  reset: () => void;
};

export const useIMEReferralStore = create<FormStore>(set => ({
  data: {},
  currentCaseIndex: 0,

  setData: (step, value) =>
    set(state => ({
      data: { ...state.data, [step]: value },
    })),

  addCase: caseData =>
    set(state => ({
      data: {
        ...state.data,
        step2: {
          cases: [...(state.data.step2?.cases || []), caseData],
        },
      },
    })),

  updateCase: (index, caseData) =>
    set(state => {
      const cases = state.data.step2?.cases || [];
      const updatedCases = [...cases];
      updatedCases[index] = caseData;

      return {
        data: {
          ...state.data,
          step2: { cases: updatedCases },
        },
      };
    }),

  removeCase: index =>
    set(state => {
      const cases = state.data.step2?.cases || [];
      const updatedCases = cases.filter((_, i) => i !== index);
      const currentIndex = state.currentCaseIndex;

      return {
        data: {
          ...state.data,
          step2: { cases: updatedCases },
        },
        currentCaseIndex:
          currentIndex >= updatedCases.length ? Math.max(0, updatedCases.length - 1) : currentIndex,
      };
    }),

  setCurrentCaseIndex: index => set({ currentCaseIndex: index }),

  reset: () => set({ data: {}, currentCaseIndex: 0 }),
}));
