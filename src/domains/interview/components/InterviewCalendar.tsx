"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addMinutes, isPast, startOfDay, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { getAvailableSlots } from "../actions/getAvailableSlots";
import { requestInterviewSlots } from "../actions/requestInterviewSlots";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GenerateTimeSlots,
  isTimeAvailable,
  parseSlots,
  ParsedSlot,
  Slot,
} from "@/utils/timeslots";
import { getDuration, parseDate, getLocalDayUtcRange } from "@/utils/datetime";
import { InterviewSettings } from "@/server/services/configuration.service";
import { ApplicationData } from "../actions/verifyInterviewToken";
import { ExaminerStatus } from "@prisma/client";

interface InterviewCalendarProps {
  token: string;
  application: ApplicationData;
  interviewSettings: InterviewSettings;
}

const getDurationFromSlots = (slots: Array<Slot | ParsedSlot>) => {
  return new Set(slots.map((s) => s.duration)).size === 1
    ? slots[0]?.duration
    : undefined;
};

const getExistingSlots = async (selectedDate: Date, applicationId: string) => {
  try {
    const [rangeStartUtc, rangeEndUtc] = getLocalDayUtcRange(selectedDate);
    const result = await getAvailableSlots(
      rangeStartUtc,
      rangeEndUtc,
      applicationId,
    );

    if (!result.success || result.error) {
      throw new Error(result.error || "Failed to fetch slots");
    }

    return parseSlots(result.existingSlots);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch slots");
  }
};

type InitialState = {
  date: Date;
  duration: number;
  selectedSlots: Array<{ startTime: Date; duration: number }>;
};

const getToday = () => {
  return startOfDay(new Date());
};

const getTomorrow = (minDaysAhead: number) => {
  const today = getToday();
  return addDays(today, minDaysAhead);
};

// Initialize from booked slot if available
const getInitialState = (
  application: ApplicationData,
  interviewSettings: InterviewSettings,
): InitialState => {
  const {
    bookedSlot: initialBookedSlot = undefined,
    requestedSlots: initialRequestedSlots,
  } = application;
  const parsedRequested = parseSlots(initialRequestedSlots || []);
  const requestedDuration = getDurationFromSlots(parsedRequested);
  const tomorrow = getTomorrow(interviewSettings.minDaysAhead);

  const initialDate =
    parsedRequested.length > 0
      ? startOfDay(parsedRequested[0].startTime)
      : startOfDay(tomorrow);

  let bookedDuration: number | undefined;
  if (initialBookedSlot && parsedRequested.length === 0) {
    const startTime = parseDate(initialBookedSlot.startTime);
    const endTime = parseDate(initialBookedSlot.endTime);
    bookedDuration = getDuration(startTime, endTime!);
  }

  const duration =
    requestedDuration ||
    bookedDuration ||
    interviewSettings.durationOptions[0] ||
    30;

  return {
    date: initialDate,
    duration,
    selectedSlots: parsedRequested.map((s) => ({
      startTime: s.startTime,
      duration: s.duration,
    })),
  };
};

type Action =
  | { type: "SET_DATE"; date: Date }
  | { type: "SET_DURATION"; duration: number }
  | {
      type: "SET_SELECTED_SLOTS";
      selectedSlots: Array<{ startTime: Date; duration: number }>;
    };

const interviewCalendarReducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, date: action.date };
    case "SET_DURATION":
      return { ...state, duration: action.duration };
    case "SET_SELECTED_SLOTS":
      return { ...state, selectedSlots: action.selectedSlots };
    default:
      return state;
  }
};

const useInterviewCalendar = (
  application: ApplicationData,
  interviewSettings: InterviewSettings,
) => {
  const [state, dispatch] = useReducer(
    interviewCalendarReducer,
    getInitialState(application, interviewSettings),
  );

  const setSelectedSlots = (
    arg:
      | Array<{ startTime: Date; duration: number }>
      | ((
          prev: Array<{ startTime: Date; duration: number }>,
        ) => Array<{ startTime: Date; duration: number }>),
  ) => {
    const selectedSlots =
      typeof arg === "function" ? arg(state.selectedSlots) : arg;
    dispatch({ type: "SET_SELECTED_SLOTS", selectedSlots: selectedSlots });
  };

  return {
    date: state.date,
    duration: state.duration,
    selectedSlots: state.selectedSlots,
    setDate: (date: Date) => dispatch({ type: "SET_DATE", date }),
    setDuration: (duration: number) =>
      dispatch({ type: "SET_DURATION", duration }),
    setSelectedSlots,
  };
};

