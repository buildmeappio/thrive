"use client";

type ContractSentStepProps = {
  examinerEmail: string;
};

export default function ContractSentStep({
  examinerEmail,
}: ContractSentStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[#1A1A1A] font-poppins">
          Contract sent successfully!
        </p>
        <p className="text-sm text-[#7A7A7A] font-poppins mt-2">
          The contract has been sent to {examinerEmail}
        </p>
      </div>
    </div>
  );
}
