import ForgetPassword from '@/domains/auth/components/ForgetPassword/ForgetPassword';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forget Password | Thrive',
  description: 'Forget password - Thrive',
};
const Page = () => {
  return <ForgetPassword />;
};
export default Page;
