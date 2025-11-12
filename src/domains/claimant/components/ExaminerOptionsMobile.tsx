'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Star,
  MapPin,
  Car,
  UserPlus,
  Languages,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  AvailableExaminersResult,
  DayAvailability,
  ExaminerAvailabilityOption,
  SlotAvailability,
} from '../types/examinerAvailability';
import type { ExaminerOptionsProps } from '../types/examinerOptions';
import {
  filterDaysWithSlots,
  getDaysToShow,
  formatTime,
  isPastDate,
} from '../services/dateTimeSlot.service';
import {
  isExistingBookingSlot,
  getExaminersForSlot,
  createSelectedAppointment,
} from '../services/appointmentSelection.service';
import { getTimeSlotsForAvailability, getAutoSelection } from '../handlers/processAvailabilityData';
import { DEFAULT_SETTINGS, MAX_DAYS_TO_SHOW } from '../types/examinerAvailability';

const ExaminerOptionsMobile: React.FC<ExaminerOptionsProps> = ({
  onSelectAppointment,
  existingBooking,
  initialAvailabilityData,
  initialError,
}) => {
  const [availabilityData] = useState<AvailableExaminersResult | null>(
    initialAvailabilityData || null
  );
  const [errorMessage] = useState<string | null>(initialError || null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [dateOffset, setDateOffset] = useState<number>(0);
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false);

  // Show error toast if initial error is provided
  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  // Generate time slots - MUST be before early returns
  const timeSlotsArray = useMemo(
    () => getTimeSlotsForAvailability(availabilityData, DEFAULT_SETTINGS),
    [availabilityData]
  );

  // Auto-select middle date and first time slot - MUST be before early returns
  useEffect(() => {
    if (availabilityData && !hasAutoSelected && dateOffset === 0) {
      const autoSelection = getAutoSelection(availabilityData, timeSlotsArray, MAX_DAYS_TO_SHOW);
      if (autoSelection) {
        setSelectedDateIndex(autoSelection.dateIndex);
        setSelectedTimeSlot(autoSelection.timeSlot);
        setHasAutoSelected(true);
      }
    }
  }, [availabilityData, hasAutoSelected, dateOffset, timeSlotsArray]);

  // Early returns for error and empty states
  if (errorMessage) {
    return (
      <div className="mx-auto mb-16 w-full p-4">
        <div className="py-6 text-center text-2xl font-semibold">Choose Your Appointment</div>
        <div className="flex items-center justify-center py-8">
          <div className="max-w-2xl rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <div className="mb-2 text-base font-semibold text-red-800">
              Unable to Load Availability
            </div>
            <div className="text-sm text-red-700">{errorMessage}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!availabilityData || availabilityData.days.length === 0) {
    return (
      <div className="mx-auto mb-16 w-full p-4">
        <div className="py-6 text-center text-2xl font-semibold">Choose Your Appointment</div>
        <div className="flex items-center justify-center py-8">
          <div className="text-base text-gray-600">
            No available examiners found for this examination.
          </div>
        </div>
      </div>
    );
  }

  // Compute derived data
  const daysWithSlots = filterDaysWithSlots(availabilityData.days);
  const totalDaysWithSlots = daysWithSlots.length;
  const daysToShow = getDaysToShow(daysWithSlots, dateOffset, MAX_DAYS_TO_SHOW);

  // Navigation handlers
  const handlePrevious = () => {
    if (dateOffset > 0) {
      setDateOffset(prev => prev - 1);
      if (selectedDateIndex !== null && selectedDateIndex >= daysToShow.length - 1) {
        setSelectedDateIndex(null);
        setSelectedTimeSlot(null);
      }
    }
  };

  const handleNext = () => {
    if (dateOffset + MAX_DAYS_TO_SHOW < totalDaysWithSlots) {
      setDateOffset(prev => prev + 1);
      if (selectedDateIndex !== null && selectedDateIndex === 0) {
        setSelectedDateIndex(null);
        setSelectedTimeSlot(null);
      } else if (selectedDateIndex !== null) {
        setSelectedDateIndex(Math.max(0, selectedDateIndex - 1));
      }
    }
  };

  const canGoPrevious = dateOffset > 0;
  const canGoNext =
    totalDaysWithSlots > MAX_DAYS_TO_SHOW && dateOffset + MAX_DAYS_TO_SHOW < totalDaysWithSlots;

  // Selection handlers
  const handleDateClick = (dayIndex: number) => {
    if (selectedDateIndex === dayIndex) {
      setSelectedDateIndex(null);
      setSelectedTimeSlot(null);
    } else {
      setSelectedDateIndex(dayIndex);
      setSelectedTimeSlot(null);
    }
  };

  const handleTimeClick = (timeSlot: { start: Date; end: Date }) => {
    if (selectedTimeSlot && selectedTimeSlot.start.getHours() === timeSlot.start.getHours()) {
      setSelectedTimeSlot(null);
    } else {
      setSelectedTimeSlot(timeSlot);
      if (selectedDateIndex === null) {
        const dayWithSlot = daysToShow.findIndex(day =>
          day.slots.some(slot => slot.start.getHours() === timeSlot.start.getHours())
        );
        if (dayWithSlot !== -1) {
          setSelectedDateIndex(dayWithSlot);
        }
      }
    }
  };

  const handleSlotSelection = (
    examiner: ExaminerAvailabilityOption,
    slot: SlotAvailability,
    day: DayAvailability
  ) => {
    const appointment = createSelectedAppointment(examiner, slot, day);
    onSelectAppointment(appointment);
  };

  return (
    <div className="mx-auto mb-16 w-full p-4">
      <div className="py-6 text-center text-2xl font-semibold">Choose Your Appointment</div>

      {timeSlotsArray.length > 0 ? (
        <div className="w-full">
          {/* Date Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`flex items-center justify-center rounded-lg px-3 py-2 transition-all ${
                canGoPrevious
                  ? 'bg-[#000093] text-white shadow-md'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
              aria-label="Previous dates"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className={`flex items-center justify-center rounded-lg px-3 py-2 transition-all ${
                canGoNext
                  ? 'bg-[#000093] text-white shadow-md'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
              aria-label="Next dates"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Date Selection - Horizontal Scrollable */}
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {daysToShow.map((day, dayIndex) => {
                const isPast = isPastDate(day.date);
                return (
                  <button
                    key={dayIndex}
                    onClick={() => !isPast && handleDateClick(dayIndex)}
                    disabled={isPast}
                    className={`min-w-[100px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isPast
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : selectedDateIndex === dayIndex
                          ? 'bg-[#000093] text-white'
                          : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                    title={isPast ? 'This date has passed' : undefined}
                  >
                    <div className="text-center">
                      <div className="text-[10px] font-normal">
                        {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-semibold">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {isPast && <div className="text-[9px]">(Past)</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots - Card Layout */}
          <div className="space-y-4">
            {timeSlotsArray.map((timeSlot, timeIndex) => {
              const isTimeSelected =
                selectedTimeSlot && selectedTimeSlot.start.getHours() === timeSlot.hour;
              const selectedDay = selectedDateIndex !== null ? daysToShow[selectedDateIndex] : null;

              return (
                <div key={timeIndex} className="rounded-lg border border-gray-200 bg-white p-3">
                  {/* Time Header */}
                  <button
                    onClick={() => handleTimeClick(timeSlot)}
                    className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      isTimeSelected
                        ? 'bg-[#000093] text-white'
                        : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                  >
                    {formatTime(timeSlot.start)}
                  </button>

                  {/* Examiners for Selected Date or All Dates */}
                  {selectedDay ? (
                    // Show examiners for selected date only
                    (() => {
                      const result = getExaminersForSlot(selectedDay, timeSlot.hour);
                      const examiners = result?.examiners;
                      const matchingSlot = result?.slot;
                      const isPast = isPastDate(selectedDay.date);

                      if (!examiners || examiners.length === 0 || !matchingSlot) {
                        return (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-400">
                            Not Available
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {examiners.map(examiner => {
                            const isPreviousBooking = isExistingBookingSlot(
                              selectedDay,
                              timeSlot,
                              examiner.examinerId,
                              existingBooking
                            );
                            return (
                              <div
                                key={examiner.examinerId}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (!isPast) {
                                    handleSlotSelection(examiner, matchingSlot, selectedDay);
                                  }
                                }}
                                className={`relative rounded-lg border-2 p-3 shadow-sm transition-all ${
                                  isPast
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer active:shadow-md'
                                } ${
                                  isPreviousBooking
                                    ? 'border-blue-400 from-blue-50 to-sky-50 ring-2 ring-blue-300 ring-offset-1'
                                    : 'border-purple-100 from-purple-50 to-blue-50'
                                }`}
                              >
                                {isPreviousBooking && (
                                  <div className="absolute -top-2 -right-2 z-10">
                                    <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-md">
                                      Booking
                                    </span>
                                  </div>
                                )}
                                <div className="mb-2 space-y-1.5 text-xs">
                                  {examiner.clinic && (
                                    <div className="flex items-start space-x-1">
                                      <MapPin className="mt-0.5 h-3 w-3 text-[#000093]" />
                                      <p className="text-[10px] font-medium text-gray-900">
                                        {examiner.clinic}
                                      </p>
                                    </div>
                                  )}
                                  {examiner.specialty && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-[#000093]" />
                                      <p className="text-[10px] font-medium text-gray-900">
                                        {examiner.specialty}
                                      </p>
                                    </div>
                                  )}
                                  {availabilityData?.serviceRequirements?.interpreterRequired && (
                                    <div className="flex items-center space-x-1">
                                      <Languages className="h-3 w-3 text-[#000093]" />
                                      <p className="text-[10px] font-medium text-gray-900">
                                        Interpreter:{' '}
                                        {examiner.interpreters && examiner.interpreters.length > 0
                                          ? examiner.interpreters[0].companyName
                                          : 'Not Available'}
                                      </p>
                                    </div>
                                  )}
                                  {availabilityData?.serviceRequirements?.transportRequired && (
                                    <div className="flex items-center space-x-1">
                                      <Car className="h-3 w-3 text-[#000093]" />
                                      <p className="text-[10px] font-medium text-gray-900">
                                        Transport:{' '}
                                        {examiner.transporters && examiner.transporters.length > 0
                                          ? examiner.transporters[0].companyName
                                          : 'Not Available'}
                                      </p>
                                    </div>
                                  )}
                                  {availabilityData?.serviceRequirements?.chaperoneRequired && (
                                    <div className="flex items-center space-x-1">
                                      <UserPlus className="h-3 w-3 text-[#000093]" />
                                      <p className="text-[10px] font-medium text-gray-900">
                                        Chaperone:{' '}
                                        {examiner.chaperones && examiner.chaperones.length > 0
                                          ? `${examiner.chaperones[0].firstName} ${examiner.chaperones[0].lastName}`
                                          : 'Not Available'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (!isPast) {
                                      handleSlotSelection(examiner, matchingSlot, selectedDay);
                                    }
                                  }}
                                  disabled={isPast}
                                  className={`mt-2 flex w-full items-center justify-center space-x-1 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
                                    isPast
                                      ? 'cursor-not-allowed bg-gray-400 text-gray-200'
                                      : 'bg-[#000080] text-white active:bg-[#000093]'
                                  }`}
                                >
                                  <span>{isPast ? 'Past Date' : 'Select'}</span>
                                  {!isPast && <ArrowRight className="h-3 w-3" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                    // Show message to select a date
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
                      Select a date above to view available examiners
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-base text-gray-600">No available time slots found.</div>
        </div>
      )}
    </div>
  );
};

export default ExaminerOptionsMobile;
