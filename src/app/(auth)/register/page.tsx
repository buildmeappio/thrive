import RegisterForm from '@/shared/components/Register';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Thrive',
  description: 'Register yourself on Thrive',
};

const RegisterPage = () => {
  return <RegisterForm />;
};
export default RegisterPage;
