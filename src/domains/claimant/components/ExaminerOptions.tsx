'use client';
import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Star,
  Calendar,
  MapPin,
  HelpCircle,
  Car,
  UserPlus,
  Languages,
} from 'lucide-react';
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
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
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
    return format(date, 'h:mm a');
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
        <div className="grid grid-cols-1 gap-4 gap-y-8 md:grid-cols-2">
          {selectedDay.slots.flatMap((slot, slotIndex) =>
            slot.examiners.map((examiner, examinerIndex) => (
              <div
                key={`${slotIndex}-${examinerIndex}`}
                className="relative overflow-visible rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-6 pt-10 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                {/* Date/Time Header - Half inside, half outside from top center */}
                <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
                  <div className="rounded-full bg-purple-100 px-4 py-1.5 whitespace-nowrap shadow-sm">
                    <span className="text-sm font-medium text-gray-900">
                      {format(slot.start, 'MMMM d, yyyy')} - {formatTime(slot.start)}
                    </span>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Left Column - Appointment Details */}
                  <div className="space-y-3">
                    {/* Clinic Name */}
                    {examiner.clinic && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                        <p className="text-sm font-medium text-gray-900">{examiner.clinic}</p>
                      </div>
                    )}

                    {/* Specialty */}
                    {examiner.specialty && (
                      <div className="flex items-start space-x-2">
                        <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                        <p className="text-sm font-medium text-gray-900">{examiner.specialty}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Additional Services */}
                  <div className="space-y-3">
                    {/* Interpreter */}
                    <div className="flex items-start space-x-2">
                      <Languages className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                      <p className="text-sm font-medium text-gray-900">
                        Interpreter:{' '}
                        {examiner.interpreters && examiner.interpreters.length > 0
                          ? `${examiner.interpreters.length} Available`
                          : 'Not Required'}
                      </p>
                    </div>

                    {/* Transport */}
                    <div className="flex items-start space-x-2">
                      <Car className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                      <p className="text-sm font-medium text-gray-900">
                        Transport:{' '}
                        {examiner.transporters && examiner.transporters.length > 0
                          ? examiner.transporters[0].companyName
                          : 'Not Required'}
                      </p>
                    </div>

                    {/* Chaperone */}
                    <div className="flex items-start space-x-2">
                      <UserPlus className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                      <p className="text-sm font-medium text-gray-900">
                        Chaperone:{' '}
                        {examiner.chaperones && examiner.chaperones.length > 0
                          ? `${examiner.chaperones.length} Available`
                          : 'Not Required'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleSlotSelection(examiner, slot, selectedDay)}
                    className="flex cursor-pointer items-center justify-center space-x-2 rounded-full bg-[#000080] px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#000093]"
                  >
                    <span>Select This Appointment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
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
