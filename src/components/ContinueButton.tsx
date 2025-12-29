import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export type ContinueButtonProps = {
  isLastStep?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  color?: string;
  disabled?: boolean;
  isSubmitting: boolean;
  onClick?: () => void;
};

const ContinueButton: React.FC<ContinueButtonProps> = ({
  isLastStep,
  gradientFrom = '#89D7FF',
  gradientTo = '#00A8FF',
  color,
  onClick,
  disabled,
  isSubmitting,
}) => {
  const backgroundStyle = color
    ? { backgroundColor: color }
    : { backgroundImage: `linear-gradient(to left, ${gradientFrom}, ${gradientTo})` };

  return (
    <button
      type="submit"
      onClick={onClick}
      className={`flex h-[35px] w-[120px] items-center justify-center rounded-[34px] px-4 py-3 text-white transition-all duration-300 ease-in-out md:h-[45px] md:w-[182px] md:gap-1.5 ${
        disabled || isSubmitting
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:opacity-90'
      }`}
      style={backgroundStyle}
      disabled={disabled || isSubmitting}
    >
      <span className="transition-all duration-300 ease-in-out">
        {isLastStep ? 'Submit' : 'Continue'}
      </span>
      {isSubmitting ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
      ) : (
        <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
      )}
    </button>
  );
};

export default ContinueButton;
