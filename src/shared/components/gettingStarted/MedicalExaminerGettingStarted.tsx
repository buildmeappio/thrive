'use client';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { MedicalExaminerFeatures } from '@/shared/config/GettingStartedFeatures.config';
import { useRouter } from 'next/navigation';

export const MedicalExaminerGettingStarted: React.FC = () => {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push('/register/medicalExaminer');
  };
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] md:flex-row">
      <div className="mt-8 flex-shrink-0 px-6 md:mt-16 md:w-[60%] md:px-0 md:pl-20">
        <div className="space-y-6">
          <div className="">
            <h1 className="text-[24px] font-semibold text-gray-900 md:text-[30px]">
              Join Thrive as an Independent
            </h1>
            <h2 className="text-[40px] font-bold md:text-[60px]" style={{ color: '#00A8FF' }}>
              Medical Examiner
            </h2>
            <p className="text-[18px] text-[#636363] md:text-[22px]">
              Trusted by 100+ Canadian insurers and legal <br className="hidden md:block" />
              teams for expert medical evaluations.
            </p>
          </div>
          <button
            onClick={handleGetStarted}
            className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: 'linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)',
            }}
          >
            Let's Get Started
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="relative -mx-6 mt-8 mb-8 md:hidden">
          <Image
            src="/images/doctor-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={350}
            height={350}
            className="h-auto w-full rounded-lg object-cover"
          />
        </div>
        <div className="mt-8 space-y-4 md:mt-10">
          <h3 className="text-lg font-semibold text-[#000000]">Fully Compliant & Confidential</h3>
          <ul className="space-y-3 pb-4">
            {MedicalExaminerFeatures.map((feature, index) => (
              <li key={index} className="flex items-center space-x-1">
                <Check size={13} strokeWidth={5} style={{ color: '#00A8FF' }} />
                <span className="text-xs leading-relaxed text-[#333333] md:text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative mt-16 hidden flex-1 overflow-hidden md:block">
        <div className="absolute inset-0">
          <Image
            src="/images/doctor-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={200}
            height={200}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};
