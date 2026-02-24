import { Metadata } from 'next';
import ForgotPasswordForm from '@/domains/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | Thrive - Examiner',
  description: 'Reset your password',
};

const ForgotPasswordPage = () => {
  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center overflow-hidden bg-[#F4FBFF] px-6">
      <div
        className="w-full max-w-[520px] rounded-[24px] bg-white px-6 py-8 shadow-[0px_10px_40px_rgba(0,0,0,0.07)] md:px-10"
        style={{ border: '1px solid #E3F2FD' }}
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-[32px]">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-500 md:text-base">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
