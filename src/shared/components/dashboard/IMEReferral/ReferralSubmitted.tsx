'use client';
import React from 'react';
import { Button } from '@/shared/components/ui/button';

const ReferralSubmitted: React.FC = () => {
  const handleGoToDashboard = () => {
    // Navigate to dashboard logic here
    console.log('Navigating to dashboard...');
  };

  return (
    <div className="rounded-4xl bg-[#FFFFFF] p-6 sm:p-12 md:p-20 lg:p-25">
      <div className="flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="mb-4 sm:mb-6">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#000093]">
            <svg
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white"
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
        <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-gray-900 px-2">
          Referral successfully submitted.
        </h1>

        {/* Case Information */}
        <p className="mb-6 sm:mb-8 text-base sm:text-lg md:text-[20px] leading-relaxed text-gray-600 px-4">
          Your Case ID is <span className="text-[#000093]">#123456</span> You will be notified once the
          <span className="block sm:inline"> claimant's appointment is scheduled.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex w-full flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 mt-8 sm:mt-12 px-2">
          <Button
            variant="outline"
            onClick={handleGoToDashboard}
            className="flex items-center justify-center rounded-full border-[#000093] bg-white px-6 sm:px-8 md:px-10 py-2 text-gray-600 whitespace-nowrap hover:bg-gray-50 w-full sm:w-auto"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go to Dashboard
          </Button>

          <Button
            onClick={handleGoToDashboard}
            className="flex items-center justify-center rounded-full bg-[#000093] px-6 sm:px-8 md:px-10 py-2 text-white hover:bg-blue-700 whitespace-nowrap w-full sm:w-auto"
          >
            Go to Dashboard
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralSubmitted;