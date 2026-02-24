'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; firstName: string; lastName: string }) => void;
  title?: string;
  isLoading?: boolean;
};

export default function InviteSuperAdminModal({
  open,
  onClose,
  onSubmit,
  title = 'Invite Super Admin',
  isLoading = false,
}: Props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    firstName?: string;
    lastName?: string;
  }>({});
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setFirstName('');
      setLastName('');
      setErrors({});
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => firstNameInputRef.current?.focus(), 0);
    // lock body scroll on mobile
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
  };

  if (!open) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      newErrors.firstName = 'First name is required';
    } else if (trimmedFirstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!trimmedLastName) {
      newErrors.lastName = 'Last name is required';
    } else if (trimmedLastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      email: trimmedEmail,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    });
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    if (errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: undefined }));
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    if (errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.trim().length > 0 &&
    validateEmail(email.trim()) &&
    !isLoading;

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
        className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_4px_134.6px_0_#00000030] sm:max-h-[85vh] sm:rounded-[30px] sm:px-6 sm:py-6"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40 disabled:opacity-50 sm:right-5 sm:top-5 sm:h-[32px] sm:w-[32px]"
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
          className="font-degular pr-10 text-xl font-[600] leading-[1.2] tracking-[-0.02em] text-[#000000] sm:text-[28px]"
        >
          {title}
        </h2>

        {/* First Name Field */}
        <div className="mt-5">
          <label
            htmlFor="superadmin-firstname"
            className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
          >
            First Name
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="superadmin-firstname"
            ref={firstNameInputRef}
            type="text"
            value={firstName}
            onChange={handleFirstNameChange}
            disabled={isLoading}
            placeholder="Enter first name"
            className={`font-poppins h-12 w-full rounded-xl border bg-[#F6F6F6] px-4 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:rounded-[15px] sm:text-[15px] ${
              errors.firstName
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-[#E5E5E5] focus:border-[#00A8FF] focus:ring-[#00A8FF]'
            } `}
          />
          {errors.firstName && (
            <div className="font-poppins mt-1 text-sm text-red-500">{errors.firstName}</div>
          )}
        </div>

        {/* Last Name Field */}
        <div className="mt-5">
          <label
            htmlFor="superadmin-lastname"
            className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
          >
            Last Name
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="superadmin-lastname"
            type="text"
            value={lastName}
            onChange={handleLastNameChange}
            disabled={isLoading}
            placeholder="Enter last name"
            className={`font-poppins h-12 w-full rounded-xl border bg-[#F6F6F6] px-4 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:rounded-[15px] sm:text-[15px] ${
              errors.lastName
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-[#E5E5E5] focus:border-[#00A8FF] focus:ring-[#00A8FF]'
            } `}
          />
          {errors.lastName && (
            <div className="font-poppins mt-1 text-sm text-red-500">{errors.lastName}</div>
          )}
        </div>

        {/* Email Field */}
        <div className="mt-5">
          <label
            htmlFor="superadmin-email"
            className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
          >
            Email Address
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="superadmin-email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            placeholder="Enter superadmin email"
            className={`font-poppins h-12 w-full rounded-xl border bg-[#F6F6F6] px-4 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:rounded-[15px] sm:text-[15px] ${
              errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-[#E5E5E5] focus:border-[#00A8FF] focus:ring-[#00A8FF]'
            } `}
          />
          {errors.email && (
            <div className="font-poppins mt-1 text-sm text-red-500">{errors.email}</div>
          )}
        </div>

        {/* Role Field */}
        <div className="mt-5">
          <label
            htmlFor="superadmin-role"
            className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
          >
            Role
          </label>
          <input
            id="superadmin-role"
            type="text"
            value="Super Admin"
            disabled
            readOnly
            className="font-poppins h-12 w-full cursor-not-allowed rounded-xl border border-[#E5E5E5] bg-[#E8E8E8] px-4 text-[14px] text-[#666666] outline-none sm:h-14 sm:rounded-[15px] sm:text-[15px]"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="font-poppins h-10 rounded-full border border-[#E5E5E5] bg-white px-8 text-[14px] font-[500] tracking-[-0.02em] text-[#1A1A1A] transition-opacity hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="font-poppins h-10 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-8 text-[14px] font-[500] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
