import * as Yup from 'yup';

// Step1OrganizationInfo Schema
export const step1OrganizationInfoSchema = Yup.object({
  organizationType: Yup.string().required('Organization type is required'),
  organizationName: Yup.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .required('Organization name is required'),
  addressLookup: Yup.string()
    .min(5, 'Address lookup must be at least 5 characters')
    .required('Address lookup is required'),
  streetAddress: Yup.string().optional(),
  aptUnitSuite: Yup.string().optional(),
  city: Yup.string().optional(),
  postalCode: Yup.string().optional(),
  provinceOfResidence: Yup.string().optional(),
  organizationWebsite: Yup.string().url('Please enter a valid website URL').optional(),
});

// Step2OfficeDetails Schema
export const step2OfficeDetailsSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  phoneNumber: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  officialEmailAddress: Yup.string()
    .email('Please enter a valid email address')
    .required('Official email address is required'),
  jobTitle: Yup.string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must be less than 100 characters')
    .required('Job title is required'),
  department: Yup.string().required('Department is required'),
});

// Step3ComplianceAccess Schema
export const step3ComplianceAccessSchema = Yup.object({
  agreeTermsConditions: Yup.boolean().oneOf([true], 'You must agree to Terms & Conditions'),
  consentSecureDataHandling: Yup.boolean().oneOf(
    [true],
    'You must consent to secure data handling'
  ),
  authorizedToCreateAccount: Yup.boolean().oneOf(
    [true],
    'You must be authorized to create this account on behalf of your organization'
  ),
});

// Step4Validationschema for verification code
export const step4VerificationCodeSchema = Yup.object({
  code: Yup.string()
    .matches(/^\d{4}$/, 'Please enter a valid 4-digit code')
    .required('Verification code is required'),
});

// Step5Password Schema
export const step5PasswordSchema = Yup.object({
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

// Initial Values
export const step1OrganizationInfoInitialValues = {
  organizationType: '',
  organizationName: '',
  addressLookup: '',
  streetAddress: '',
  aptUnitSuite: '',
  city: '',
  postalCode: '',
  provinceOfResidence: '',
  organizationWebsite: '',
};

export const step2OfficeDetailsInitialValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  officialEmailAddress: '',
  jobTitle: '',
  department: '',
};

export const step3ComplianceAccessInitialValues = {
  agreeTermsConditions: false,
  consentSecureDataHandling: false,
  authorizedToCreateAccount: false,
};

export const step4verificationCodeInitialValues = {
  code: '',
};

export const step5PasswordInitialValues = {
  password: '',
  confirmPassword: '',
};
