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
  DayAvailability,
  ExaminerAvailabilityOption,
  SlotAvailability,
} from '../types/examinerAvailability';
import type { ExaminerOptionsProps } from '../types/examinerOptions';
import {
  filterDaysWithSlots,
  getDaysToShow,
  formatTime,
  formatSqlDate,
  isPastDate,
} from '../services/dateTimeSlot.service';
import {
  isExistingBookingSlot,
  getExaminersForSlot,
  createSelectedAppointment,
} from '../services/appointmentSelection.service';
import { getTimeSlotsForAvailability, getAutoSelection } from '../handlers/processAvailabilityData';
import ExaminerOptionsMobile from './ExaminerOptionsMobile';
import { DEFAULT_SETTINGS, MAX_DAYS_TO_SHOW } from '../types/examinerAvailability';

const ExaminerOptions: React.FC<ExaminerOptionsProps> = ({
  examId,
  caseId,
  onSelectAppointment,
  existingBooking,
  initialAvailabilityData,
  initialError,
}) => {
  const availabilityData = initialAvailabilityData || null;
  const errorMessage = initialError || null;
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

  // Get settings from availabilityData (from admin config) or fallback to DEFAULT_SETTINGS
  const settings = availabilityData?.settings || DEFAULT_SETTINGS;

  // Generate time slots - MUST be before early returns
  const timeSlotsArray = useMemo(
    () => getTimeSlotsForAvailability(availabilityData, settings),
    [availabilityData, settings]
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
      <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
        <div className="py-8 text-center text-[28px] font-semibold leading-[100%] tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
          Choose Your Appointment
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="max-w-2xl rounded-lg border-2 border-red-200 bg-red-50 p-6">
            <div className="mb-2 text-lg font-semibold text-red-800">
              Unable to Load Availability
            </div>
            <div className="whitespace-pre-line text-base text-red-700">{errorMessage}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!availabilityData || availabilityData.days.length === 0) {
    return (
      <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
        <div className="py-8 text-center text-[28px] font-semibold leading-[100%] tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
          Choose Your Appointment
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">
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
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <ExaminerOptionsMobile
          examId={examId}
          caseId={caseId}
          onSelectAppointment={onSelectAppointment}
          existingBooking={existingBooking}
          initialAvailabilityData={initialAvailabilityData}
          initialError={initialError}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="mx-auto mb-16 w-full max-w-full p-4 sm:px-8">
          <div className="py-8 text-center text-[28px] font-semibold leading-[100%] tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
            Choose Your Appointment
          </div>

          {timeSlotsArray.length > 0 ? (
            <div className="w-full overflow-hidden">
              <div className="mx-auto w-full">
                <table className="w-full border-collapse" style={{ tableLayout: 'auto' }}>
                  <colgroup>
                    <col style={{ width: '100px', minWidth: '100px' }} />
                    {daysToShow.map((_, index) => (
                      <col key={index} style={{ minWidth: '180px', width: 'auto' }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 bg-white px-2 py-2"></th>
                      <th colSpan={daysToShow.length} className="px-2 py-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={!canGoPrevious}
                            className={`flex items-center justify-center rounded-lg px-3 py-2 transition-all ${
                              canGoPrevious
                                ? 'bg-[#000093] text-white shadow-md hover:bg-[#000080] hover:shadow-lg'
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
                                ? 'bg-[#000093] text-white shadow-md hover:bg-[#000080] hover:shadow-lg'
                                : 'cursor-not-allowed bg-gray-200 text-gray-400'
                            }`}
                            aria-label="Next dates"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <th className="sticky left-0 z-20 bg-white px-2 py-3 text-left text-sm font-semibold text-gray-700 shadow-sm">
                        Time
                      </th>
                      {daysToShow.map((day, dayIndex) => {
                        const isPast = isPastDate(day.date);
                        return (
                          <th
                            key={dayIndex}
                            onClick={() => !isPast && handleDateClick(dayIndex)}
                            className={`px-2 py-3 text-center text-xs font-semibold transition-colors sm:text-sm ${
                              isPast
                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                : selectedDateIndex === dayIndex
                                  ? 'cursor-pointer bg-[#000093] text-white'
                                  : 'cursor-pointer text-gray-700 hover:bg-gray-100'
                            }`}
                            title={isPast ? 'This date has passed' : undefined}
                          >
                            {formatSqlDate(day.date)}
                            {isPast && <span className="ml-1 text-[10px]">(Past)</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlotsArray.map((timeSlot, timeIndex) => (
                      <tr key={timeIndex} className="border-b border-gray-200">
                        <td
                          onClick={() => handleTimeClick(timeSlot)}
                          className={`sticky left-0 z-10 cursor-pointer px-2 py-3 text-sm font-medium shadow-sm transition-colors ${
                            selectedTimeSlot && selectedTimeSlot.start.getHours() === timeSlot.hour
                              ? 'bg-[#000093] text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {formatTime(timeSlot.start)}
                        </td>
                        {daysToShow.map((day, dayIndex) => {
                          const result = getExaminersForSlot(day, timeSlot.hour);
                          const examiners = result?.examiners;
                          const matchingSlot = result?.slot;
                          const isPast = isPastDate(day.date);

                          return (
                            <td
                              key={dayIndex}
                              onClick={() => {
                                if (!isPast) {
                                  handleDateClick(dayIndex);
                                  handleTimeClick(timeSlot);
                                }
                              }}
                              className={`p-2.5 ${
                                isPast
                                  ? 'cursor-not-allowed bg-gray-50 opacity-60'
                                  : selectedDateIndex === dayIndex &&
                                      selectedTimeSlot &&
                                      selectedTimeSlot.start.getHours() === timeSlot.hour
                                    ? 'cursor-pointer ring-2 ring-[#000093] ring-offset-2'
                                    : 'cursor-pointer'
                              }`}
                            >
                              {examiners && examiners.length > 0 && matchingSlot ? (
                                <div className="space-y-2">
                                  {examiners.map(examiner => {
                                    const isPreviousBooking = isExistingBookingSlot(
                                      day,
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
                                            handleSlotSelection(examiner, matchingSlot, day);
                                          }
                                        }}
                                        className={`relative overflow-visible rounded-lg border-2 p-3 shadow-md transition-all duration-200 ${
                                          isPast
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'cursor-pointer hover:shadow-lg'
                                        } ${
                                          isPreviousBooking
                                            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50 ring-2 ring-blue-300 ring-offset-1'
                                            : 'border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50'
                                        }`}
                                      >
                                        {isPreviousBooking && (
                                          <div className="absolute -right-2 -top-2 z-10">
                                            <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-md">
                                              Booking
                                            </span>
                                          </div>
                                        )}
                                        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                                          {examiner.clinic && (
                                            <div className="flex min-w-0 max-w-[280px] items-center space-x-1">
                                              <MapPin className="h-3 w-3 flex-shrink-0 text-[#000093]" />
                                              <p className="break-words text-[10px] font-medium text-gray-900">
                                                {examiner.clinic}
                                              </p>
                                            </div>
                                          )}
                                          {examiner.specialty && (
                                            <div className="flex flex-shrink-0 items-center space-x-1">
                                              <Star className="h-3 w-3 flex-shrink-0 text-[#000093]" />
                                              <p className="whitespace-nowrap text-[10px] font-medium text-gray-900">
                                                {examiner.specialty}
                                              </p>
                                            </div>
                                          )}
                                          {/* Only show interpreter if required by examination */}
                                          {availabilityData?.serviceRequirements
                                            ?.interpreterRequired && (
                                            <div className="flex items-center space-x-1">
                                              <Languages className="h-3 w-3 flex-shrink-0 text-[#000093]" />
                                              <p className="text-[10px] font-medium text-gray-900">
                                                Interpreter:{' '}
                                                {examiner.interpreters &&
                                                examiner.interpreters.length > 0
                                                  ? examiner.interpreters[0].companyName
                                                  : 'Not Available'}
                                              </p>
                                            </div>
                                          )}
                                          {/* Only show transport if required by examination */}
                                          {availabilityData?.serviceRequirements
                                            ?.transportRequired && (
                                            <div className="flex items-center space-x-1">
                                              <Car className="h-3 w-3 flex-shrink-0 text-[#000093]" />
                                              <p className="text-[10px] font-medium text-gray-900">
                                                Transport:{' '}
                                                {examiner.transporters &&
                                                examiner.transporters.length > 0
                                                  ? examiner.transporters[0].companyName
                                                  : 'Not Available'}
                                              </p>
                                            </div>
                                          )}
                                          {/* Only show chaperone if support_person is true */}
                                          {availabilityData?.serviceRequirements
                                            ?.chaperoneRequired && (
                                            <div className="flex items-center space-x-1">
                                              <UserPlus className="h-3 w-3 flex-shrink-0 text-[#000093]" />
                                              <p className="text-[10px] font-medium text-gray-900">
                                                Chaperone:{' '}
                                                {examiner.chaperones &&
                                                examiner.chaperones.length > 0
                                                  ? `${examiner.chaperones[0].firstName} ${examiner.chaperones[0].lastName}`
                                                  : 'Not Available'}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex justify-center">
                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              if (!isPast) {
                                                handleSlotSelection(examiner, matchingSlot, day);
                                              }
                                            }}
                                            disabled={isPast}
                                            className={`flex items-center justify-center space-x-1 rounded-full px-3 py-1 text-[10px] font-medium transition-colors duration-200 ${
                                              isPast
                                                ? 'cursor-not-allowed bg-gray-400 text-gray-200'
                                                : 'cursor-pointer bg-[#000080] text-white hover:bg-[#000093]'
                                            }`}
                                          >
                                            <span>{isPast ? 'Past Date' : 'Select'}</span>
                                            {!isPast && <ArrowRight className="h-2.5 w-2.5" />}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-[10px] text-gray-400">
                                  Not Available
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">No available time slots found.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExaminerOptions;
