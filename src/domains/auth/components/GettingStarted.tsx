'use client';
import Image from '@/components/Image';
import { ArrowRight, Check } from 'lucide-react';
import { OrganizationFeatures } from '@/config/GettingStartedFeatures';
import { URLS } from '@/constants/routes';
import { createImagePath } from '@/utils/createImagePath';
import useRouter from '@/hooks/useRouter';

const GettingStarted: React.FC = () => {
  const router = useRouter();
  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(URLS.REGISTER);
  };
  return (
    <div className="flex min-h-[calc(100vh-97px)] flex-col bg-[#FAFAFF] md:flex-row">
      <div className="mt-8 flex-shrink-0 px-6 md:mt-16 md:w-[60%] md:px-0 md:pl-20">
        <div className="space-y-6">
          <div className="md:leading[150%] w-full text-[30px] leading-[100%] font-semibold tracking-[-0.03em] md:max-w-[660px] md:text-[50.86px]">
            <h1 className="">Independent Medical</h1>
            <h2 className="">
              Examinations for{' '}
              <span
                className=""
                style={{
                  color: '#000080',
                }}
              >
                Organization
              </span>
            </h2>
            <p className="mt-4 font-[Poppins] text-[19.57px] leading-[130%] font-normal tracking-[-0.02em] text-[#636363]">
              Thrive helps insurance companies, government agencies, & regulatory bodies manage
              independent medical examinations with speed, accuracy, and total transparency — all
              from one secure platform.
            </p>
          </div>
          <form onSubmit={handleGetStarted}>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-center font-[Poppins] text-[12px] leading-[100%] font-medium tracking-[-0.02em] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg md:text-[18.54px]"
              style={{
                background: 'linear-gradient(90deg, #000080 0%, #5151B9 100%)',
              }}
            >
              Let&apos;s Get Started
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </form>
        </div>

        <div className="relative -mx-12 mt-8 mb-8 md:hidden">
          <Image
            src={createImagePath('org-gettingStarted.png')}
            alt="Organization Dashboard Preview"
            width={400}
            height={400}
            className="h-[400px] w-full rounded-lg px-4"
          />
        </div>

        <div className="mt-8 space-y-4 md:mt-10">
          <h3 className="font-[Poppins] text-[20px] leading-[39.99px] font-semibold tracking-[-0.03em] md:text-[20.11px]">
            Fully Compliant & Confidential
          </h3>
          <ul className="space-y-3 pb-4">
            {OrganizationFeatures.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Check
                  size={13}
                  strokeWidth={5}
                  className="mt-1 flex-shrink-0"
                  style={{ color: '#000080' }}
                />
                <span className="flex-1 font-[Poppins] text-[14.48px] leading-[12px] font-light tracking-[-0.01em] text-[#333333]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mt-16 hidden flex-1 overflow-hidden md:block">
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
  );
};

export default GettingStarted;
