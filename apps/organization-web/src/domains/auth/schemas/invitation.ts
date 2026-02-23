import ErrorMessages from '@/constants/ErrorMessages';
import { validateCanadianPhoneNumber } from '@/utils/formatNumbers';
import {
  validateFieldByLabel,
  containsOnlySpecialChars,
  getFieldValidationPattern,
} from '@/utils/fieldValidation';
import * as Yup from 'yup';

// Personal Info Schema for Invitation (without email)
export const PersonalInfoSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required(ErrorMessages.FIRST_NAME_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(2, ErrorMessages.FIRST_NAME_MIN)
    .matches(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  lastName: Yup.string()
    .trim()
    .required(ErrorMessages.LAST_NAME_REQUIRED)
    .test('not-only-spaces', ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES, value => {
      return value ? value.trim().length > 0 : false;
    })
    .min(2, ErrorMessages.LAST_NAME_MIN)
    .matches(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  phoneNumber: Yup.string()
    .required(ErrorMessages.PHONE_REQUIRED)
    .test('is-valid-ca-phone', ErrorMessages.INVALID_PHONE_NUMBER, value =>
      validateCanadianPhoneNumber(value)
    ),

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

export const PersonalInfoInitialValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  department: '',
};
