import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewSlot = {
  id: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  slots: InterviewSlot[];
  onConfirm: (slotId: string) => Promise<void>;
  confirmingSlotId: string | null;
  isLoading: boolean;
};

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ConfirmInterviewSlotModal({
  open,
  onClose,
  slots,
  onConfirm,
  confirmingSlotId,
  isLoading,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset selection when modal closes
      setSelectedSlotId(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // lock body scroll on mobile
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node))
      onClose();
  };

  const handleConfirm = async () => {
    if (selectedSlotId) {
      await onConfirm(selectedSlotId);
      setSelectedSlotId(null);
    }
  };

  if (!open) return null;

  // Sort slots by startTime ascending (earliest first)
  const sortedSlots = [...slots].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeA - timeB;
  });

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
          relative w-full max-w-[700px]
          rounded-2xl sm:rounded-[30px]
          bg-white
          shadow-[0_4px_134.6px_0_#00000030]
          max-h-[calc(100vh-1.5rem)] sm:max-h-[85vh]
          flex flex-col
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-5 sm:px-[45px] sm:pt-[40px] pb-4 border-b border-gray-200">
          {/* Close */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#000093] focus:outline-none focus:ring-2 focus:ring-[#000093]/40 z-10"
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
            Confirm Interview Slot
          </h2>

          {/* Description */}
          <p className="mt-3 font-poppins text-sm sm:text-base text-gray-600">
            Select an interview slot to confirm. All other requested slots will
            be automatically removed.
          </p>
        </div>

        {/* Slots List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-[45px] py-4">
          <div className="space-y-4">
            {sortedSlots.length === 0 ? (
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 px-6 py-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <p className="text-gray-700 font-poppins text-base font-medium mb-1">
                  No Requested Interview Slots
                </p>
                <p className="text-gray-500 font-poppins text-sm">
                  There are no requested interview slots to confirm.
                </p>
              </div>
            ) : (
              sortedSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isConfirming = confirmingSlotId === slot.id;

                const formattedDate = slot.startTime
                  ? new Date(slot.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A";

                const formattedTime =
                  slot.startTime && slot.endTime
                    ? `${new Date(slot.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })} - ${new Date(slot.endTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}`
                    : "N/A";

                return (
                  <div
                    key={slot.id}
                    onClick={() => !isLoading && setSelectedSlotId(slot.id)}
                    className={cn(
                      "rounded-xl border-2 transition-all duration-200 cursor-pointer",
                      "bg-white shadow-sm hover:shadow-md",
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : isConfirming
                          ? "border-blue-300 bg-blue-50"
                          : "border-blue-200 hover:border-blue-300",
                      isLoading && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Left side - Slot information */}
                        <div className="flex-1 space-y-3">
                          {/* Date */}
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-poppins text-gray-500 uppercase tracking-wide mb-0.5">
                                Date
                              </p>
                              <p className="text-base font-poppins font-semibold text-gray-900">
                                {formattedDate}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <p className="text-xs font-poppins text-gray-500 uppercase tracking-wide mb-0.5">
                                Time
                              </p>
                              <p className="text-base font-poppins font-semibold text-gray-900">
                                {formattedTime}
                              </p>
                            </div>
                          </div>

                          {/* Duration and Status */}
                          <div className="flex items-center gap-3 pt-1">
                            {slot.duration && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-poppins text-gray-500">
                                  Duration:
                                </span>
                                <span className="text-sm font-poppins font-medium text-gray-700">
                                  {slot.duration} minutes
                                </span>
                              </div>
                            )}
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-poppins font-medium"
                              style={{
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                              }}
                            >
                              {formatText(slot.status)}
                            </span>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 p-5 sm:px-[45px] sm:pb-[40px] pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              h-10 sm:h-[46px]
              rounded-full
              border border-gray-300 px-8 sm:px-10 text-gray-700
              transition-opacity
              disabled:cursor-not-allowed disabled:opacity-50
              hover:bg-gray-50
              font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
            "
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedSlotId || isLoading}
            className={cn(
              "h-10 sm:h-[46px] rounded-full font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]",
              "px-8 sm:px-10 transition-all duration-200",
              "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white",
              "hover:opacity-90 hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm",
              isLoading && "animate-pulse",
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Confirming...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Confirm Selected Slot
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
