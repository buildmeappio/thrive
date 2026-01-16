"use client";

import React, { useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  title?: string;
  isLoading?: boolean;
};

export default function InviteSuperAdminModal({
  open,
  onClose,
  onSubmit,
  title = "Invite Superadmin",
  isLoading = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => emailInputRef.current?.focus(), 0);
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
    if (panelRef.current && !panelRef.current.contains(e.target as Node))
      onClose();
  };

  if (!open) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    onSubmit(trimmedEmail);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const canSubmit =
    email.trim().length > 0 && validateEmail(email.trim()) && !isLoading;

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
          disabled={isLoading}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#000093] focus:outline-none focus:ring-2 focus:ring-[#000093]/40 disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="text-white"
          >
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

        {/* Email Field */}
        <div className="mt-5">
          <label
            htmlFor="superadmin-email"
            className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
          >
            Email Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="superadmin-email"
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            placeholder="Enter superadmin email"
            className="
              h-12 sm:h-14 w-full
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#F6F6F6]
              px-4 outline-none
              placeholder:font-[400] placeholder:text-[14px]
              placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[15px]
              focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          {error && (
            <div className="mt-1 text-sm font-poppins text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Role Field */}
        <div className="mt-5">
          <label
            htmlFor="superadmin-role"
            className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
          >
            Role
          </label>
          <input
            id="superadmin-role"
            type="text"
            value="SUPER_ADMIN"
            disabled
            readOnly
            className="
              h-12 sm:h-14 w-full
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#E8E8E8]
              px-4 outline-none
              font-poppins text-[14px] sm:text-[15px]
              text-[#666666]
              cursor-not-allowed
            "
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              h-10 sm:h-[46px]
              rounded-full
              border border-[#E5E5E5] bg-white
              px-8 sm:px-10 text-[#1A1A1A]
              transition-opacity
              disabled:cursor-not-allowed disabled:opacity-50
              hover:bg-[#F6F6F6]
              font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
            "
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
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
            {isLoading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
