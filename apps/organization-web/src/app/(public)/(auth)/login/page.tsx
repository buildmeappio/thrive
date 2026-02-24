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
      <div className="flex flex-col justify-between md:min-h-[calc(100vh-13vh)] md:flex-row">
        <div className="md:pl-30 flex flex-1 flex-col justify-center px-6 md:px-0">
          <h1 className="mb-8 mt-4 text-[40px] font-semibold leading-[100%] tracking-[-0.02em] md:mt-0 md:text-[64.35px]">
            Welcome To <span className="text-[#140047]">Thrive</span>{' '}
          </h1>
          <div className="shadow-xs w-full rounded-xl border-[#E9EDEE] bg-white p-6 md:max-w-[515px]">
            <h2 className="font-poppins mb-6 text-[20px] font-medium leading-[100%] tracking-[0em] md:text-[29.99px]">
              Log In
            </h2>
            <LoginForm />
          </div>
        </div>

        <div className="relative hidden flex-1 overflow-hidden md:flex md:items-end">
          <div className="w-full">
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
