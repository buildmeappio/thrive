import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExaminationService {
  type: 'transportation' | 'interpreter' | 'chaperone';
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
  };
}

export interface ExaminationDetails {
  examinationTypeId: string;
  urgencyLevel: string;
  dueDate: string;
  instructions: string;
  locationType: string;
  selectedBenefits?: string[];
  services: ExaminationService[];
  additionalNotes?: string;
  supportPerson?: boolean;
}

export type IMEFormData = {
  step1?: {
    claimType: string;
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
    insurancePostalCode?: string;
    insuranceProvince?: string;
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
  _hasHydrated: boolean;
  setData: <K extends keyof IMEFormData>(step: K, value: IMEFormData[K]) => void;
  reset: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useIMEReferralStore = create<FormStore>()(
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
      name: 'ime-referral-form',
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
