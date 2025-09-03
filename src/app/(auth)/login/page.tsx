import LoginForm from '@/shared/components/Login';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Thrive',
  description: 'Login yourself on Thrive',
};

const LoginPage = () => {
  return <LoginForm />;
};
export default LoginPage;
