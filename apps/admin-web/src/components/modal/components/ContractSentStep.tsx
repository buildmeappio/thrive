'use client';

type ContractSentStepProps = {
  examinerEmail: string;
};

export default function ContractSentStep({ examinerEmail }: ContractSentStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-poppins text-lg font-semibold text-[#1A1A1A]">
          Contract sent successfully!
        </p>
        <p className="font-poppins mt-2 text-sm text-[#7A7A7A]">
          The contract has been sent to {examinerEmail}
        </p>
      </div>
    </div>
  );
}
