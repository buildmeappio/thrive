import {
  Step1PersonalInfoInput,
  Step2MedicalCredentialsInput,
  Step3IMEExperienceInput,
  Step4ExperienceDetailsInput,
  Step5AvailabilityInput,
  Step6LegalInput,
  Step9PasswordInput,
  LoginInput,
} from "../schemas/auth.schemas";

export const step1InitialValues: Omit<
  Step1PersonalInfoInput,
  "provinceOfResidence"
> & {
  provinceOfResidence: string | null;
} = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  emailAddress: "",
  provinceOfResidence: null,
  mailingAddress: "",
  landlineNumber: "",
};

export const step2InitialValues: Step2MedicalCredentialsInput = {
  medicalSpecialty: [],
  licenseNumber: "",
  provinceOfLicensure: "",
  // licenseExpiryDate: "",
  medicalLicense: null,
  cvResume: null,
};

export const step3InitialValues: Step3IMEExperienceInput = {
  provinceOfLicensure: "",
  languagesSpoken: [],
  forensicAssessmentTrained: "",
  yearsOfIMEExperience: "",
};

export const step4InitialValues: Step4ExperienceDetailsInput = {
  experienceDetails: "",
};

export const step5InitialValues: Step5AvailabilityInput = {
  preferredRegions: [],
  maxTravelDistance: "",
  // daysAvailable: "",
  // timeWindows: {
  //   morning: false,
  //   afternoon: false,
  //   evening: false,
  // },
  acceptVirtualAssessments: "",
};

export const step6InitialValues: Step6LegalInput = {
  // signedNDA: null as File | null,
  // insuranceProof: null as File | null,
  consentBackgroundVerification: false,
  agreeTermsConditions: false,
};

export const step9InitialValues: Step9PasswordInput = {
  password: "",
  confirmPassword: "",
};

export const loginInitialValues: LoginInput = {
  email: "",
  password: "",
};
