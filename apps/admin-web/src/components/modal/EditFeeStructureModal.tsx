import React, { useEffect, useId, useRef, useState } from "react";
import { ExaminerFeeStructure } from "@/domains/examiner/types/ExaminerData";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ExaminerFeeStructure, "id">) => void;
  initialData?: ExaminerFeeStructure;
  title?: string;
  isLoading?: boolean;
};

export default function EditFeeStructureModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title = "Edit Fee Structure",
  isLoading = false,
}: Props) {
  const [IMEFee, setIMEFee] = useState(
    initialData?.IMEFee ? Math.floor(initialData.IMEFee).toString() : "",
  );
  const [recordReviewFee, setRecordReviewFee] = useState(
    initialData?.recordReviewFee
      ? Math.floor(initialData.recordReviewFee).toString()
      : "",
  );
  const [hourlyRate, setHourlyRate] = useState(
    initialData?.hourlyRate
      ? Math.floor(initialData.hourlyRate).toString()
      : "",
  );
  const [cancellationFee, setCancellationFee] = useState(
    initialData?.cancellationFee
      ? Math.floor(initialData.cancellationFee).toString()
      : "",
  );

  // Helper function to sanitize input to only allow positive integers
  const sanitizePositiveInteger = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly;
  };

  // Handler for positive integer input
  const handleIntegerChange = (
    value: string,
    setter: (value: string) => void,
  ) => {
    const sanitized = sanitizePositiveInteger(value);
    setter(sanitized);
  };

  // Prevent typing negative signs, decimals, and other non-numeric characters
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and arrow keys
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(e.key)
    ) {
      return;
    }
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x"].includes(e.key.toLowerCase())
    ) {
      return;
    }
    // Prevent: negative sign, decimal point, and any non-numeric character
    if (
      e.key === "-" ||
      e.key === "." ||
      e.key === "," ||
      isNaN(Number(e.key))
    ) {
      e.preventDefault();
    }
  };

  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setIMEFee(
        initialData.IMEFee ? Math.floor(initialData.IMEFee).toString() : "",
      );
      setRecordReviewFee(
        initialData.recordReviewFee
          ? Math.floor(initialData.recordReviewFee).toString()
          : "",
      );
      setHourlyRate(
        initialData.hourlyRate
          ? Math.floor(initialData.hourlyRate).toString()
          : "",
      );
      setCancellationFee(
        initialData.cancellationFee
          ? Math.floor(initialData.cancellationFee).toString()
          : "",
      );
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstInputRef.current?.focus(), 0);
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

  const canSubmit =
    IMEFee.trim().length > 0 &&
    recordReviewFee.trim().length > 0 &&
    cancellationFee.trim().length > 0;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit({
        IMEFee: parseInt(IMEFee, 10) || 0,
        recordReviewFee: parseInt(recordReviewFee, 10) || 0,
        hourlyRate: hourlyRate
          ? parseInt(hourlyRate, 10) || undefined
          : undefined,
        cancellationFee: parseInt(cancellationFee, 10) || 0,
        paymentTerms: initialData?.paymentTerms || "N/A",
      } as Omit<ExaminerFeeStructure, "id">);
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

        {/* Form Fields */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* IME Fee */}
          <div>
            <label
              htmlFor="ime-fee"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              IME Fee ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="ime-fee"
              ref={firstInputRef}
              type="number"
              min="0"
              value={IMEFee}
              onChange={(e) => handleIntegerChange(e.target.value, setIMEFee)}
              onKeyDown={handleKeyDown}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="Enter amount"
            />
          </div>

          {/* Report Review Fee */}
          <div>
            <label
              htmlFor="record-review-fee"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Report Review Fee ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="record-review-fee"
              type="number"
              min="0"
              value={recordReviewFee}
              onChange={(e) =>
                handleIntegerChange(e.target.value, setRecordReviewFee)
              }
              onKeyDown={handleKeyDown}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="Enter amount"
            />
          </div>

          {/* Hourly Rate (Optional) */}
          <div>
            <label
              htmlFor="hourly-rate"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Hourly Rate ($)
            </label>
            <input
              id="hourly-rate"
              type="number"
              min="0"
              value={hourlyRate}
              onChange={(e) =>
                handleIntegerChange(e.target.value, setHourlyRate)
              }
              onKeyDown={handleKeyDown}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="Enter amount (optional)"
            />
          </div>

          {/* Cancellation Fee */}
          <div>
            <label
              htmlFor="cancellation-fee"
              className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
            >
              Cancellation Fee ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="cancellation-fee"
              type="number"
              min="0"
              value={cancellationFee}
              onChange={(e) =>
                handleIntegerChange(e.target.value, setCancellationFee)
              }
              onKeyDown={handleKeyDown}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              h-10 sm:h-[46px]
              rounded-full
              border border-[#E5E5E5]
              bg-white px-8 sm:px-10 text-[#000080]
              transition-colors
              hover:bg-gray-50
              disabled:cursor-not-allowed disabled:opacity-50
              font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
            "
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isLoading}
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
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
