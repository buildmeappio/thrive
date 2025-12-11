"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addMinutes, isPast, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { getAvailableSlots } from "../actions/getAvailableSlots";
import { bookInterviewSlot } from "../actions/bookInterviewSlot";
import { rescheduleInterviewSlot } from "../actions/rescheduleInterviewSlot"; 
import { Loader2, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DURATION_OPTIONS = [30, 45, 60]; // minutes only

interface InterviewCalendarProps {
  token: string;
  applicationId: string;
  firstName?: string;
  lastName?: string;
  bookedSlot?: {
    id: string;
    startTime: Date | string;
    endTime: Date | string;
  };
}

const InterviewCalendar = ({
  token,
  applicationId: _applicationId,
  firstName: _firstName,
  lastName: _lastName,
  bookedSlot: initialBookedSlot,
}: InterviewCalendarProps) => {
  const router = useRouter();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Initialize from booked slot if available
  const getInitialState = () => {
    if (initialBookedSlot) {
      const startTime = typeof initialBookedSlot.startTime === 'string' 
        ? new Date(initialBookedSlot.startTime) 
        : initialBookedSlot.startTime;
      const endTime = typeof initialBookedSlot.endTime === 'string' 
        ? new Date(initialBookedSlot.endTime) 
        : initialBookedSlot.endTime;
      
      const date = startOfDay(startTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      return {
        date,
        time: startTime,
        duration: duration || 30,
      };
    }
    
    return {
      date: startOfDay(tomorrow),
      time: null as Date | null,
      duration: 30,
    };
  };

  const initialState = getInitialState();
  
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(initialState.date);
  const [selectedTime, setSelectedTime] = React.useState<Date | null>(initialState.time);
  const [selectedDuration, setSelectedDuration] = React.useState<number>(initialState.duration);
  const [selectedTimezone] = React.useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [existingSlots, setExistingSlots] = React.useState<Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    status: string;
    isBooked: boolean;
  }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [booking, setBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  // Track if we're initializing from booked slot
  const [isInitializing, setIsInitializing] = React.useState(!!initialBookedSlot);

  // Fetch time suggestions for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      // Only reset selectedTime if we're not initializing from a booked slot
      if (!isInitializing) {
        setSelectedTime(null);
      }
      setBookingError(null);
      try {
        const result = await getAvailableSlots(selectedDate);
        if (result.success) {
          setExistingSlots(
            result.existingSlots.map((slot: {
              id: string;
              startTime: Date | string;
              endTime: Date | string;
              duration: number;
              status: string;
              isBooked: boolean;
            }) => ({
              ...slot,
              startTime: typeof slot.startTime === 'string' 
                ? new Date(slot.startTime) 
                : slot.startTime,
              endTime: typeof slot.endTime === 'string' 
                ? new Date(slot.endTime) 
                : slot.endTime,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    };

    fetchSlots();
  }, [selectedDate, isInitializing]);

  // Generate time slots dynamically based on selected duration
  const generateTimeSlots = React.useMemo(() => {
    if (!selectedDate) return [];

    const slots: Date[] = [];
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    let currentTime = new Date(dayStart);
    // Start from 12 AM
    currentTime.setHours(0, 0, 0, 0);

    // Generate slots until 11:59 PM
    while (currentTime.getHours() <= 23 && currentTime.getMinutes() <= 59) {
      const slotTime = new Date(currentTime);
      slots.push(slotTime);
      currentTime = addMinutes(currentTime, selectedDuration);
    }

    return slots;
  }, [selectedDate, selectedDuration]);

  // Check if a time slot conflicts with existing bookings
  const isTimeAvailable = (time: Date, duration: number): boolean => {
    const endTime = addMinutes(time, duration);
    
    // Check if time is in the past
    if (isPast(time)) {
      return false;
    }

    // Check if it conflicts with existing booked slots
    return !existingSlots.some((slot) => {
      if (!slot.isBooked) return false;
      
      // If this is the current user's booked slot, allow it
      if (initialBookedSlot && slot.id === initialBookedSlot.id) {
        return false;
      }
      
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      
      // Check for any overlap
      return (
        (time >= slotStart && time < slotEnd) ||
        (endTime > slotStart && endTime <= slotEnd) ||
        (time <= slotStart && endTime >= slotEnd)
      );
    });
  };

  // Check if a time slot is the current user's booked slot
  const checkIsCurrentUserSlot = (time: Date): boolean => {
    if (!initialBookedSlot || !selectedTime) return false;
    const bookedStart = typeof initialBookedSlot.startTime === 'string' 
      ? new Date(initialBookedSlot.startTime) 
      : initialBookedSlot.startTime;
    return time.getTime() === bookedStart.getTime();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dayStart = startOfDay(date);
      // Only allow dates from tomorrow onwards
      const tomorrow = startOfDay(new Date());
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (dayStart >= tomorrow) {
        setSelectedDate(dayStart);
        // Preserve selectedTime if it's on the same date and we have a booked slot
        if (initialBookedSlot && selectedTime) {
          const bookedDate = startOfDay(
            typeof initialBookedSlot.startTime === 'string' 
              ? new Date(initialBookedSlot.startTime) 
              : initialBookedSlot.startTime
          );
          if (dayStart.getTime() === bookedDate.getTime()) {
            // Keep the selectedTime if it's the same date
            setBookingError(null);
            return;
          }
        }
        setSelectedTime(null);
        setBookingError(null);
      }
    }
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
    setBookingError(null);
  };

  const handleBackToSelection = () => {
    setShowConfirmation(false);
  };

  const handleBookSlot = async () => {
    if (!selectedTime) return;

    setBooking(true);
    setBookingError(null);

    try {
      // Use reschedule if there's already a booked slot, otherwise book new
      const result = initialBookedSlot
        ? await rescheduleInterviewSlot(token, selectedTime, selectedDuration)
        : await bookInterviewSlot(token, selectedTime, selectedDuration);
        
      if (result.success && result.slot) {
        // Navigate to success page
        router.push(`/schedule-interview/success?token=${encodeURIComponent(token)}`);
      } else {
        // Handle specific error messages better
        const errorMessage = result.error || "Failed to book slot";
        if (errorMessage.includes("already booked")) {
          setBookingError("This time slot is already booked. Please select another time.");
        } else if (errorMessage.includes("conflicts")) {
          setBookingError("This time slot conflicts with an existing booking. Please select another time.");
        } else {
          setBookingError(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to book slot";
      if (errorMessage.includes("already booked")) {
        setBookingError("This time slot is already booked. Please select another time.");
      } else if (errorMessage.includes("conflicts")) {
        setBookingError("This time slot conflicts with an existing booking. Please select another time.");
      } else {
        setBookingError(errorMessage);
      }
    } finally {
      setBooking(false);
    }
  };

  // Get disabled dates (past dates and dates beyond 6 months)
  const getDisabledDates = (date: Date) => {
    const tomorrow = startOfDay(new Date());
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
    return date < tomorrow || date > sixMonthsLater;
  };

  // Confirmation State
  if (showConfirmation && selectedTime) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Your Interview
            </h2>
            <p className="text-gray-600 mb-8">
              Please review the details below before confirming
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {format(selectedTime, "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4 border-t border-blue-200">
                    <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Time</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {format(selectedTime, "h:mm a")} - {format(addMinutes(selectedTime, selectedDuration), "h:mm a")}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedDuration} minutes • {selectedTimezone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">Booking Failed</p>
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
                disabled={booking}
                className="flex-1 h-12 bg-[#00A8FF] hover:bg-[#0090D9] text-white font-semibold"
              >
                {booking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    {initialBookedSlot ? "Reschedule Interview" : "Confirm Booking"}
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
                  <span className="text-sm font-medium">{selectedDuration} min</span>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">Select Duration</p>
                <div className="md:space-y-3 flex flex-row md:flex-col space-x-4">
                  {DURATION_OPTIONS.map((duration) => {
                    const isSelected = selectedDuration === duration;
                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => {
                          setSelectedDuration(duration);
                          setSelectedTime(null);
                          setBookingError(null);
                        }}
                        className={cn(
                          "w-full py-3 h-12 md:h-auto flex items-center justify-start px-4 rounded-lg font-medium text-sm transition-all duration-200 text-left border-2",
                          isSelected
                            ? "bg-[#00A8FF] text-white shadow-md border-[#00A8FF]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#00A8FF] hover:bg-blue-50"
                        )}
                      >
                        {duration} minutes
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel - Calendar & Time Selection */}
          <div className="lg:w-2/3 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Select a Date & Time
            </h3>

            {/* Selected Time Summary & Confirm Button - Top CTA */}
            {selectedTime && (
              <div className="mb-6">
                <Button
                  onClick={handleConfirmBooking}
                  className="w-full h-14 bg-[#00A8FF] hover:bg-[#0090D9] text-white font-semibold shadow-lg text-base"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-semibold">
                          {format(selectedTime, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm font-normal opacity-90">
                          {format(selectedTime, "h:mm a")} - {format(addMinutes(selectedTime, selectedDuration), "h:mm a")} • {selectedDuration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{initialBookedSlot ? "Reschedule Interview" : "Confirm Booking"}</span>
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
                    <p className="font-semibold text-red-900 text-sm">Booking Failed</p>
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
                      caption: "flex justify-center pt-1 relative items-center mb-3",
                      caption_label: "text-base font-semibold text-gray-900",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md transition-colors"
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex mb-2",
                      head_cell: "text-gray-500 rounded-md w-10 font-medium text-xs py-2",
                      row: "flex w-full mb-1",
                      cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: cn(
                        "h-10 w-10 p-0 font-medium rounded-lg transition-all hover:bg-gray-100",
                        "data-[selected-single=true]:bg-[#00A8FF] data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-[#0090D9] data-[selected-single=true]:shadow-md",
                        "data-[disabled=true]:text-gray-300 data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:hover:bg-transparent"
                      ),
                      day_range_end: "day-range-end",
                      day_selected: "bg-[#00A8FF] text-white hover:bg-[#0090D9] hover:text-white focus:bg-[#00A8FF] focus:text-white",
                      day_today: "bg-gray-50 text-gray-900 font-semibold border border-gray-300 data-[selected-single=true]:bg-[#00A8FF] data-[selected-single=true]:text-white data-[selected-single=true]:border-transparent",
                      day_outside: "day-outside text-gray-400 opacity-50",
                      day_disabled: "text-gray-300 opacity-40 cursor-not-allowed",
                      day_range_middle: "aria-selected:bg-gray-50 aria-selected:text-gray-900",
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
                    <p className="text-gray-600 text-sm">Loading available times...</p>
                  </div>
                ) : selectedDate ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 w-full flex-1 overflow-y-scroll">
                    <div className="flex flex-col gap-3">
                      {generateTimeSlots.map((time, index) => {
                        const isAvailable = isTimeAvailable(time, selectedDuration);
                        const isSelected = selectedTime?.getTime() === time.getTime();
                        const isPastTime = isPast(time);
                        const isCurrentUserBookedSlot = checkIsCurrentUserSlot(time);
                        
                        // Check if this time conflicts with any booked slot
                        const conflictingSlot = existingSlots.find((slot) => {
                          if (!slot.isBooked) return false;
                          if (isCurrentUserBookedSlot && slot.id === initialBookedSlot?.id) return false;
                          
                          const slotStart = new Date(slot.startTime);
                          const slotEnd = new Date(slot.endTime);
                          const endTime = addMinutes(time, selectedDuration);
                          
                          return (
                            (time >= slotStart && time < slotEnd) ||
                            (endTime > slotStart && endTime <= slotEnd) ||
                            (time <= slotStart && endTime >= slotEnd)
                          );
                        });

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={!isAvailable || isPastTime || !!conflictingSlot}
                            onClick={() => {
                              if (isAvailable && !isPastTime && !conflictingSlot) {
                                setSelectedTime(time);
                                setBookingError(null);
                              }
                            }}
                            className={cn(
                              "w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 text-left relative",
                              isSelected
                                ? "bg-[#00A8FF] text-white shadow-md ring-2 ring-[#00A8FF] ring-offset-1"
                                : !isAvailable || isPastTime || conflictingSlot
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-60 border border-gray-200"
                                : "bg-white text-[#00A8FF] border border-gray-300 hover:border-[#00A8FF] hover:bg-blue-50 hover:shadow-sm"
                            )}
                            title={conflictingSlot ? "This time slot is already booked" : isPastTime ? "This time has passed" : ""}
                          >
                            <span className="flex items-center justify-between">
                              <span>{format(time, "h:mm a")}</span>
                              {conflictingSlot && (
                                <span className="text-xs opacity-75">Booked</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center w-full">
                    <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
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
}

export default InterviewCalendar;