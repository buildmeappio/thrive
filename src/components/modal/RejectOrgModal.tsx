"use client";

// components/modal/RejectOrgModal.tsx
import React, { useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (messageToOrganization: string) => void;
  title?: string;
  maxLength?: number;
};

export default function RejectOrgModal({
  open,
  onClose,
  onSubmit,
  title = "Reason for Rejection",
  maxLength = 200,
}: Props) {
  const [messageToOrganization, setMessageToOrganization] = useState("");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => textareaRef.current?.focus(), 0);
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

  const canSend = messageToOrganization.trim().length > 0 && messageToOrganization.length <= maxLength;

  const handleSubmit = () => {
    if (canSend) {
      onSubmit(messageToOrganization.trim());
      // Reset form
      setMessageToOrganization("");
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
          className="font-[600] text-xl sm:text-[28px] leading-[1.2] tracking-[-0.02em] text-[#D32F2F] font-degular pr-10"
        >
          {title}
        </h2>

        {/* Message to Organization Field */}
        <div className="mt-5">
          <label
            htmlFor="message-to-organization"
            className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
          >
            Message to Organization
          </label>
          <textarea
            id="message-to-organization"
            ref={textareaRef}
            value={messageToOrganization}
            onChange={(e) => setMessageToOrganization(e.target.value)}
            maxLength={maxLength}
            className="
              h-28 sm:h-[120px] w-full resize-none
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#F6F6F6]
              p-3 sm:p-4 outline-none
              placeholder:font-[400] placeholder:text-[14px]
              placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[15px]
              focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]
            "
            placeholder="Type here"
          />
          <div className="mt-1 text-right font-poppins text-xs sm:text-[13px] text-[#7A7A7A]">
            {messageToOrganization.length}/{maxLength}
          </div>
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
              bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]
              px-8 sm:px-10 text-white
              transition-opacity
              disabled:cursor-not-allowed disabled:opacity-50
              hover:opacity-90
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

