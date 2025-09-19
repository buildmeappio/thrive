import React, { useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  title?: string;          // default: "Reject Examiner"
  placeholder?: string;    // default: "Type reason"
  maxLength?: number;      // default: 200
  initialValue?: string;
};

export default function RejectModal({
  open,
  onClose,
  onSubmit,
  title = "Reject Examiner",
  placeholder = "Type reason",
  maxLength = 200,
  initialValue = "",
}: Props) {
  const [value, setValue] = useState(initialValue);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => textRef.current?.focus(), 0);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
  };

  if (!open) return null;

  const canSend = value.trim().length > 0 && value.length <= maxLength;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={onBackdrop}
    >
      <div
        ref={panelRef}
        className="
          relative w-full max-w-[769px]
          rounded-2xl sm:rounded-[43px]
          bg-white
          p-5 sm:px-[40px] sm:py-[37px]
          shadow-[0_4px_134.6px_0_#00000030]
          max-h-[calc(100vh-1.5rem)] sm:max-h-[85vh]
          overflow-y-auto
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#930000] focus:outline-none focus:ring-2 focus:ring-[#930000]/40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
            <path
              fill="currentColor"
              d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12.03l4.9 4.87a1 1 0 0 0 1.4-1.4l-4.9-4.87 4.9-4.93Z"
            />
          </svg>
        </button>

        {/* Title */}
        <h2
          id={titleId}
          className="font-[600] text-2xl sm:text-[35.39px] leading-[1] tracking-[-0.03em] text-[#930000] font-degular pr-10"
        >
          {title}
        </h2>

        {/* Label */}
        <label
          htmlFor="reject-text"
          className="mt-4 sm:mt-5 block font-[500] text-base sm:text-[20px] leading-[1] tracking-[-0.03em] text-[#464646] font-poppins"
        >
          Write Reason Here
        </label>

        {/* Textarea */}
        <div className="mt-2">
          <textarea
            id="reject-text"
            ref={textRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength * 3}
            className="
              h-36 sm:h-[158px] w-full resize-none
              rounded-xl sm:rounded-[20px]
              border border-[#F0F0F0] bg-[#F6F6F6]
              p-3 sm:p-4 outline-none
              placeholder:font-[400] placeholder:text-[14px] sm:placeholder:text-[16px]
              placeholder:leading-[1] placeholder:tracking-[-0.03em] placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[16px]
            "
            placeholder={placeholder}
          />
          <div className="mt-2 text-right font-inter text-sm sm:text-[15.67px] tracking-[0.5%] text-[#554B4B]/80">
            {Math.min(value.length, maxLength)}/{maxLength}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 sm:mt-5 flex justify-end">
          <button
            type="button"
            disabled={!canSend}
            onClick={() => onSubmit(value.trim())}
            className="
              h-10 sm:h-[41px]
              rounded-full
              bg-[#8B0000] px-5 sm:px-6 text-white
              transition-opacity
              disabled:cursor-not-allowed disabled:opacity-50
              font-poppins text-[14px] sm:text-[15.75px] tracking-[-0.03em]
            "
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
