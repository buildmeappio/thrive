import { type ExaminationData } from '@/domains/ime-referral/schemas/imeReferral';
import { create } from 'zustand';

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
    examTypes: { id: string; label: string }[];
  };
  step5?: ExaminationData;
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
