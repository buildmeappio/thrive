import ErrorMessages from '@/constants/ErrorMessages';
import { validateCanadianPhoneNumber } from '@/utils/formatNumbers';
import {
  validateFieldByLabel,
  containsOnlySpecialChars,
  getFieldValidationPattern,
} from '@/utils/fieldValidation';
import * as Yup from 'yup';

// Step1
export const OrganizationInfoSchema = Yup.object({
  organizationType: Yup.string().required(ErrorMessages.ORGANIZATION_TYPE_REQUIRED),

  organizationName: Yup.string()
    .trim()
    .required(ErrorMessages.ORGANIZATION_NAME_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(6, ErrorMessages.ORGANIZATION_NAME_MIN)
    .test('no-special-chars-only', ErrorMessages.ORGANIZATION_NAME_INVALID, value => {
      if (!value) return true;
      return !containsOnlySpecialChars(value);
    })
    .test('valid-format', ErrorMessages.ORGANIZATION_NAME_INVALID, value => {
      if (!value) return true;
      const pattern = getFieldValidationPattern('organizationName');
      return pattern ? pattern.test(value.trim()) : true;
    }),

  addressLookup: Yup.string()
    .required(ErrorMessages.ADDRESS_LOOKUP_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(5, ErrorMessages.ADDRESS_LOOKUP_MIN)
    .test('no-special-chars-only', ErrorMessages.ADDRESS_LOOKUP_INVALID_CHARS, value => {
      if (!value) return true;
      return !containsOnlySpecialChars(value);
    })
    .test('valid-format', ErrorMessages.ADDRESS_LOOKUP_INVALID_CHARS, value => {
      if (!value) return true;
      const pattern = getFieldValidationPattern('addressLookup');
      return pattern ? pattern.test(value.trim()) : true;
    }),

  streetAddress: Yup.string()
    .trim()
    .required(ErrorMessages.STREET_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(4, ErrorMessages.STREET_MIN)
    .test('no-special-chars-only', ErrorMessages.STREET_ADDRESS_INVALID, value => {
      if (!value) return true;
      return !containsOnlySpecialChars(value);
    })
    .test('valid-format', ErrorMessages.STREET_ADDRESS_INVALID, value => {
      if (!value) return true;
      const pattern = getFieldValidationPattern('streetAddress');
      return pattern ? pattern.test(value.trim()) : true;
    }),

  aptUnitSuite: Yup.string().trim().optional(),

  city: Yup.string()
    .trim()
    .required(ErrorMessages.CITY_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(4, ErrorMessages.CITY_MIN)
    .test('no-special-chars-only', ErrorMessages.CITY_INVALID_CHARS, value => {
      if (!value) return true;
      return !containsOnlySpecialChars(value);
    })
    .test('valid-format', ErrorMessages.CITY_INVALID_CHARS, value => {
      if (!value) return true;
      const pattern = getFieldValidationPattern('city');
      return pattern ? pattern.test(value.trim()) : true;
    }),

  postalCode: Yup.string()
    .trim()
    .required(ErrorMessages.POSTAL_CODE_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE),

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
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(4, ErrorMessages.FIRST_NAME_MIN)
    .matches(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  lastName: Yup.string()
    .trim()
    .required(ErrorMessages.LAST_NAME_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
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
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(2, ErrorMessages.JOB_TITLE_MIN)
    .test('no-special-chars-only', ErrorMessages.JOB_TITLE_INVALID, value => {
      if (!value) return true;
      return !containsOnlySpecialChars(value);
    })
    .test('valid-format', ErrorMessages.JOB_TITLE_INVALID, value => {
      if (!value) return true;
      const pattern = getFieldValidationPattern('jobTitle');
      return pattern ? pattern.test(value.trim()) : true;
    }),

  department: Yup.string()
    .trim()
    .required(ErrorMessages.DEPARTMENT_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .test('no-special-chars-only', ErrorMessages.DEPARTMENT_INVALID_CHARS, value => {
      if (!value) return true;
      return !containsOnlySpecialChars(value);
    })
    .test('valid-format', ErrorMessages.DEPARTMENT_INVALID_CHARS, value => {
      if (!value) return true;
      const pattern = getFieldValidationPattern('department');
      return pattern ? pattern.test(value.trim()) : true;
    }),
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
