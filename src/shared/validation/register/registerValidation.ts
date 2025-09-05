import ErrorMessages from '@/constants/ErrorMessages';
import * as Yup from 'yup';

// Step1
export const OrganizationInfoSchema = Yup.object({
  organizationType: Yup.string().required(ErrorMessages.ORGANIZATION_TYPE_REQUIRED),

  organizationName: Yup.string()
    .matches(/^[A-Za-z\s]+$/, ErrorMessages.INVALID_NAME)
    .required(ErrorMessages.ORGANIZATION_NAME_REQUIRED),

  addressLookup: Yup.string()
    .min(5, ErrorMessages.ADDRESS_LOOKUP_MIN)
    .required(ErrorMessages.ADDRESS_LOOKUP_REQUIRED),

  streetAddress: Yup.string().required(ErrorMessages.STREET_REQUIRED),

  aptUnitSuite: Yup.string().optional(),

  city: Yup.string()
    .matches(/^[A-Za-z\s]+$/, ErrorMessages.INVALID_NAME)
    .required(ErrorMessages.CITY_REQUIRED),

  postalCode: Yup.string()
    .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
    .required(ErrorMessages.POSTAL_CODE_REQUIRED),

  provinceOfResidence: Yup.string().optional(),

  organizationWebsite: Yup.string().url(ErrorMessages.INVALID_URL).optional(),
});

export const OrganizationInfoInitialValues = {
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

// Step2
export const OfficeDetailsSchema = Yup.object({
  firstName: Yup.string()
    .matches(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.FIRST_NAME_INVALID)
    .required(ErrorMessages.FIRST_NAME_REQUIRED),

  lastName: Yup.string()
    .matches(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.LAST_NAME_INVALID)
    .required(ErrorMessages.LAST_NAME_REQUIRED),

  phoneNumber: Yup.string()
    // Canadian numbers: optional +, then 10–15 digits total
    .matches(/^\+?[1-9]\d{9,14}$/, ErrorMessages.INVALID_PHONE_NUMBER)
    .required(ErrorMessages.PHONE_REQUIRED),

  officialEmailAddress: Yup.string()
    .email(ErrorMessages.INVALID_EMAIL)
    .required(ErrorMessages.EMAIL_REQUIRED),

  jobTitle: Yup.string()
    .matches(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.JOB_TITLE_INVALID)
    .required(ErrorMessages.JOB_TITLE_REQUIRED),

  department: Yup.string().required(ErrorMessages.DEPARTMENT_REQUIRED),
});

export const OfficeDetailsInitialValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  officialEmailAddress: '',
  jobTitle: '',
  department: '',
};

// Step3
export const ComplianceAccessSchema = Yup.object({
  agreeTermsConditions: Yup.boolean().oneOf([true], ErrorMessages.AGREEMENT_REQUIRED),
  consentSecureDataHandling: Yup.boolean().optional(),
  authorizedToCreateAccount: Yup.boolean().optional(),
});

export const ComplianceAccessInitialValues = {
  agreeTermsConditions: false,
  consentSecureDataHandling: false,
  authorizedToCreateAccount: false,
};

// Step4
export const VerificationCodeSchema = Yup.object({
  code: Yup.string()
    .matches(/^\d{4}$/, ErrorMessages.INVALID_VERIFICATION_CODE)
    .required(ErrorMessages.VERIFICATION_CODE_REQUIRED),
});

export const VerificationCodeInitialValues = {
  code: '',
};

// Step5
export const PasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, ErrorMessages.PASSWORD_MIN)
    .matches(/[A-Z]/, ErrorMessages.PASSWORD_UPPERCASE)
    .matches(/[a-z]/, ErrorMessages.PASSWORD_LOWERCASE)
    .matches(/[0-9]/, ErrorMessages.PASSWORD_NUMBER)
    .matches(/[!@#$%^&*(),.?":{}|<>]/, ErrorMessages.PASSWORD_SPECIAL)
    .required(ErrorMessages.PASSWORD_REQUIRED),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], ErrorMessages.PASSWORD_CONFIRM)
    .required(ErrorMessages.PASSWORD_CONFIRM_REQUIRED),
});

export const PasswordInitialValues = {
  password: '',
  confirmPassword: '',
};
