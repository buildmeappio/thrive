'use client';

import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, addMinutes, isPast, startOfDay, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getAvailableSlots } from '../actions/getAvailableSlots';
import { requestInterviewSlots } from '../actions/requestInterviewSlots';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GenerateTimeSlots,
  isTimeAvailable,
  parseSlots,
  ParsedSlot,
  Slot,
} from '@/utils/timeslots';
import { getDuration, parseDate, getLocalDayUtcRange } from '@/utils/datetime';
import { InterviewSettings } from '@/server/services/configuration.service';
import { ApplicationData } from '../actions/verifyInterviewToken';
import { ExaminerStatus } from '@thrive/database';

interface InterviewCalendarProps {
  token: string;
  application: ApplicationData;
  interviewSettings: InterviewSettings;
}

const getDurationFromSlots = (slots: Array<Slot | ParsedSlot>) => {
  return new Set(slots.map(s => s.duration)).size === 1 ? slots[0]?.duration : undefined;
};

const getExistingSlots = async (selectedDate: Date, applicationId: string) => {
  try {
    const [rangeStartUtc, rangeEndUtc] = getLocalDayUtcRange(selectedDate);
    const result = await getAvailableSlots(rangeStartUtc, rangeEndUtc, applicationId);

    if (!result.success || result.error) {
      throw new Error(result.error || 'Failed to fetch slots');
    }

    return parseSlots(result.existingSlots);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch slots');
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
  interviewSettings: InterviewSettings
): InitialState => {
  const { bookedSlot: initialBookedSlot = undefined, requestedSlots: initialRequestedSlots } =
    application;
  const parsedRequested = parseSlots(initialRequestedSlots || []);
  const requestedDuration = getDurationFromSlots(parsedRequested);
  const tomorrow = getTomorrow(interviewSettings.minDaysAhead);

  const initialDate =
    parsedRequested.length > 0 ? startOfDay(parsedRequested[0].startTime) : startOfDay(tomorrow);

  let bookedDuration: number | undefined;
  if (initialBookedSlot && parsedRequested.length === 0) {
    const startTime = parseDate(initialBookedSlot.startTime);
    const endTime = parseDate(initialBookedSlot.endTime);
    bookedDuration = getDuration(startTime, endTime!);
  }

  const duration =
    requestedDuration || bookedDuration || interviewSettings.durationOptions[0] || 30;

  return {
    date: initialDate,
    duration,
    selectedSlots: parsedRequested.map(s => ({
      startTime: s.startTime,
      duration: s.duration,
    })),
  };
};

type Action =
  | { type: 'SET_DATE'; date: Date }
  | { type: 'SET_DURATION'; duration: number }
  | {
      type: 'SET_SELECTED_SLOTS';
      selectedSlots: Array<{ startTime: Date; duration: number }>;
    };

const interviewCalendarReducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, date: action.date };
    case 'SET_DURATION':
      return { ...state, duration: action.duration };
    case 'SET_SELECTED_SLOTS':
      return { ...state, selectedSlots: action.selectedSlots };
    default:
      return state;
  }
};

const useInterviewCalendar = (
  application: ApplicationData,
  interviewSettings: InterviewSettings
) => {
  const [state, dispatch] = useReducer(
    interviewCalendarReducer,
    getInitialState(application, interviewSettings)
  );

  const setSelectedSlots = (
    arg:
      | Array<{ startTime: Date; duration: number }>
      | ((
          prev: Array<{ startTime: Date; duration: number }>
        ) => Array<{ startTime: Date; duration: number }>)
  ) => {
    const selectedSlots = typeof arg === 'function' ? arg(state.selectedSlots) : arg;
    dispatch({ type: 'SET_SELECTED_SLOTS', selectedSlots: selectedSlots });
  };

  return {
    date: state.date,
    duration: state.duration,
    selectedSlots: state.selectedSlots,
    setDate: (date: Date) => dispatch({ type: 'SET_DATE', date }),
    setDuration: (duration: number) => dispatch({ type: 'SET_DURATION', duration }),
    setSelectedSlots,
  };
};

const InterviewCalendar = ({ token, application, interviewSettings }: InterviewCalendarProps) => {
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

  const [selectedTimezone, setSelectedTimezone] = useState<string>('');

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
          setBookingError('Failed to fetch slots');
        }
      } finally {
        setLoading(false);
      }
    },
    [applicationId]
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
      setBookingError('Please select at least 2 time slots.');
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
        selectedSlots.map(s => ({
          startTime: s.startTime,
          durationMinutes: s.duration,
        })),
        selectedTimezone || undefined
      );

      if (result.success) {
        router.push(`/schedule-interview/success?token=${encodeURIComponent(token)}`);
      } else {
        setBookingError(result.error || 'Failed to submit preferences');

        // Refresh slots to reflect any changes
        if (selectedDate) {
          try {
            const [rangeStartUtc, rangeEndUtc] = getLocalDayUtcRange(selectedDate);
            const refreshResult = await getAvailableSlots(
              rangeStartUtc,
              rangeEndUtc,
              applicationId
            );
            if (refreshResult.success) {
              setExistingSlots(parseSlots(refreshResult.existingSlots));
            } else if (refreshResult.error) {
              console.error('getAvailableSlots refresh failed:', refreshResult.error);
            }
          } catch (refreshError) {
            console.error('Failed to refresh slots:', refreshError);
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit preferences';
      setBookingError(errorMessage);

      // Refresh slots to reflect any changes
      if (selectedDate) {
        try {
          const [rangeStartUtc, rangeEndUtc] = getLocalDayUtcRange(selectedDate);
          const refreshResult = await getAvailableSlots(rangeStartUtc, rangeEndUtc, applicationId);
          if (refreshResult.success) {
            setExistingSlots(parseSlots(refreshResult.existingSlots));
          } else if (refreshResult.error) {
            console.error('getAvailableSlots refresh failed:', refreshResult.error);
          }
        } catch (refreshError) {
          console.error('Failed to refresh slots:', refreshError);
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
    const sorted = [...selectedSlots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          <div className="p-8 md:p-10">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {shouldShowCancellationWarning
                ? 'Confirm Interview Rescheduling'
                : 'Confirm Your Interview Preferences'}
            </h2>
            <p className="mb-8 text-gray-600">
              {shouldShowCancellationWarning
                ? 'Please review your new time slot preferences. Submitting will cancel your current confirmed interview and change your application status to &ldquo;Interview Requested&rdquo;.'
                : 'Please review your selected time slots before submitting. An admin will review your preferences and confirm one of your selected slots.'}
            </p>

            {/* Warning about cancelling booked slot */}
            {shouldShowCancellationWarning && application.bookedSlot && (
              <div className="mb-8 rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-amber-500 p-3 text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-amber-900">
                      Important: Your Confirmed Interview Will Be Cancelled
                    </h3>
                    <p className="mb-3 text-sm text-amber-800">
                      By submitting these new time slot preferences, your currently confirmed
                      interview will be cancelled and your application status will change to
                      &ldquo;Interview Requested&rdquo;.
                    </p>
                    <div className="mt-3 rounded-lg border border-amber-200 bg-white/70 px-4 py-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700">
                        Current Confirmed Interview
                      </p>
                      <p className="text-sm font-semibold text-amber-900">
                        {format(parseDate(application.bookedSlot.startTime)!, 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-amber-800">
                        {format(parseDate(application.bookedSlot.startTime)!, 'h:mm a')} -{' '}
                        {format(parseDate(application.bookedSlot.endTime)!, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 space-y-6">
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-[#00A8FF] p-3 text-white">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {shouldShowCancellationWarning
                        ? 'New Time Slot Preferences'
                        : 'Selected Time Slots'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {sorted.length} slot{sorted.length === 1 ? '' : 's'}
                      {selectedTimezone && ` • ${selectedTimezone}`}
                    </p>
                    {shouldShowCancellationWarning && (
                      <p className="mt-1 text-xs text-gray-600">
                        These will replace your current confirmed interview
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {sorted.map((s, idx) => (
                    <div
                      key={`${s.startTime.toISOString()}-${idx}`}
                      className="rounded-lg border border-blue-100 bg-white/70 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(s.startTime, 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-700">
                            {format(s.startTime, 'h:mm a')} -{' '}
                            {format(addMinutes(s.startTime, s.duration), 'h:mm a')}
                            {' • '}
                            {s.duration} min
                          </p>
                        </div>
                        <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-[#00A8FF]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Submission Failed</p>
                    <p className="mt-1 text-sm text-red-700">{bookingError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                onClick={handleBackToSelection}
                variant="outline"
                className="h-12 flex-1"
                disabled={booking}
              >
                Go Back
              </Button>
              <Button
                onClick={handleBookSlot}
                disabled={booking || selectedSlots.length < 2}
                className="h-12 flex-1 bg-[#00A8FF] font-semibold text-white hover:bg-[#0090D9]"
              >
                {booking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {shouldShowCancellationWarning ? 'Cancelling & Submitting...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    {shouldShowCancellationWarning
                      ? 'Cancel Current & Submit New Preferences'
                      : 'Submit Preferences'}
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
    <div className="mx-auto max-w-7xl">
      {/* Warning about cancelling booked slot */}
      {shouldShowCancellationWarning && application.bookedSlot && (
        <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-lg bg-amber-500 p-3 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-amber-900">
                Updating Your Selection Will Cancel Your Confirmed Interview
              </h3>
              <p className="mb-3 text-sm text-amber-800">
                You currently have a confirmed interview scheduled. If you update your selection
                with new time slot preferences, your confirmed interview will be cancelled and your
                application status will change from &ldquo;Interview Scheduled&rdquo; to
                &ldquo;Interview Requested&rdquo;.
              </p>
              <div className="mt-3 rounded-lg border border-amber-200 bg-white/70 px-4 py-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700">
                  Your Current Confirmed Interview
                </p>
                <p className="text-sm font-semibold text-amber-900">
                  {format(parseDate(application.bookedSlot.startTime)!, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-amber-800">
                  {format(parseDate(application.bookedSlot.startTime)!, 'h:mm a')} -{' '}
                  {format(parseDate(application.bookedSlot.endTime)!, 'h:mm a')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel - Appointment Details */}
          <div className="flex flex-col justify-between border-r border-gray-200 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 p-6 lg:w-1/3 lg:p-8">
            <div>
              {/* Service Type */}
              <div className="mb-6">
                <h2 className="mb-3 text-2xl font-bold text-gray-900">Interview Session</h2>
                <div className="flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600">
                  <Clock className="h-4 w-4 text-[#00A8FF]" />
                  <span className="text-sm font-medium">{selectedDuration} min</span>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <p className="mb-4 text-sm font-semibold text-gray-700">Select Duration</p>
                <div className="flex flex-row space-x-4 md:flex-col md:space-y-3">
                  {interviewSettings.durationOptions.map(duration => {
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
                          'flex h-12 w-full items-center justify-start rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200 md:h-auto',
                          isSelected
                            ? 'border-[#00A8FF] bg-[#00A8FF] text-white shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#00A8FF] hover:bg-blue-50'
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
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold text-gray-700">Selected Slots</p>
                  <p className="text-xs text-gray-500">{selectedSlots.length} / 5 (min 2)</p>
                </div>

                {selectedSlots.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-600">
                      Select up to 5 time slots so the admin can choose the best option.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
                    {[...selectedSlots]
                      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                      .map(slot => (
                        <div
                          key={slot.startTime.toISOString()}
                          className="flex items-start justify-between gap-3 rounded-md border border-gray-100 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {format(slot.startTime, 'EEE, MMM d')}
                            </p>
                            <p className="truncate text-xs text-gray-600">
                              {format(slot.startTime, 'h:mm a')} -{' '}
                              {format(addMinutes(slot.startTime, slot.duration), 'h:mm a')} •{' '}
                              {slot.duration} min
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlots(prev =>
                                prev.filter(s => s.startTime.getTime() !== slot.startTime.getTime())
                              );
                              setBookingError(null);
                            }}
                            className="flex-shrink-0 text-gray-400 transition-colors hover:text-red-600"
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
          <div className="p-6 lg:w-2/3 lg:p-8">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Select a Date & Time</h3>

            {/* Selected Slots Summary & Submit Button - Top CTA */}
            <div className="mb-6 flex w-full justify-end">
              <Button
                onClick={handleConfirmBooking}
                disabled={selectedSlots.length < 2}
                className="h-12 bg-[#00A8FF] px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#0090D9] disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {selectedSlots.length < 2
                      ? 'Select 2+ Slots'
                      : shouldShowCancellationWarning
                        ? 'Review & Reschedule'
                        : 'Review & Submit'}
                  </span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </div>
              </Button>
            </div>

            {/* Error Message */}
            {bookingError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Booking Failed</p>
                    <p className="mt-1 text-sm text-red-700">{bookingError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Layout: Calendar + Timezone | Time Slots */}
            <div className="flex h-full flex-col items-start gap-8 lg:flex-row">
              {/* Left Column - Calendar & Timezone */}
              <div className="h-full flex-shrink-0 space-y-5">
                {/* Calendar */}
                <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={getDisabledDates}
                    defaultMonth={selectedDate}
                    showOutsideDays={false}
                    className="w-full rounded-lg border-0 p-0"
                    classNames={{
                      root: 'self-center',
                      months: 'flex flex-col',
                      month: 'space-y-3 w-full',
                      caption: 'flex justify-center pt-1 relative items-center mb-3',
                      caption_label: 'text-base font-semibold text-gray-900',
                      nav: 'space-x-1 flex items-center',
                      nav_button: cn(
                        'h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md transition-colors'
                      ),
                      nav_button_previous: 'absolute left-1',
                      nav_button_next: 'absolute right-1',
                      table: 'w-full border-collapse',
                      head_row: 'flex mb-2',
                      head_cell: 'text-gray-500 rounded-md w-10 font-medium text-xs py-2',
                      row: 'flex w-full mb-1',
                      cell: 'h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                      day: cn(
                        'h-10 w-10 p-0 font-medium rounded-lg transition-all hover:bg-gray-100',
                        'data-[selected-single=true]:bg-[#00A8FF] data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-[#0090D9] data-[selected-single=true]:shadow-md',
                        'data-[disabled=true]:text-gray-300 data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:hover:bg-transparent'
                      ),
                      day_range_end: 'day-range-end',
                      day_selected:
                        'bg-[#00A8FF] text-white hover:bg-[#0090D9] hover:text-white focus:bg-[#00A8FF] focus:text-white',
                      day_today:
                        'bg-gray-50 text-gray-900 font-semibold border border-gray-300 data-[selected-single=true]:bg-[#00A8FF] data-[selected-single=true]:text-white data-[selected-single=true]:border-transparent',
                      day_outside: 'day-outside text-gray-400 opacity-50',
                      day_disabled: 'text-gray-300 opacity-40 cursor-not-allowed',
                      day_range_middle: 'aria-selected:bg-gray-50 aria-selected:text-gray-900',
                      day_hidden: 'invisible',
                    }}
                    components={{
                      Chevron: ({ orientation }) => {
                        if (orientation === 'left') {
                          return <ChevronLeft className="h-4 w-4" />;
                        }
                        return <ChevronRight className="h-4 w-4" />;
                      },
                    }}
                  />
                </div>

                {/* Selected Date Display */}
                {selectedDate && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Time Slots */}
              <div className="flex max-h-[33.5rem] min-w-0 flex-1 flex-col items-start">
                {loading ? (
                  <div className="flex w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-16">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#00A8FF]" />
                    <p className="text-sm text-gray-600">Loading available times...</p>
                  </div>
                ) : selectedDate ? (
                  <div className="w-full flex-1 overflow-y-scroll rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-3">
                      {availableTimeSlots.map((time, index) => {
                        const isAvailable = isTimeAvailable(
                          time,
                          selectedDuration,
                          existingSlots,
                          application.bookedSlot
                        );
                        const isSelected = selectedSlots.some(
                          s => s.startTime.getTime() === time.getTime()
                        );
                        const isPastTime = isPast(time);

                        // Check if this time matches the current user's booked slot
                        // Check both by ID match in existingSlots AND by time match with application.bookedSlot
                        const currentUserBookedSlotMatch = (() => {
                          if (!application.bookedSlot) return undefined;

                          const bookedSlotStart = parseDate(application.bookedSlot.startTime);
                          if (!bookedSlotStart) return undefined;

                          // First, try to find by ID in existingSlots (most reliable)
                          const matchById = existingSlots.find(
                            slot => slot.id === application.bookedSlot!.id
                          );
                          if (matchById) {
                            // Verify the time matches
                            const slotStart = new Date(matchById.startTime);
                            if (time.getTime() === slotStart.getTime()) {
                              return matchById;
                            }
                          }

                          // Fallback: check if time matches booked slot time (in case ID matching fails)
                          if (time.getTime() === bookedSlotStart.getTime()) {
                            // Check if there's a slot in existingSlots that matches this time
                            const matchByTime = existingSlots.find(slot => {
                              const slotStart = new Date(slot.startTime);
                              return slotStart.getTime() === time.getTime() && slot.isBooked;
                            });
                            if (matchByTime && matchByTime.id === application.bookedSlot.id) {
                              return matchByTime;
                            }
                            // If no match found but time matches, it might be the booked slot on a different date
                            // Return undefined to avoid false positives
                          }

                          return undefined;
                        })();

                        // Check if this time conflicts with any BOOKED slot (excluding current user's)
                        // Also check for exact time matches to show "Booked" tag
                        const conflictingSlot = existingSlots.find(slot => {
                          if (!slot.isBooked) return false;
                          // Exclude current user's booked slot
                          if (application.bookedSlot && slot.id === application.bookedSlot.id)
                            return false;

                          const slotStart = new Date(slot.startTime);
                          const slotEnd = new Date(slot.endTime);
                          const endTime = addMinutes(time, selectedDuration);

                          // Check for any overlap or exact match
                          // Time slots conflict if:
                          // 1. Exact start time match (most important - show "Booked" tag)
                          // 2. Selected time starts during existing slot
                          // 3. Selected time ends during existing slot
                          // 4. Selected time completely contains existing slot
                          // 5. Existing slot completely contains selected time
                          // 6. Overlaps with existing slot
                          return (
                            time.getTime() === slotStart.getTime() || // Exact start time match
                            (time >= slotStart && time < slotEnd) || // Starts during existing slot
                            (endTime > slotStart && endTime <= slotEnd) || // Ends during existing slot
                            (time <= slotStart && endTime >= slotEnd) || // Completely contains existing slot
                            (time < slotStart && endTime > slotStart) // Overlaps with existing slot
                          );
                        });

                        // Also check if there's a booked slot at this exact time (for display purposes)
                        // This ensures we show "Booked" tag even if durations don't match exactly
                        const bookedSlotAtTime = existingSlots.find(slot => {
                          if (!slot.isBooked) return false;
                          // Exclude current user's booked slot
                          if (application.bookedSlot && slot.id === application.bookedSlot.id)
                            return false;

                          const slotStart = new Date(slot.startTime);
                          // Check for exact time match
                          return time.getTime() === slotStart.getTime();
                        });

                        // For display only: show if this time is requested by someone else
                        const overlapsWith = (slot: { startTime: Date; endTime: Date }) => {
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
                          slot =>
                            !slot.isBooked &&
                            slot.status === 'REQUESTED' &&
                            slot.isCurrentUserRequested &&
                            overlapsWith(slot)
                        );
                        const isCurrentUserRequestedOverlap =
                          !!requestedOverlapSlot?.isCurrentUserRequested;

                        // Determine if this slot should be disabled
                        // Current user's booked slot should be shown but not selectable
                        // Use bookedSlotAtTime for display, conflictingSlot for conflict detection
                        const bookedSlotToShow = bookedSlotAtTime || conflictingSlot;
                        const isDisabled =
                          !isAvailable ||
                          isPastTime ||
                          !!conflictingSlot ||
                          !!currentUserBookedSlotMatch;

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;

                              if (isSelected) {
                                setSelectedSlots(prev =>
                                  prev.filter(s => s.startTime.getTime() !== time.getTime())
                                );
                                setBookingError(null);
                                return;
                              }

                              setSelectedSlots(prev => {
                                if (prev.length >= 5) {
                                  setBookingError('You can select up to 5 time slots.');
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
                              'relative w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                              isSelected
                                ? 'bg-[#00A8FF] text-white shadow-md ring-2 ring-[#00A8FF] ring-offset-1'
                                : currentUserBookedSlotMatch
                                  ? 'cursor-not-allowed border-2 border-[#0090D9] bg-[#00A8FF] text-white opacity-95 shadow-lg'
                                  : !isAvailable || isPastTime || conflictingSlot
                                    ? conflictingSlot
                                      ? 'cursor-not-allowed border-2 border-gray-500 bg-gray-400 text-white opacity-90 shadow-lg'
                                      : 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400 opacity-60'
                                    : 'border border-gray-300 bg-white text-[#00A8FF] hover:border-[#00A8FF] hover:bg-blue-50 hover:shadow-sm'
                            )}
                            title={
                              currentUserBookedSlotMatch
                                ? 'This is your confirmed interview slot'
                                : bookedSlotToShow
                                  ? 'This time slot is already booked by another user'
                                  : isPastTime
                                    ? 'This time has passed'
                                    : ''
                            }
                          >
                            <span className="flex w-full items-center justify-between">
                              <span>{format(time, 'h:mm a')}</span>
                              {currentUserBookedSlotMatch ? (
                                <span className="rounded-md border border-[#0078B8] bg-[#0090D9] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                                  Your Booking
                                </span>
                              ) : bookedSlotToShow ? (
                                <span className="rounded-md border border-gray-600 bg-gray-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                                  Booked
                                </span>
                              ) : requestedOverlapSlot ? (
                                <span
                                  className={cn(
                                    'rounded-md border px-2.5 py-1 text-xs font-bold shadow-sm',
                                    isCurrentUserRequestedOverlap
                                      ? 'border-[#0090D9] bg-[#00A8FF] text-white'
                                      : 'border-blue-200 bg-blue-50 text-blue-800'
                                  )}
                                >
                                  {isCurrentUserRequestedOverlap ? 'Your Selection' : 'Requested'}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
                    <CalendarIcon className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">Please select a date first</p>
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
