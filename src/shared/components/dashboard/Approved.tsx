'use client';
import { Button } from '@/shared/components/ui';
import { useRouter } from 'next/navigation';

const Approved = () => {
  const router = useRouter();

  return (
    <div className="min-h-[385px] w-full max-w-[725px] rounded-[25px] bg-white px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <h1 className="mb-2 text-xl font-semibold tracking-[-0.01em] text-[#000093] sm:text-2xl lg:text-[30px]">
        Congratulations!
      </h1>
      <p className="mb-6 text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base lg:text-[16px]">
        Your organization account is now fully active.
      </p>

      <div className="mb-8 space-y-3">
        <div className="flex items-start space-x-3">
          <span className="text-lg">✚</span>
          <span className="text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base lg:text-[16px]">
            Create a new IME request
          </span>
        </div>

        <div className="flex items-start space-x-3">
          <span className="text-lg">🔍</span>
          <span className="text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base lg:text-[16px]">
            Get matched with the right medical expert using our AI-powered engine
          </span>
        </div>

        <div className="flex items-start space-x-3">
          <span className="text-lg">📄</span>
          <span className="text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base lg:text-[16px]">
            Upload documents and track all your active cases in real time
          </span>
        </div>

        <div className="flex items-start space-x-3">
          <span className="text-lg">📊</span>
          <span className="text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base lg:text-[16px]">
            Access reports, invoices, and case history — all in one place
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium tracking-[-0.03em] text-[#000000] sm:text-base lg:text-[16px]">
          Let's get your first independent medical examination started.
        </p>
        <Button
          onClick={() => router.push('/dashboard/ime-referral')}
          className="w-fit rounded-full bg-[#000093] px-6 py-2 text-xs font-medium tracking-[-0.03em] text-[#ffffff] hover:bg-[#000093] sm:px-8 sm:text-sm lg:px-12 lg:text-[11px]"
        >
          ✚ New IME Referral
        </Button>
      </div>
    </div>
  );
};
export default Approved;
