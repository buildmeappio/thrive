import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export interface ContinueButtonProps {
  isLastStep?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({
  isLastStep,
  gradientFrom = "#89D7FF",
  gradientTo = "#00A8FF",
  onClick,
  loading,
  disabled,
}) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="flex h-[40px] w-[140px] cursor-pointer items-center justify-center gap-1 rounded-[34px] px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out hover:opacity-90 md:h-[45px] md:w-[182px] md:gap-1.5 md:px-4 md:py-3 md:text-base"
      style={{
        backgroundImage: `linear-gradient(to left, ${gradientFrom}, ${gradientTo})`,
      }}
      disabled={disabled}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <span className="transition-all duration-300 ease-in-out">
            {isLastStep ? "Submit" : "Continue"}
          </span>
          <ArrowRight className="cup ml-1 h-3.5 w-3.5 text-white transition-all duration-300 ease-in-out md:ml-2 md:h-4 md:w-4" />
        </>
      )}
    </button>
  );
};

export default ContinueButton;
