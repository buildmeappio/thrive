import ErrorMessages from '@/constants/ErrorMessages';
import * as Yup from 'yup';
export const loginSchema = Yup.object({
  email: Yup.string().email(ErrorMessages.INVALID_EMAIL).required(ErrorMessages.EMAIL_REQUIRED),
  password: Yup.string().required(ErrorMessages.PASSWORD_REQUIRED),
});

export const loginInitialValues = {
  email: '',
  password: '',
};
