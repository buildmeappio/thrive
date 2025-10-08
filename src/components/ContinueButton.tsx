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
      className="flex h-[45px] w-[182px] cursor-pointer items-center justify-center gap-1.5 rounded-[34px] px-4 py-3 text-white transition-all duration-300 ease-in-out hover:opacity-90"
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
          <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
        </>
      )}
    </button>
  );
};

export default ContinueButton;
