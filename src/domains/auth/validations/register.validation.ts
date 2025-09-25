import * as Yup from 'yup';

export const step1PersonalInfoSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  phoneNumber: Yup.string()
    .min(5, 'Please enter a valid phone number')
    .required('Phone number is required'),
  emailAddress: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  provinceOfResidence: Yup.string().required('Province of residence is required'),
  mailingAddress: Yup.string()
    .min(10, 'Mailing address must be at least 10 characters')
    .required('Mailing address is required'),
});

export const step2MedicalCredentialsSchema = Yup.object({
  medicalSpecialty: Yup.string().required('Medical specialty is required'),
  licenseNumber: Yup.string()
    .min(5, 'License number must be at least 5 characters')
    .required('License number is required'),
  provinceOfLicensure: Yup.string().required('Province of licensure is required'),
  licenseExpiryDate: Yup.string().required('License expiry date is required'),
  medicalLicense: Yup.mixed().required('Medical license document is required'),
  cvResume: Yup.mixed().required('CV/Resume document is required'),
});

export const step3IMEExperienceSchema = Yup.object({
  yearsOfIMEExperience: Yup.string().required('Years of IME experience is required'),
  provinceOfLicensure: Yup.string().required('Province of licensure is required'),
  languagesSpoken: Yup.string().required('Languages spoken is required'),
  forensicAssessmentTrained: Yup.string().required(
    'Forensic assessment training status is required'
  ),
});

export const step4ExperienceDetailsSchema = Yup.object({
  experienceDetails: Yup.string()
    .min(10, 'Please provide at least 10 characters describing your experience')
    .max(500, 'Experience details must be less than 500 characters')
    .required('Experience details are required'),
});

export const step5AvailabilitySchema = Yup.object({
  preferredRegions: Yup.string().required('Preferred regions is required'),
  maxTravelDistance: Yup.string().required('Maximum travel distance is required'),
  daysAvailable: Yup.string().required('Days available is required'),
  timeWindows: Yup.object({
    morning: Yup.boolean(),
    afternoon: Yup.boolean(),
    evening: Yup.boolean(),
  }).test('at-least-one-time', 'Please select at least one time window', value => {
    return value.morning || value.afternoon || value.evening;
  }),
  acceptVirtualAssessments: Yup.string().required(
    'Please specify if you accept virtual assessments'
  ),
});

export const step6LegalSchema = Yup.object({
  signedNDA: Yup.mixed().required('Signed NDA document is required'),
  insuranceProof: Yup.mixed().required('Insurance proof document is required'),
  consentBackgroundVerification: Yup.boolean().oneOf(
    [true],
    'You must consent to background verification'
  ),
  agreeTermsConditions: Yup.boolean().oneOf([true], 'You must agree to terms and conditions'),
});

export const step9PasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const step1InitialValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  emailAddress: '',
  provinceOfResidence: '',
  mailingAddress: '',
};

export const step2InitialValues = {
  medicalSpecialty: '',
  licenseNumber: '',
  provinceOfLicensure: '',
  licenseExpiryDate: '',
  medicalLicense: null as File | null,
  cvResume: null as File | null,
};

export const step3InitialValues = {
  yearsOfIMEExperience: '',
  provinceOfLicensure: '',
  languagesSpoken: '',
  forensicAssessmentTrained: '',
};

export const step4InitialValues = {
  experienceDetails: '',
};

export const step5InitialValues = {
  preferredRegions: '',
  maxTravelDistance: '',
  daysAvailable: '',
  timeWindows: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  acceptVirtualAssessments: '',
};

export const step6InitialValues = {
  signedNDA: null as File | null,
  insuranceProof: null as File | null,
  consentBackgroundVerification: false,
  agreeTermsConditions: false,
};

export const step9InitialValues = {
  password: '',
  confirmPassword: '',
};
