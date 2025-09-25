import { LoginForm } from '@/domains/auth';
import { type Metadata } from 'next';
import Image from '@/components/Image';

export const metadata: Metadata = {
  title: 'Login | Thrive',
  description: 'Login yourself on Thrive',
};

const LoginPage = () => {
  return (
    <div className="bg-[#F2F5F6] pt-10">
      <div className="flex flex-col justify-between md:min-h-screen md:flex-row">
        <div className="flex flex-1 flex-col justify-center px-6 md:px-0 md:pl-30">
          <h1 className="mb-4 text-center text-3xl font-bold md:text-left md:text-[44px]">
            Welcome To <span>Thrive</span>{' '}
          </h1>
          <div className="w-full rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs md:w-[445px]">
            <h2 className="mb-6 text-[30px] font-semibold">Log In</h2>
            <LoginForm />
          </div>
        </div>

        <div className="relative hidden flex-1 overflow-hidden md:block">
          <div className="absolute inset-0">
            <Image
              src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/org-gettingStarted.png"
              alt="Organization Dashboard Preview"
              width={200}
              height={200}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
