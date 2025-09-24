import { create } from 'zustand';

export interface ExaminationService {
  type: 'transportation' | 'interpreter' | 'chaperone' | 'additionalNotes';
  enabled: boolean;
  details?: {
    // Transportation
    pickupAddress?: string;
    streetAddress?: string;
    aptUnitSuite?: string;
    city?: string;
    postalCode?: string;
    province?: string;
    // Interpreter
    language?: string;
    // Additional notes
    notes?: string;
  };
}

export interface ExaminationDetails {
  examinationTypeId: string;
  urgencyLevel: string;
  dueDate: string;
  instructions: string;
  services: ExaminationService[];
}

export type IMEFormData = {
  step1?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    emailAddress?: string;
    addressLookup: string;
    street?: string;
    suite?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    relatedCasesDetails?: string;
    familyDoctorName?: string;
    familyDoctorEmail?: string;
    familyDoctorPhone?: string;
    familyDoctorFax?: string;
  };
  step2?: {
    // Insurance fields
    insuranceCompanyName: string;
    insuranceAdjusterContact: string;
    insurancePolicyNo: string;
    insuranceClaimNo: string;
    insuranceDateOfLoss: string;
    insuranceAddressLookup?: string;
    insuranceStreetAddress?: string;
    insuranceAptUnitSuite?: string;
    insuranceCity?: string;
    insurancePhone: string;
    insuranceFaxNo: string;
    insuranceEmailAddress: string;
    // Policy holder fields
    policyHolderSameAsClaimant?: boolean;
    policyHolderFirstName: string;
    policyHolderLastName: string;
  };
  step3?: {
    legalCompanyName?: string;
    legalContactPerson?: string;
    legalPhone?: string;
    legalFaxNo?: string;
    legalAddressLookup?: string;
    legalStreetAddress?: string;
    legalAptUnitSuite?: string;
    legalCity?: string;
    legalPostalCode?: string;
    legalProvinceState?: string;
  };
  step4?: {
    caseTypes: { id: string; label: string }[];
  };
  step5?: {
    reasonForReferral: string;
    examinationType: string;
    examinations: ExaminationDetails[];
  };
  step6?: {
    files: File[];
  };
  step7?: {
    consentForSubmission: boolean;
    isDraft?: boolean;
  };
};

type FormStore = {
  data: IMEFormData;
  setData: <K extends keyof IMEFormData>(step: K, value: IMEFormData[K]) => void;
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
