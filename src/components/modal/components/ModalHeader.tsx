"use client";

import type { ContractModalStep } from "../types/createContractModal.types";

type ModalHeaderProps = {
  step: ContractModalStep;
  titleId: string;
  isResend: boolean;
  onClose: () => void;
};

const STEP_TITLES: Record<ContractModalStep, string> = {
  1: "Send Contract",
  2: "Fee Details",
  3: "Contract Details",
  4: "Preview Contract",
  5: "Contract Sent",
};

export default function ModalHeader({
  step,
  titleId,
  isResend,
  onClose,
}: ModalHeaderProps) {
  const getStepTitle = () => {
    if (step === 1 && isResend) {
      return "Resend Contract";
    }
    return STEP_TITLES[step];
  };

  return (
    <div className="relative flex-shrink-0 p-5 sm:px-[45px] sm:pt-[40px] pb-4 border-b border-gray-200">
      {/* Close Button */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#000093] focus:outline-none focus:ring-2 focus:ring-[#000093]/40"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className="text-white"
        >
          <path
            fill="currentColor"
            d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12.03l4.9 4.87a1 1 0 0 0 1.4-1.4l-4.9-4.87 4.9-4.93Z"
          />
        </svg>
      </button>

      {/* Title */}
      <h2
        id={titleId}
        className="font-[600] text-xl sm:text-[28px] leading-[1.2] tracking-[-0.02em] text-[#1A1A1A] font-degular pr-10"
      >
        {getStepTitle()}
      </h2>

      {/* Step Indicator */}
      {step < 5 && (
        <div className="flex items-center gap-2 mt-2">
          {([1, 2, 3, 4] as const).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-6 bg-[#000080]"
                  : s < step
                    ? "w-3 bg-[#000080]/50"
                    : "w-3 bg-[#E5E5E5]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
