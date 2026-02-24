import React, { useEffect, useId, useRef, useState } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // lock body scroll on mobile
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
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
        className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-[700px] flex-col rounded-2xl bg-white shadow-[0_4px_134.6px_0_#00000030] sm:max-h-[85vh] sm:rounded-[30px]"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-200 p-5 pb-4 sm:px-[45px] sm:pt-[40px]">
          {/* Close */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-[#000093] focus:outline-none focus:ring-2 focus:ring-[#000093]/40 sm:right-5 sm:top-5 sm:h-[32px] sm:w-[32px]"
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
            className="font-degular pr-10 text-xl font-[600] leading-[1.2] tracking-[-0.02em] text-[#000093] sm:text-[28px]"
          >
            Confirm Interview Slot
          </h2>

          {/* Description */}
          <p className="font-poppins mt-3 text-sm text-gray-600 sm:text-base">
            Select an interview slot to confirm. All other requested slots will be automatically
            removed.
          </p>
        </div>

        {/* Slots List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-[45px]">
          <div className="space-y-4">
            {sortedSlots.length === 0 ? (
              <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 px-6 py-8 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-blue-400" />
                <p className="font-poppins mb-1 text-base font-medium text-gray-700">
                  No Requested Interview Slots
                </p>
                <p className="font-poppins text-sm text-gray-500">
                  There are no requested interview slots to confirm.
                </p>
              </div>
            ) : (
              sortedSlots.map(slot => {
                const isSelected = selectedSlotId === slot.id;
                const isConfirming = confirmingSlotId === slot.id;

                const formattedDate = slot.startTime
                  ? new Date(slot.startTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A';

                const formattedTime =
                  slot.startTime && slot.endTime
                    ? `${new Date(slot.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })} - ${new Date(slot.endTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}`
                    : 'N/A';

                return (
                  <div
                    key={slot.id}
                    onClick={() => !isLoading && setSelectedSlotId(slot.id)}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 transition-all duration-200',
                      'bg-white shadow-sm hover:shadow-md',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : isConfirming
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-blue-200 hover:border-blue-300',
                      isLoading && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <div className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* Left side - Slot information */}
                        <div className="flex-1 space-y-3">
                          {/* Date */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-poppins mb-0.5 text-xs uppercase tracking-wide text-gray-500">
                                Date
                              </p>
                              <p className="font-poppins text-base font-semibold text-gray-900">
                                {formattedDate}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-teal-100">
                              <Clock className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div>
                              <p className="font-poppins mb-0.5 text-xs uppercase tracking-wide text-gray-500">
                                Time
                              </p>
                              <p className="font-poppins text-base font-semibold text-gray-900">
                                {formattedTime}
                              </p>
                            </div>
                          </div>

                          {/* Duration and Status */}
                          <div className="flex items-center gap-3 pt-1">
                            {slot.duration && (
                              <div className="flex items-center gap-2">
                                <span className="font-poppins text-xs text-gray-500">
                                  Duration:
                                </span>
                                <span className="font-poppins text-sm font-medium text-gray-700">
                                  {slot.duration} minutes
                                </span>
                              </div>
                            )}
                            <span
                              className="font-poppins inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                              }}
                            >
                              {formatText(slot.status)}
                            </span>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                              <Check className="h-4 w-4 text-white" />
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
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-200 p-5 pt-4 sm:px-[45px] sm:pb-[40px]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="font-poppins h-10 rounded-full border border-gray-300 px-8 text-[14px] font-[500] tracking-[-0.02em] text-gray-700 transition-opacity hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedSlotId || isLoading}
            className={cn(
              'font-poppins h-10 rounded-full text-[14px] font-[500] tracking-[-0.02em] sm:h-[46px] sm:text-[16px]',
              'px-8 transition-all duration-200 sm:px-10',
              'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white',
              'hover:opacity-90 hover:shadow-lg',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
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
                <Check className="h-4 w-4" />
                Confirm Selected Slot
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
