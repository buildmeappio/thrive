import {
  Step1PersonalInfoInput,
  Step2AddressInput,
  Step2MedicalCredentialsInput,
  Step3IMEExperienceInput,
  Step4ExperienceDetailsInput,
  Step6LegalInput,
  Step7PaymentDetailsInput,
  Step9PasswordInput,
  LoginInput,
} from "../schemas/auth.schemas";

export const step1InitialValues: Step1PersonalInfoInput = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  emailAddress: "",
  landlineNumber: "",
};

export const step2AddressInitialValues: Step2AddressInput = {
  address: "",
  street: "",
  suite: "",
  postalCode: "",
  province: "",
  city: "",
};

export const step2InitialValues: Step2MedicalCredentialsInput = {
  licenseNumber: "",
  // licenseExpiryDate: "",
  medicalLicense: null,
};

export const step3InitialValues: Step3IMEExperienceInput = {
  medicalSpecialty: [],
  forensicAssessmentTrained: "",
  yearsOfIMEExperience: "",
  cvResume: null,
};

export const step4InitialValues: Step4ExperienceDetailsInput = {
  experienceDetails: "",
};

export const step6InitialValues: Step6LegalInput = {
  // signedNDA: null as File | null,
  // insuranceProof: null as File | null,
  consentBackgroundVerification: false,
  agreeTermsConditions: false,
};

export const step7InitialValues: Step7PaymentDetailsInput = {
  IMEFee: "",
  recordReviewFee: "",
  hourlyRate: "",
  cancellationFee: "",
};

export const step9InitialValues: Step9PasswordInput = {
  password: "",
  confirmPassword: "",
};

export const loginInitialValues: LoginInput = {
  email: "",
  password: "",
};
