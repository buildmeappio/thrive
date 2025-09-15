import * as Yup from 'yup';
export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const loginInitialValues = {
  email: '',
  password: '',
};
