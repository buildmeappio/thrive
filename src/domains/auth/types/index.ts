import { RoleType } from "@/domains/auth/constants/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  roleName: RoleType;
  accountId: string;
};

export type SubmitExaminerApplicationInput = {
  // Profile core
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  mailingAddress: string;

  // Credentials
  licenseNumber: string;
  licenseExpiryDate: Date;

  // Experience
  yearsOfIMEExperience: string;
  forensicAssessmentTrained: boolean;
  experienceDetails: string;

  // Availability
  preferredRegions: string;
  maxTravelDistanceKm: number;
  daysAvailable: (
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"
  )[];
  timeMorning: boolean;
  timeAfternoon: boolean;
  timeEvening: boolean;
  acceptVirtualAssessments: boolean;

  // Arrays
  languagesSpoken: string[];
  specialties: string[];

  // Docs: already uploaded to Documents; pass their IDs + types you have
  documents: Array<{
    documentId: string;
    type: "CV" | "MEDICAL_LICENSE" | "SIGNED_NDA" | "INSURANCE_PROOF" | "OTHER";
  }>;
};

export type ConsumeInviteAndSetPasswordInput = {
  token: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SendVerificationCodeInput = {
  email: string;
  ttlMinutes?: number;
};

export type VerifyCodeInput = {
  accountId: string;
  code: string;
};

export interface RegStepProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

export interface Step9PasswordProps {
  userId?: string;
  onNext: () => void;
}
