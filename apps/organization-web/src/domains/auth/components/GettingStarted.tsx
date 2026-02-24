import Image from '@/components/Image';
import { ArrowRight, Check } from 'lucide-react';
import { OrganizationFeatures } from '@/config/GettingStartedFeatures';
import { createImagePath } from '@/utils/createImagePath';
import { URLS } from '@/constants/routes';
import { redirect } from 'next/navigation';

const GettingStarted: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-13vh)] flex-col bg-[#FAFAFF] md:flex-row">
      <div className="mt-8 flex-shrink-0 px-6 md:mt-20 md:w-[55%] md:px-0 md:pl-20">
        <div className="space-y-8">
          <div className="md:leading[150%] w-full text-[30px] font-semibold leading-[100%] tracking-[-0.03em] md:max-w-[660px] md:text-[50.86px]">
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
            <p className="font-poppins mt-4 text-[19.57px] font-normal leading-[130%] tracking-[-0.02em] text-[#636363]">
              Thrive helps insurance companies, government agencies, & regulatory bodies manage
              independent medical examinations with speed, accuracy, and total transparency — all
              from one secure platform.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <form
              action={async () => {
                'use server';
                redirect(URLS.REGISTER);
              }}
            >
              <button
                className="font-poppins flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-center text-[12px] font-medium leading-[100%] tracking-[-0.02em] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg md:text-[18.54px]"
                style={{
                  background: 'linear-gradient(90deg, #000080 0%, #5151B9 100%)',
                }}
              >
                Let&apos;s Get Started
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            </form>

            <form
              action={async () => {
                'use server';
                redirect('/login');
              }}
            >
              <button
                className="font-poppins relative flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-center text-[12px] font-medium leading-[110%] tracking-[-0.01em] transition-all duration-300 hover:scale-105 hover:shadow-lg md:text-[18.54px]"
                style={{
                  background: 'white',
                  border: '2px solid transparent',
                  backgroundImage:
                    'linear-gradient(white, white), linear-gradient(90deg, #000080 0%, #5151B9 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <span
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #000080 0%, #5151B9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Login
                </span>
                <ArrowRight size={20} strokeWidth={3} style={{ color: '#000080' }} />
              </button>
            </form>
          </div>
        </div>

        <div className="relative -mx-12 mb-8 mt-8 md:hidden">
          <Image
            src={createImagePath('org-gettingStarted.png')}
            alt="Organization Dashboard Preview"
            width={400}
            height={400}
            className="h-[400px] w-full rounded-lg px-4"
          />
        </div>

        <div className="mt-8 space-y-4 md:mt-10">
          <h3 className="font-poppins text-[20px] font-semibold leading-[39.99px] tracking-[-0.03em] md:text-[20.11px]">
            Fully Compliant & Confidential
          </h3>
          <ul className="space-y-3 pb-4">
            {OrganizationFeatures.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3 space-y-2">
                <Check
                  size={13}
                  strokeWidth={5}
                  className="flex-shrink-0"
                  style={{ color: '#000080' }}
                />
                <span className="font-poppins flex-1 text-[14.48px] font-light leading-[16px] tracking-[-0.01em] text-[#333333]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mt-16 hidden flex-1 overflow-hidden md:flex md:items-end">
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
  );
};

export default GettingStarted;
