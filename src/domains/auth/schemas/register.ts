import ErrorMessages from '@/constants/ErrorMessages';
import { validateCanadianPhoneNumber } from '@/utils/formatNumbers';
import * as Yup from 'yup';

// Step1
export const OrganizationInfoSchema = Yup.object({
  organizationType: Yup.string().required(ErrorMessages.ORGANIZATION_TYPE_REQUIRED),

  organizationName: Yup.string()
    .trim()
    .min(6, ErrorMessages.ORGANIZATION_NAME_MIN)
    .required(ErrorMessages.ORGANIZATION_NAME_REQUIRED),

  addressLookup: Yup.string()
    .min(5, ErrorMessages.ADDRESS_LOOKUP_MIN)
    .required(ErrorMessages.ADDRESS_LOOKUP_REQUIRED),

  streetAddress: Yup.string()
    .trim()
    .min(4, ErrorMessages.STREET_MIN)
    .required(ErrorMessages.STREET_REQUIRED),

  aptUnitSuite: Yup.string().trim().optional(),

  city: Yup.string()
    .trim()
    .min(4, ErrorMessages.CITY_MIN)
    .matches(/^[A-Za-z\s]+$/, ErrorMessages.INVALID_NAME)
    .required(ErrorMessages.CITY_REQUIRED),

  postalCode: Yup.string()
    .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
    .required(ErrorMessages.POSTAL_CODE_REQUIRED),

  provinceOfResidence: Yup.string().optional(),

  organizationWebsite: Yup.string().trim().url(ErrorMessages.INVALID_URL).optional(),
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

const nameValidation = Yup.string()
  .trim()
  .matches(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
  .min(1, ErrorMessages.NAME_REQUIRED)
  .max(100, ErrorMessages.NAME_TOO_LONG);

// Step2
export const OfficeDetailsSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required(ErrorMessages.FIRST_NAME_REQUIRED)
    .min(4, ErrorMessages.FIRST_NAME_MIN)
    .matches(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  lastName: Yup.string()
    .trim()
    .required(ErrorMessages.LAST_NAME_REQUIRED)
    .min(4, ErrorMessages.LAST_NAME_MIN)
    .matches(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  phoneNumber: Yup.string()
    .required(ErrorMessages.PHONE_REQUIRED)
    .test('is-valid-ca-phone', ErrorMessages.INVALID_PHONE_NUMBER, value =>
      validateCanadianPhoneNumber(value)
    ),

  officialEmailAddress: Yup.string()
    .email(ErrorMessages.INVALID_EMAIL)
    .required(ErrorMessages.EMAIL_REQUIRED),

  jobTitle: Yup.string()
    .trim()
    .required(ErrorMessages.JOB_TITLE_REQUIRED)
    .min(2, ErrorMessages.JOB_TITLE_MIN)
    .matches(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.JOB_TITLE_INVALID),

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
    .matches(/[!@#$%^&*(),.?":{}|<>-]/, ErrorMessages.PASSWORD_SPECIAL)
    .required(ErrorMessages.PASSWORD_REQUIRED),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], ErrorMessages.PASSWORD_CONFIRM)
    .required(ErrorMessages.PASSWORD_CONFIRM_REQUIRED),
});

export const PasswordInitialValues = {
  password: '',
  confirmPassword: '',
};
