// components/RequestInfoModal.tsx
import React, { useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (internalNotes: string, messageToExaminer: string) => void;
  title?: string;
  maxLength?: number;
};

export default function RequestInfoModal({
  open,
  onClose,
  onSubmit,
  title = "Request More Info",
  maxLength = 200,
}: Props) {
  const [internalNotes, setInternalNotes] = useState("");
  const [messageToExaminer, setMessageToExaminer] = useState("");
  const [documentsRequired, setDocumentsRequired] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstTextRef.current?.focus(), 0);
    // lock body scroll on mobile
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

  const canSend = messageToExaminer.trim().length > 0 && messageToExaminer.length <= maxLength;

  const handleSubmit = () => {
    if (canSend) {
      onSubmit(internalNotes.trim(), messageToExaminer.trim());
      // Reset form
      setInternalNotes("");
      setMessageToExaminer("");
      setDocumentsRequired(false);
    }
  };

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
          relative w-full max-w-[650px]
          rounded-2xl sm:rounded-[30px]
          bg-white
          p-5 sm:px-[45px] sm:py-[40px]
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
          className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#000093] focus:outline-none focus:ring-2 focus:ring-[#000093]/40"
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
          className="font-[600] text-xl sm:text-[28px] leading-[1.2] tracking-[-0.02em] text-[#000093] font-degular pr-10"
        >
          {title}
        </h2>

        {/* Internal Notes Field */}
        <div className="mt-5">
          <label
            htmlFor="internal-notes"
            className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
          >
            Internal Notes
          </label>
          <textarea
            id="internal-notes"
            ref={firstTextRef}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            maxLength={maxLength}
            className="
              h-28 sm:h-[120px] w-full resize-none
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#F6F6F6]
              p-3 sm:p-4 outline-none
              placeholder:font-[400] placeholder:text-[14px]
              placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[15px]
              focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
            "
            placeholder="Type here"
          />
          <div className="mt-1 text-right font-poppins text-xs sm:text-[13px] text-[#7A7A7A]">
            {internalNotes.length}/{maxLength}
          </div>
        </div>

        {/* Message to Examiner Field */}
        <div className="mt-4">
          <label
            htmlFor="message-to-examiner"
            className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
          >
            Message to Examiner
          </label>
          <textarea
            id="message-to-examiner"
            value={messageToExaminer}
            onChange={(e) => setMessageToExaminer(e.target.value)}
            maxLength={maxLength}
            className="
              h-28 sm:h-[120px] w-full resize-none
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#F6F6F6]
              p-3 sm:p-4 outline-none
              placeholder:font-[400] placeholder:text-[14px]
              placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[15px]
              focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
            "
            placeholder="Type here"
          />
          <div className="mt-1 text-right font-poppins text-xs sm:text-[13px] text-[#7A7A7A]">
            {messageToExaminer.length}/{maxLength}
          </div>
        </div>

        {/* Documents Required Checkbox */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="documents-required"
            checked={documentsRequired}
            onChange={(e) => setDocumentsRequired(e.target.checked)}
            className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-[#000093] focus:ring-[#000093]"
          />
          <label
            htmlFor="documents-required"
            className="font-poppins text-sm sm:text-[15px] text-[#1A1A1A] cursor-pointer"
          >
            Documents are required
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={!canSend}
            onClick={handleSubmit}
            className="
              h-10 sm:h-[46px]
              rounded-full
              bg-[#000080] px-8 sm:px-10 text-white
              transition-opacity
              disabled:cursor-not-allowed disabled:opacity-50
              hover:bg-[#000093]
              font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
            "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
