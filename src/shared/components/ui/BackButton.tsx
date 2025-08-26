import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { BackButtonProps } from '~/types';

const BackButton: React.FC<BackButtonProps> = ({
  disabled = false,
  borderColor = '#00A8FF',
  iconColor = '#00A8FF',
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[45px] w-[165px] items-center justify-center gap-1.5 rounded-[34px] border px-4 py-3 transition-all duration-300 ease-in-out ${
        disabled
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
