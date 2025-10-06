'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';
import { ArrowRight } from 'lucide-react';

const ReferralSubmitted: React.FC = () => {
  const router = useRouter();

  return (
    <div className="rounded-4xl bg-[#FFFFFF] p-6 sm:p-12 md:p-20 lg:p-25">
      <div className="flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="mb-4 sm:mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#000093] sm:h-14 sm:w-14 md:h-16 md:w-16">
            <svg
              className="h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="mb-3 px-2 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl lg:text-[40px]">
          Referral successfully submitted.
        </h1>

        {/* Case Information */}
        <p className="mb-6 px-4 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg md:text-[20px]">
          You will be notified once the
          <span className="block sm:inline"> claimant's appointment is scheduled.</span>
        </p>

        {/* Action Button */}
        <div className="mt-8 flex w-full justify-center px-2 sm:mt-12">
          <Button
            variant="outline"
            onClick={() => router.push(URLS.DASHBOARD)}
            className="flex h-[45px] w-[200px] items-center justify-center rounded-full bg-[#000093] text-[14px] whitespace-nowrap text-[#FFFFFF] hover:bg-[#000093] sm:w-auto sm:px-8 md:px-10"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-6 text-[#FFFFFF]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralSubmitted;
