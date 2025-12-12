import React from "react";
import { Save, Loader2 } from "lucide-react";

export interface SaveAndContinueButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const SaveAndContinueButton: React.FC<SaveAndContinueButtonProps> = ({
  onClick,
  loading,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[40px] w-[180px] cursor-pointer items-center justify-center gap-2 rounded-[34px] border border-[#00A8FF] bg-transparent px-3 py-2 text-sm text-[#00A8FF] transition-all duration-300 ease-in-out hover:bg-[#00A8FF]/10 md:h-[45px] md:w-[220px] md:px-4 md:py-3 md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>Save & Continue Later</span>
        </>
      )}
    </button>
  );
};

export default SaveAndContinueButton;
