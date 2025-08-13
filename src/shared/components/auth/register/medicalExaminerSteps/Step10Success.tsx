'use client';
import { ArrowRight, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export const Step10Success: React.FC<{ onNext: () => void }> = ({ onNext: _onNext }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push('/login/medicalExaminer');
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col items-center justify-center p-6 text-center md:max-w-lg md:p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00A8FF]">
          <Smile className="h-8 w-8 text-white" strokeWidth={2} />
        </div>

        <h3 className="mb-4 text-2xl font-semibold text-gray-900 md:text-4xl">Success!</h3>

        <p className="mb-6 w-full text-center text-sm leading-relaxed text-gray-600 opacity-100 md:h-[64px] md:w-[675px]">
          Your account has been successfully created. You can log in to view and manage your
          profile, documents, and upcoming IMEs.
        </p>

        <button
          onClick={handleClick}
          className="mx-auto flex h-[40px] w-full max-w-[280px] cursor-pointer items-center justify-center gap-2 rounded-[33px] bg-[#00A8FF] p-4 font-medium text-white transition-colors duration-200 hover:bg-[#0088cc]"
        >
          Continue
          <ArrowRight
            color="white"
            className="h-4 w-4 transition-all duration-300 ease-in-out"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
};
