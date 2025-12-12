import React from "react";
import { ArrowLeft } from "lucide-react";

export interface BackButtonProps {
  disabled?: boolean;
  borderColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  disabled = false,
  borderColor = "#00A8FF",
  iconColor = "#00A8FF",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[40px] w-[130px] items-center justify-center gap-1 rounded-[34px] border px-3 py-2 text-sm transition-all duration-300 ease-in-out md:h-[45px] md:w-[165px] md:gap-1.5 md:px-4 md:py-3 md:text-base ${
        disabled
          ? "cursor-not-allowed bg-transparent text-[#555555]"
          : "cursor-pointer hover:opacity-90"
      }`}
      style={{
        borderColor: borderColor,
        backgroundColor: "transparent",
      }}
    >
      <ArrowLeft
        className="h-3.5 w-3.5 transition-colors duration-300 ease-in-out md:mr-2 md:h-4 md:w-4"
        style={{ color: disabled ? "#555555" : iconColor }}
      />
      <span className="transition-all duration-300 ease-in-out">Back</span>
    </button>
  );
};

export default BackButton;
