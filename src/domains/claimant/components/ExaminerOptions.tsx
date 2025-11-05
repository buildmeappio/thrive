'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, MapPin, Car, UserPlus, Languages } from 'lucide-react';
import { getAvailableExaminers } from '../actions';
import { toast } from 'sonner';
import type {
  AvailableExaminersResult,
  DayAvailability,
  ExaminerAvailabilityOption,
  SlotAvailability,
} from '../types/examinerAvailability';
import { format } from 'date-fns';

// Use the actual type from the types file
type ExaminerOption = ExaminerAvailabilityOption;

interface SelectedAppointment {
  examinerId: string;
  examinerName: string;
  date: Date;
  slotStart: Date;
  slotEnd: Date;
  specialty?: string;
}

interface ExaminerOptionsProps {
  examId: string;
  caseId: string;
  onSelectAppointment: (appointment: SelectedAppointment) => void;
  onBack?: () => void;
}

const ExaminerOptions: React.FC<ExaminerOptionsProps> = ({ examId, onSelectAppointment }) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState<AvailableExaminersResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // State for selected date and time
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Default settings - these could be made configurable
  const settings = {
    noOfDaysForWindow: 7, // Max 7 days
    numberOfWorkingHours: 8,
    startOfWorking: '09:00',
    slotDurationMinutes: 60,
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        // Start from today
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const result = await getAvailableExaminers({
          examId,
          startDate,
          settings,
        });

        if (result.success && result.result) {
          // Convert date strings back to Date objects (dates get serialized as strings over network)
          const processedResult = {
            ...result.result,
            days: result.result.days.map(
              (day: {
                date: string | Date;
                weekday: string;
                slots: Array<{
                  start: string | Date;
                  end: string | Date;
                  examiners: ExaminerAvailabilityOption[];
                }>;
              }) => ({
                ...day,
                date: new Date(day.date),
                weekday: day.weekday, // Preserve weekday property
                slots: day.slots.map(
                  (slot: {
                    start: string | Date;
                    end: string | Date;
                    examiners: ExaminerAvailabilityOption[];
                  }) => ({
                    ...slot,
                    start: new Date(slot.start),
                    end: new Date(slot.end),
                    examiners: slot.examiners, // Preserve examiners array
                  })
                ),
              })
            ),
            startDate: new Date(result.result.startDate),
            endDate: new Date(result.result.endDate),
            dueDate: result.result.dueDate ? new Date(result.result.dueDate) : null,
          };
          console.log('[ExaminerOptions] Processed availability data:', {
            daysCount: processedResult.days.length,
            totalSlots: processedResult.days.reduce((sum, day) => sum + day.slots.length, 0),
            days: processedResult.days.map(day => ({
              date: day.date,
              weekday: day.weekday,
              slotsCount: day.slots.length,
              slots: day.slots.map(slot => ({
                time: `${formatTime(slot.start)} - ${formatTime(slot.end)}`,
                examinersCount: slot.examiners.length,
              })),
            })),
          });
          setAvailabilityData(processedResult);
          setErrorMessage(null);
        } else {
          const errorMsg =
            (result as { error?: string }).error ||
            'Failed to load examiner availability. Please try again.';
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          console.error('Failed to load availability:', result);
        }
      } catch (error) {
        console.error('Error fetching examiner availability:', error);
        const errorMsg =
          error instanceof Error ? error.message : 'An error occurred while loading availability.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const formatTime = (date: Date): string => {
    return format(date, 'h a'); // Show just hour and AM/PM, e.g., "9 AM"
  };

  const formatSqlDate = (date: Date): string => {
    return format(date, 'EEEE, MMMM d');
  };

  const handleSlotSelection = (
    examiner: ExaminerOption,
    slot: SlotAvailability,
    day: DayAvailability
  ) => {
    const appointment: SelectedAppointment = {
      examinerId: examiner.examinerId,
      examinerName: examiner.examinerName,
      date: day.date,
      slotStart: slot.start,
      slotEnd: slot.end,
      specialty: examiner.specialty,
    };

    onSelectAppointment(appointment);
  };

  if (loading) {
    return (
      <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
        <div className="py-8 text-center text-[28px] leading-[100%] font-semibold tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
          Choose Your Appointment
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading available examiners...</div>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (errorMessage) {
    return (
      <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
        <div className="py-8 text-center text-[28px] leading-[100%] font-semibold tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
          Choose Your Appointment
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="max-w-2xl rounded-lg border-2 border-red-200 bg-red-50 p-6">
            <div className="mb-2 text-lg font-semibold text-red-800">
              Unable to Load Availability
            </div>
            <div className="text-base text-red-700">{errorMessage}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!availabilityData || availabilityData.days.length === 0) {
    return (
      <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
        <div className="py-8 text-center text-[28px] leading-[100%] font-semibold tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
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

  const maxDaysToShow = Math.min(availabilityData.days.length, 7);
  const daysToShow = availabilityData.days.slice(0, maxDaysToShow);

  // Get all unique time slots across all days (for time column)
  const allTimeSlots = new Map<string, { start: Date; end: Date }>();
  daysToShow.forEach(day => {
    day.slots.forEach(slot => {
      const hour = slot.start.getHours();
      const timeKey = hour.toString();
      if (!allTimeSlots.has(timeKey)) {
        allTimeSlots.set(timeKey, { start: slot.start, end: slot.end });
      }
    });
  });
  const timeSlotsArray = Array.from(allTimeSlots.entries())
    .map(([key, value]) => ({
      hour: parseInt(key),
      label: key,
      start: value.start,
      end: value.end,
    }))
    .sort((a, b) => a.hour - b.hour);

  // Helper function to check if a slot exists for a specific date-time combination
  const getExaminerForSlot = (day: DayAvailability, hour: number) => {
    const matchingSlot = day.slots.find(slot => slot.start.getHours() === hour);

    if (matchingSlot && matchingSlot.examiners.length > 0) {
      return { examiner: matchingSlot.examiners[0], slot: matchingSlot };
    }
    return null;
  };

  const handleDateClick = (dayIndex: number) => {
    if (selectedDateIndex === dayIndex) {
      // Toggle: if same date clicked, deselect
      setSelectedDateIndex(null);
      setSelectedTimeSlot(null);
    } else {
      setSelectedDateIndex(dayIndex);
      setSelectedTimeSlot(null); // Reset time selection when date changes
    }
  };

  const handleTimeClick = (timeSlot: { start: Date; end: Date }) => {
    if (selectedTimeSlot && selectedTimeSlot.start.getHours() === timeSlot.start.getHours()) {
      // Toggle: if same time clicked, deselect
      setSelectedTimeSlot(null);
    } else {
      setSelectedTimeSlot(timeSlot);
      // If no date selected, select first date with this time slot
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

  return (
    <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
      <div className="py-8 text-center text-[28px] leading-[100%] font-semibold tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
        Choose Your Appointment
      </div>

      {/* Table Layout - Always visible like airline booking */}
      {timeSlotsArray.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Time
                </th>
                {daysToShow.map((day, dayIndex) => (
                  <th
                    key={dayIndex}
                    onClick={() => handleDateClick(dayIndex)}
                    className={`min-w-[300px] cursor-pointer px-4 py-3 text-center text-sm font-semibold transition-colors ${
                      selectedDateIndex === dayIndex
                        ? 'bg-[#000093] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {formatSqlDate(day.date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlotsArray.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className="border-b border-gray-200">
                  {/* Time Column - Clickable */}
                  <td
                    onClick={() => handleTimeClick(timeSlot)}
                    className={`sticky left-0 z-10 cursor-pointer px-4 py-3 text-sm font-medium transition-colors ${
                      selectedTimeSlot && selectedTimeSlot.start.getHours() === timeSlot.hour
                        ? 'bg-[#000093] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {formatTime(timeSlot.start)}
                  </td>
                  {/* Date Columns */}
                  {daysToShow.map((day, dayIndex) => {
                    const result = getExaminerForSlot(day, timeSlot.hour);
                    const examiner = result?.examiner;
                    const matchingSlot = result?.slot;

                    return (
                      <td
                        key={dayIndex}
                        onClick={() => {
                          handleDateClick(dayIndex);
                          handleTimeClick(timeSlot);
                        }}
                        className={`cursor-pointer p-2 ${
                          selectedDateIndex === dayIndex &&
                          selectedTimeSlot &&
                          selectedTimeSlot.start.getHours() === timeSlot.hour
                            ? 'ring-2 ring-[#000093] ring-offset-2'
                            : ''
                        }`}
                      >
                        {examiner && matchingSlot ? (
                          <div className="relative overflow-visible rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-4 shadow-lg transition-all duration-200 hover:shadow-xl">
                            {/* Content */}
                            <div className="mb-4 grid grid-cols-1 gap-3 text-xs">
                              {/* Left Column */}
                              <div className="space-y-2">
                                {examiner.clinic && (
                                  <div className="flex items-start space-x-1">
                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#000093]" />
                                    <p className="line-clamp-1 text-xs font-medium text-gray-900">
                                      {examiner.clinic}
                                    </p>
                                  </div>
                                )}
                                {examiner.specialty && (
                                  <div className="flex items-start space-x-1">
                                    <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#000093]" />
                                    <p className="text-xs font-medium text-gray-900">
                                      {examiner.specialty}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Right Column - Services */}
                              <div className="space-y-2">
                                <div className="flex items-start space-x-1">
                                  <Languages className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#000093]" />
                                  <p className="text-xs font-medium text-gray-900">
                                    Interpreter:{' '}
                                    {examiner.interpreters && examiner.interpreters.length > 0
                                      ? examiner.interpreters[0].companyName
                                      : 'Not Required'}
                                  </p>
                                </div>
                                <div className="flex items-start space-x-1">
                                  <Car className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#000093]" />
                                  <p className="text-xs font-medium text-gray-900">
                                    Transport:{' '}
                                    {examiner.transporters && examiner.transporters.length > 0
                                      ? examiner.transporters[0].companyName
                                      : 'Not Required'}
                                  </p>
                                </div>
                                <div className="flex items-start space-x-1">
                                  <UserPlus className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#000093]" />
                                  <p className="text-xs font-medium text-gray-900">
                                    Chaperone:{' '}
                                    {examiner.chaperones && examiner.chaperones.length > 0
                                      ? `${examiner.chaperones[0].firstName} ${examiner.chaperones[0].lastName}`
                                      : 'Not Required'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Select Button */}
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleSlotSelection(examiner, matchingSlot, day)}
                                className="flex cursor-pointer items-center justify-center space-x-1 rounded-full bg-[#000080] px-4 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#000093]"
                              >
                                <span>Select</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-400">
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
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">No available time slots found.</div>
        </div>
      )}
    </div>
  );
};

export default ExaminerOptions;
