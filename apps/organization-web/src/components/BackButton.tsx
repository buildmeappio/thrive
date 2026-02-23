import React from 'react';
import { ArrowLeft } from 'lucide-react';

export type BackButtonProps = {
  disabled?: boolean;
  borderColor?: string;
  iconColor?: string;
  onClick?: () => void;
  isSubmitting: boolean;
};

const BackButton: React.FC<BackButtonProps> = ({
  disabled = false,
  borderColor = '#000080',
  iconColor = '#000080',
  onClick,
  isSubmitting,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSubmitting}
      className={`flex h-[35px] w-[120px] items-center justify-center rounded-[34px] border px-4 py-3 transition-all duration-300 ease-in-out md:h-[45px] md:w-[165px] md:gap-1.5 ${
        isSubmitting
          ? 'cursor-not-allowed bg-transparent text-[#555555]'
          : 'cursor-pointer hover:opacity-90'
      }`}
      style={{
        borderColor: borderColor,
        backgroundColor: 'transparent',
      }}
    >
      <ArrowLeft
        className="mr-2 h-4 w-4 transition-colors duration-300 ease-in-out"
        style={{ color: disabled ? '#555555' : iconColor }}
      />
      <span className="transition-all duration-300 ease-in-out">Back</span>
    </button>
  );
};

export default BackButton;