const InterviewCalendar = ({
  token,
  application,
  interviewSettings,
}: InterviewCalendarProps) => {
  const { id: applicationId } = application;

  const router = useRouter();

  const today = useMemo(() => new Date(), []);

  const {
    date: selectedDate,
    duration: selectedDuration,
    selectedSlots,
    setDate: setSelectedDate,
    setDuration: setSelectedDuration,
    setSelectedSlots,
  } = useInterviewCalendar(application, interviewSettings);

  const [selectedTimezone, setSelectedTimezone] = useState<string>("");

  // Set timezone client-side only to avoid SSR UTC issue
  useEffect(() => {
    setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  const [existingSlots, setExistingSlots] = useState<Array<ParsedSlot>>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchSlots = useCallback(
    async (selectedDate: Date) => {
      setLoading(true);
      setBookingError(null);
      try {
        const slots = await getExistingSlots(selectedDate, applicationId);
        setExistingSlots(slots);
      } catch (error) {
        if (error instanceof Error) {
          setBookingError(error.message);
        } else {
          setBookingError("Failed to fetch slots");
        }
      } finally {
        setLoading(false);
      }
    },
    [applicationId],
  );

  useEffect(() => {
    if (!selectedDate) return;
    fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // Generate time slots dynamically based on selected duration and working hours
  const availableTimeSlots = useMemo(() => {
    const dateToUse = selectedDate || today;
    const [rangeStartUtc, rangeEndUtc] = getLocalDayUtcRange(dateToUse);
    return new GenerateTimeSlots()
      .withSelectedDate(dateToUse)
      .withUtcRange(rangeStartUtc, rangeEndUtc)
      .withSelectedDuration(selectedDuration)
      .withInterviewSettings(interviewSettings)
      .build()
      .getSlots();
  }, [selectedDate, selectedDuration, interviewSettings, today]);

  // Check if a time slot is the current user's booked slot
  const checkIsCurrentUserSlot = (time: Date): boolean => {
    if (!application.bookedSlot) return false;
    const bookedStart = parseDate(application.bookedSlot.startTime);
    if (!bookedStart) return false;
    return time.getTime() === bookedStart.getTime();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dayStart = startOfDay(date);
      // Only allow dates from minDaysAhead onwards
      const minDate = startOfDay(new Date());
      minDate.setDate(minDate.getDate() + interviewSettings.minDaysAhead);

      if (dayStart >= minDate) {
        setSelectedDate(dayStart);
        setBookingError(null);
      }
    }
  };

  const handleConfirmBooking = () => {
    if (selectedSlots.length < 2) {
      setBookingError("Please select at least 2 time slots.");
      return;
    }
    setShowConfirmation(true);
    setBookingError(null);
  };

  const handleBackToSelection = () => {
    setShowConfirmation(false);
  };

  const handleBookSlot = async () => {
    if (selectedSlots.length < 2) return;

    setBooking(true);
    setBookingError(null);

    try {
      const result = await requestInterviewSlots(
        token,
        selectedSlots.map((s) => ({
          startTime: s.startTime,
          durationMinutes: s.duration,
        })),
        selectedTimezone || undefined,
      );

      if (result.success) {
        router.push(
          `/schedule-interview/success?token=${encodeURIComponent(token)}`,
        );
      } else {
        setBookingError(result.error || "Failed to submit preferences");

        // Refresh slots to reflect any changes
        if (selectedDate) {
          try {
            const [rangeStartUtc, rangeEndUtc] =
              getLocalDayUtcRange(selectedDate);
            const refreshResult = await getAvailableSlots(
              rangeStartUtc,
              rangeEndUtc,
              applicationId,
            );
            if (refreshResult.success) {
              setExistingSlots(parseSlots(refreshResult.existingSlots));
            } else if (refreshResult.error) {
              console.error(
                "getAvailableSlots refresh failed:",
                refreshResult.error,
              );
            }
          } catch (refreshError) {
            console.error("Failed to refresh slots:", refreshError);
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit preferences";
      setBookingError(errorMessage);

      // Refresh slots to reflect any changes
      if (selectedDate) {
        try {
          const [rangeStartUtc, rangeEndUtc] =
            getLocalDayUtcRange(selectedDate);
          const refreshResult = await getAvailableSlots(
            rangeStartUtc,
            rangeEndUtc,
            applicationId,
          );
          if (refreshResult.success) {
            setExistingSlots(parseSlots(refreshResult.existingSlots));
          } else if (refreshResult.error) {
            console.error(
              "getAvailableSlots refresh failed:",
              refreshResult.error,
            );
          }
        } catch (refreshError) {
          console.error("Failed to refresh slots:", refreshError);
        }
      }
    } finally {
      setBooking(false);
    }
  };

  // Get disabled dates (past dates and dates beyond maxDaysAhead)
  const getDisabledDates = (date: Date) => {
    const minDate = startOfDay(new Date());
    minDate.setDate(minDate.getDate() + interviewSettings.minDaysAhead);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + interviewSettings.maxDaysAhead);

    return date < minDate || date > maxDate;
  };

  // Check if we should show warning about cancelling booked slot
  const shouldShowCancellationWarning =
    application.status === ExaminerStatus.INTERVIEW_SCHEDULED &&
    application.bookedSlot !== undefined;

  // Confirmation State
  if (showConfirmation) {
    const sorted = [...selectedSlots].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Your Interview Preferences
            </h2>
            <p className="text-gray-600 mb-8">
              Please review your selected time slots before submitting
            </p>

            {/* Warning about cancelling booked slot */}
            {shouldShowCancellationWarning && application.bookedSlot && (
              <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500 rounded-lg p-3 text-white flex-shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">
                      Important: Your Confirmed Interview Will Be Cancelled
                    </h3>
                    <p className="text-sm text-amber-800 mb-3">
                      By submitting these new time slot preferences, your
                      currently confirmed interview will be cancelled and your
                      application status will change to &ldquo;Interview
                      Requested&rdquo;.
                    </p>
                    <div className="bg-white/70 rounded-lg border border-amber-200 px-4 py-3 mt-3">
                      <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">
                        Current Confirmed Interview
                      </p>
                      <p className="text-sm font-semibold text-amber-900">
                        {format(
                          parseDate(application.bookedSlot.startTime)!,
                          "EEEE, MMMM d, yyyy",
                        )}
                      </p>
                      <p className="text-sm text-amber-800">
                        {format(
                          parseDate(application.bookedSlot.startTime)!,
                          "h:mm a",
                        )}{" "}
                        -{" "}
                        {format(
                          parseDate(application.bookedSlot.endTime)!,
                          "h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Selected Time Slots
                    </p>
                    <p className="font-semibold text-gray-900">
                      {sorted.length} slot{sorted.length === 1 ? "" : "s"}
                      {selectedTimezone && ` • ${selectedTimezone}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sorted.map((s, idx) => (
                    <div
                      key={`${s.startTime.toISOString()}-${idx}`}
                      className="bg-white/70 rounded-lg border border-blue-100 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(s.startTime, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-700">
                            {format(s.startTime, "h:mm a")} -{" "}
                            {format(
                              addMinutes(s.startTime, s.duration),
                              "h:mm a",
                            )}
                            {" • "}
                            {s.duration} min
                          </p>
                        </div>
                        <Clock className="h-5 w-5 text-[#00A8FF] flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">
                      Submission Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">{bookingError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                onClick={handleBackToSelection}
                variant="outline"
                className="flex-1 h-12"
                disabled={booking}
              >
                Go Back
              </Button>
              <Button
                onClick={handleBookSlot}
                disabled={booking || selectedSlots.length < 2}
                className="flex-1 h-12 bg-[#00A8FF] hover:bg-[#0090D9] text-white font-semibold"
              >
                {booking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Preferences
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Selection State - Two Panel Layout
  return (
    <div className="max-w-7xl mx-auto">
      {/* Warning about cancelling booked slot */}
      {shouldShowCancellationWarning && application.bookedSlot && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500 rounded-lg p-3 text-white flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">
                Updating Your Selection Will Cancel Your Confirmed Interview
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                You currently have a confirmed interview scheduled. If you
                update your selection with new time slot preferences, your
                confirmed interview will be cancelled and your application
                status will change from &ldquo;Interview Scheduled&rdquo; to
                &ldquo;Interview Requested&rdquo;.
              </p>
              <div className="bg-white/70 rounded-lg border border-amber-200 px-4 py-3 mt-3">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">
                  Your Current Confirmed Interview
                </p>
                <p className="text-sm font-semibold text-amber-900">
                  {format(
                    parseDate(application.bookedSlot.startTime)!,
                    "EEEE, MMMM d, yyyy",
                  )}
                </p>
                <p className="text-sm text-amber-800">
                  {format(
                    parseDate(application.bookedSlot.startTime)!,
                    "h:mm a",
                  )}{" "}
                  -{" "}
                  {format(parseDate(application.bookedSlot.endTime)!, "h:mm a")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel - Appointment Details */}
          <div className="lg:w-1/3 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 p-6 lg:p-8 flex flex-col justify-between border-r border-gray-200">
            <div>
              {/* Service Type */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Interview Session
                </h2>
                <div className="flex items-center gap-2 text-gray-600 bg-white rounded-lg px-4 py-2.5 border border-gray-200 w-fit">
                  <Clock className="h-4 w-4 text-[#00A8FF]" />
                  <span className="text-sm font-medium">
                    {selectedDuration} min
                  </span>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Select Duration
                </p>
                <div className="md:space-y-3 flex flex-row md:flex-col space-x-4">
                  {interviewSettings.durationOptions.map((duration) => {
                    const isSelected = selectedDuration === duration;
                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => {
                          setSelectedDuration(duration);
                          setSelectedSlots([]);
                          setBookingError(null);
                        }}
                        className={cn(
                          "w-full py-3 h-12 md:h-auto flex items-center justify-start px-4 rounded-lg font-medium text-sm transition-all duration-200 text-left border-2",
                          isSelected
                            ? "bg-[#00A8FF] text-white shadow-md border-[#00A8FF]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#00A8FF] hover:bg-blue-50",
                        )}
                      >
                        {duration} minutes
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Slots */}
              <div className="mt-8">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Selected Slots
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedSlots.length} / 5 (min 2)
                  </p>
                </div>

                {selectedSlots.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">
                      Select up to 5 time slots so the admin can choose the best
                      option.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                    {[...selectedSlots]
                      .sort(
                        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
                      )
                      .map((slot) => (
                        <div
                          key={slot.startTime.toISOString()}
                          className="flex items-start justify-between gap-3 rounded-md border border-gray-100 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {format(slot.startTime, "EEE, MMM d")}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {format(slot.startTime, "h:mm a")} -{" "}
                              {format(
                                addMinutes(slot.startTime, slot.duration),
                                "h:mm a",
                              )}{" "}
                              • {slot.duration} min
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlots((prev) =>
                                prev.filter(
                                  (s) =>
                                    s.startTime.getTime() !==
                                    slot.startTime.getTime(),
                                ),
                              );
                              setBookingError(null);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            aria-label="Remove slot"
                            title="Remove slot"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Calendar & Time Selection */}
          <div className="lg:w-2/3 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Select a Date & Time
            </h3>

            {/* Selected Slots Summary & Submit Button - Top CTA */}
            {selectedSlots.length > 0 && (
              <div className="mb-6">
                <Button
                  onClick={handleConfirmBooking}
                  disabled={selectedSlots.length < 2}
                  className="w-full h-14 bg-[#00A8FF] hover:bg-[#0090D9] text-white font-semibold shadow-lg text-base disabled:opacity-60"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-semibold">
                          {(() => {
                            const sorted = [...selectedSlots].sort(
                              (a, b) =>
                                a.startTime.getTime() - b.startTime.getTime(),
                            );
                            const first = sorted[0];
                            return first
                              ? format(first.startTime, "EEEE, MMMM d, yyyy")
                              : "Selected slots";
                          })()}
                        </p>
                        <p className="text-sm font-normal opacity-90">
                          {(() => {
                            const sorted = [...selectedSlots].sort(
                              (a, b) =>
                                a.startTime.getTime() - b.startTime.getTime(),
                            );
                            const first = sorted[0];
                            if (!first) return "";
                            return `${format(first.startTime, "h:mm a")} - ${format(
                              addMinutes(first.startTime, first.duration),
                              "h:mm a",
                            )} • ${selectedSlots.length} selected`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        {selectedSlots.length < 2
                          ? "Select 2+ Slots"
                          : "Review & Submit"}
                      </span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Error Message */}
            {bookingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">
                      Booking Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">{bookingError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Layout: Calendar + Timezone | Time Slots */}
            <div className="flex h-full flex-col lg:flex-row gap-8 items-start">
              {/* Left Column - Calendar & Timezone */}
              <div className="flex-shrink-0 h-full space-y-5">
                {/* Calendar */}
                <div className="bg-white flex flex-1 items-center justify-center border border-gray-200 rounded-xl p-6 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={getDisabledDates}
                    defaultMonth={selectedDate}
                    className="rounded-lg border-0 p-0 w-full"
                    classNames={{
                      root: "self-center",
                      months: "flex flex-col",
                      month: "space-y-3 w-full",
                      caption:
                        "flex justify-center pt-1 relative items-center mb-3",
                      caption_label: "text-base font-semibold text-gray-900",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex mb-2",
                      head_cell:
                        "text-gray-500 rounded-md w-10 font-medium text-xs py-2",
                      row: "flex w-full mb-1",
                      cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: cn(
                        "h-10 w-10 p-0 font-medium rounded-lg transition-all hover:bg-gray-100",
                        "data-[selected-single=true]:bg-[#00A8FF] data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-[#0090D9] data-[selected-single=true]:shadow-md",
                        "data-[disabled=true]:text-gray-300 data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:hover:bg-transparent",
                      ),
                      day_range_end: "day-range-end",
                      day_selected:
                        "bg-[#00A8FF] text-white hover:bg-[#0090D9] hover:text-white focus:bg-[#00A8FF] focus:text-white",
                      day_today:
                        "bg-gray-50 text-gray-900 font-semibold border border-gray-300 data-[selected-single=true]:bg-[#00A8FF] data-[selected-single=true]:text-white data-[selected-single=true]:border-transparent",
                      day_outside: "day-outside text-gray-400 opacity-50",
                      day_disabled:
                        "text-gray-300 opacity-40 cursor-not-allowed",
                      day_range_middle:
                        "aria-selected:bg-gray-50 aria-selected:text-gray-900",
                      day_hidden: "invisible",
                    }}
                    components={{
                      Chevron: ({ orientation }) => {
                        if (orientation === "left") {
                          return <ChevronLeft className="h-4 w-4" />;
                        }
                        return <ChevronRight className="h-4 w-4" />;
                      },
                    }}
                  />
                </div>

                {/* Selected Date Display */}
                {selectedDate && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {format(selectedDate, "EEEE, MMMM d")}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Time Slots */}
              <div className="flex-1 min-w-0 max-h-[33.5rem] flex flex-col items-start">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00A8FF] mb-4" />
                    <p className="text-gray-600 text-sm">
                      Loading available times...
                    </p>
                  </div>
                ) : selectedDate ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 w-full flex-1 overflow-y-scroll">
                    <div className="flex flex-col gap-3">
                      {availableTimeSlots.map((time, index) => {
                        const isAvailable = isTimeAvailable(
                          time,
                          selectedDuration,
                          existingSlots,
                          application.bookedSlot,
                        );
                        const isSelected = selectedSlots.some(
                          (s) => s.startTime.getTime() === time.getTime(),
                        );
                        const isPastTime = isPast(time);
                        const isCurrentUserBookedSlot =
                          checkIsCurrentUserSlot(time);

                        // Check if this time conflicts with any BOOKED slot
                        const conflictingSlot = existingSlots.find((slot) => {
                          if (!slot.isBooked) return false;
                          if (
                            isCurrentUserBookedSlot &&
                            slot.id === application.bookedSlot?.id
                          )
                            return false;

                          const slotStart = new Date(slot.startTime);
                          const slotEnd = new Date(slot.endTime);
                          const endTime = addMinutes(time, selectedDuration);

                          // Check for any overlap or exact match
                          // Time slots conflict if:
                          // 1. Selected time starts during existing slot
                          // 2. Selected time ends during existing slot
                          // 3. Selected time completely contains existing slot
                          // 4. Existing slot completely contains selected time
                          // 5. Exact start time match
                          return (
                            time.getTime() === slotStart.getTime() || // Exact start time match
                            (time >= slotStart && time < slotEnd) || // Starts during existing slot
                            (endTime > slotStart && endTime <= slotEnd) || // Ends during existing slot
                            (time <= slotStart && endTime >= slotEnd) || // Completely contains existing slot
                            (time < slotStart && endTime > slotStart) // Overlaps with existing slot
                          );
                        });

                        // For display only: show if this time is requested by someone else
                        const overlapsWith = (slot: {
                          startTime: Date;
                          endTime: Date;
                        }) => {
                          const slotStart = new Date(slot.startTime);
                          const slotEnd = new Date(slot.endTime);
                          const endTime = addMinutes(time, selectedDuration);
                          return (
                            time.getTime() === slotStart.getTime() ||
                            (time >= slotStart && time < slotEnd) ||
                            (endTime > slotStart && endTime <= slotEnd) ||
                            (time <= slotStart && endTime >= slotEnd) ||
                            (time < slotStart && endTime > slotStart)
                          );
                        };

                        const requestedOverlapSlot = existingSlots.find(
                          (slot) =>
                            !slot.isBooked &&
                            slot.status === "REQUESTED" &&
                            slot.isCurrentUserRequested &&
                            overlapsWith(slot),
                        );
                        const isCurrentUserRequestedOverlap =
                          !!requestedOverlapSlot?.isCurrentUserRequested;

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={
                              !isAvailable || isPastTime || !!conflictingSlot
                            }
                            onClick={() => {
                              if (!isAvailable || isPastTime || conflictingSlot)
                                return;

                              if (isSelected) {
                                setSelectedSlots((prev) =>
                                  prev.filter(
                                    (s) =>
                                      s.startTime.getTime() !== time.getTime(),
                                  ),
                                );
                                setBookingError(null);
                                return;
                              }

                              setSelectedSlots((prev) => {
                                if (prev.length >= 5) {
                                  setBookingError(
                                    "You can select up to 5 time slots.",
                                  );
                                  return prev;
                                }
                                setBookingError(null);
                                return [
                                  ...prev,
                                  {
                                    startTime: time,
                                    duration: selectedDuration,
                                  },
                                ];
                              });
                            }}
                            className={cn(
                              "w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 text-left relative",
                              isSelected
                                ? "bg-[#00A8FF] text-white shadow-md ring-2 ring-[#00A8FF] ring-offset-1"
                                : !isAvailable || isPastTime || conflictingSlot
                                  ? conflictingSlot
                                    ? "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white cursor-not-allowed border-2 border-blue-900/50 shadow-lg opacity-90"
                                    : "bg-gray-50 text-gray-400 cursor-not-allowed opacity-60 border border-gray-200"
                                  : "bg-white text-[#00A8FF] border border-gray-300 hover:border-[#00A8FF] hover:bg-blue-50 hover:shadow-sm",
                            )}
                            title={
                              conflictingSlot
                                ? "This time slot is already booked"
                                : isPastTime
                                  ? "This time has passed"
                                  : ""
                            }
                          >
                            <span className="flex items-center justify-between w-full">
                              <span>{format(time, "h:mm a")}</span>
                              {conflictingSlot ? (
                                <span className="text-xs font-bold text-white bg-blue-900/70 px-2.5 py-1 rounded-md shadow-md border border-blue-950/30">
                                  Booked
                                </span>
                              ) : requestedOverlapSlot ? (
                                <span
                                  className={cn(
                                    "text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border",
                                    isCurrentUserRequestedOverlap
                                      ? "bg-[#00A8FF] text-white border-[#0090D9]"
                                      : "bg-blue-50 text-blue-800 border-blue-200",
                                  )}
                                >
                                  {isCurrentUserRequestedOverlap
                                    ? "Your Selection"
                                    : "Requested"}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center w-full">
                    <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Please select a date first
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCalendar;
