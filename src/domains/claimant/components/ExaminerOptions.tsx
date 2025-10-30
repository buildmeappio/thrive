'use client';
import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Star, Calendar, Clock } from 'lucide-react';
import { getAvailableExaminers } from '../actions';
import { toast } from 'sonner';
import type {
  AvailableExaminersResult,
  DayAvailability,
  ExaminerAvailabilityOption,
} from '../types/examinerAvailability';
import { format } from 'date-fns';

interface ExaminerOption {
  examinerId: string;
  examinerName: string;
  providerId: string;
  specialty?: string;
}

interface SlotOption {
  start: Date;
  end: Date;
  examiners: ExaminerOption[];
}

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
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    return format(date, 'h:mm a');
  };

  const formatSqlDate = (date: Date): string => {
    return format(date, 'EEEE, MMMM d');
  };

  const handleSlotSelection = (slot: SlotOption, day: DayAvailability) => {
    if (slot.examiners.length === 0) return;

    // For now, select the first examiner (could add examiner selection UI later)
    const selectedExaminer = slot.examiners[0];

    const appointment: SelectedAppointment = {
      examinerId: selectedExaminer.examinerId,
      examinerName: selectedExaminer.examinerName,
      date: day.date,
      slotStart: slot.start,
      slotEnd: slot.end,
      specialty: selectedExaminer.specialty,
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

  const selectedDay = availabilityData.days[selectedDateIndex];
  const maxDaysToShow = Math.min(availabilityData.days.length, 7);

  return (
    <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
      <div className="py-8 text-center text-[28px] leading-[100%] font-semibold tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
        Choose Your Appointment
      </div>

      {/* Date Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {availabilityData.days.slice(0, maxDaysToShow).map((day, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedDateIndex(index);
              setSelectedSlotIndex(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              selectedDateIndex === index
                ? 'bg-[#000093] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="mr-2 inline h-4 w-4" />
            {formatSqlDate(day.date)}
          </button>
        ))}
      </div>

      {/* Slots for Selected Date */}
      {selectedDay && selectedDay.slots.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedDay.slots.map((slot, slotIndex) => (
            <div
              key={slotIndex}
              className={`relative rounded-xl border-2 p-6 transition-all duration-200 ${
                selectedSlotIndex === slotIndex
                  ? 'border-[#000093] bg-[#E8F1FF] shadow-lg'
                  : 'border-gray-200 bg-white hover:border-[#000093] hover:shadow-md'
              }`}
            >
              {/* Time Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#000093]" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </span>
                </div>
              </div>

              {/* Available Examiners */}
              <div className="mb-4 space-y-3">
                {slot.examiners.map((examiner, examinerIndex) => (
                  <div
                    key={examinerIndex}
                    className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
                  >
                    <User className="h-5 w-5 flex-shrink-0 text-[#000093]" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{examiner.examinerName}</p>
                      {examiner.specialty && (
                        <div className="mt-1 flex items-center space-x-1">
                          <Star className="h-3 w-3 text-[#000093]" />
                          <p className="text-sm text-gray-600">{examiner.specialty}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSlotSelection(slot, selectedDay)}
                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-lg bg-[#000080] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#000093]"
              >
                <span>Select This Slot</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">
            No available slots for {formatSqlDate(selectedDay.date)}.
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminerOptions;
