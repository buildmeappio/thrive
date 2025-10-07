import ResetPassword from '@/domains/auth/components/ForgetPassword/ResetPassword';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Thrive',
  description: 'Reset your password - Thrive',
};

const Page = () => {
  return <ResetPassword />;
};
export default Page;
