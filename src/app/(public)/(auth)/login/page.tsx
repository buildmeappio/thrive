import { LoginForm } from '@/domains/auth';
import { type Metadata } from 'next';
import Image from '@/components/Image';
import { createImagePath } from '@/utils/createImagePath';

export const metadata: Metadata = {
  title: 'Login | Thrive',
  description: 'Login yourself on Thrive',
};

const LoginPage = () => {
  return (
    <div className="bg-[#F2F5F6]">
      <div className="flex flex-col justify-between md:min-h-[calc(100vh-77px)] md:flex-row">
        <div className="flex flex-1 flex-col justify-center px-6 md:px-0 md:pl-30">
          <h1 className="mb-4 text-[68.35px] leading-[100%] font-semibold tracking-[-0.02em]">
            Welcome To <span>Thrive</span>{' '}
          </h1>
          <div className="w-full rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs md:max-w-[515px]">
            <h2 className="mb-6 font-[Poppins] text-[20px] leading-[100%] font-medium tracking-[0em] md:text-[29.99px]">
              Log In
            </h2>
            <LoginForm />
          </div>
        </div>

        <div className="relative hidden flex-1 overflow-hidden md:block">
          <div className="absolute inset-0">
            <Image
              src={createImagePath('org-gettingStarted.png')}
              alt="Organization Dashboard Preview"
              width={200}
              height={200}
              className="h-[680px] w-[800px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
