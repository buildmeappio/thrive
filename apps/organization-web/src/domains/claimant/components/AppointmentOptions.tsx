'use client';
import React from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Appointment, ClaimantAvailabilityFormData } from '../schemas/claimantAvailability';
import { ClaimantPreference } from '@thrive/database';
import { timeSlots } from '@/config/timeSlots';

interface AppointmentOptionsProps {
  form: UseFormReturn<ClaimantAvailabilityFormData>;
  onCheckExaminers: () => void;
}

const AppointmentOptions: React.FC<AppointmentOptionsProps> = ({ form, onCheckExaminers }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const formData = watch();

  const [currentDate] = React.useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string>('morning');

  const monthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const daysOfWeek: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date): string =>
    `${date.getDate()}-${monthNames[date.getMonth()]}-${date.getFullYear()}`;

  const isToday = (date: Date): boolean => {
    return date.toDateString() === currentDate.toDateString();
  };

  const isCurrentMonth = (): boolean => {
    return (
      currentMonth.getMonth() === currentDate.getMonth() &&
      currentMonth.getFullYear() === currentDate.getFullYear()
    );
  };

  const isPastDate = (date: Date): boolean => {
    return date < currentDate && !isToday(date);
  };

  const hasAppointment = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return formData.appointments.some(apt => apt.date === dateStr);
  };

  const getButtonClass = (day: Date): string => {
    const dateStr = formatDate(day);
    const isSelected = selectedDate === dateStr;
    const todayClass = isToday(day);
    const appointmentClass = hasAppointment(day);
    const isPast = isPastDate(day);
    const isCurrentMonthView = isCurrentMonth();
    const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday = 0, Saturday = 6

    const baseClass =
      'relative hover:opacity-80 rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center text-xs sm:text-sm';

    if (isSelected) {
      return `${baseClass} bg-[#000093] text-white cursor-pointer`;
    } else if (appointmentClass) {
      return `${baseClass} bg-[#E8F1FF] text-black cursor-pointer`;
    } else if (todayClass) {
      return `${baseClass} bg-[#000093] text-white cursor-pointer`;
    } else if (isCurrentMonthView && isPast) {
      return `${baseClass} bg-transparent text-gray-400 cursor-not-allowed`;
    } else if (isWeekend) {
      return `${baseClass} bg-transparent text-gray-900`;
    } else {
      return `${baseClass} bg-[#E8F1FF] text-black cursor-pointer`;
    }
  };

  const handleDateClick = (day: Date): void => {
    if (isCurrentMonth() && isPastDate(day)) {
      return; // Don't allow clicking on past dates in current month
    }
    setSelectedDate(formatDate(day));
  };

  const navigateMonth = (direction: 'prev' | 'next'): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleAdd = (): void => {
    if (formData.appointments.length >= 3) {
      toast.error('You can only add up to 3 appointment options.');
      return;
    }
    if (!selectedDate) return;

    const timeSlot = timeSlots.find(slot => slot.id === selectedTime);
    if (!timeSlot) return;

    const newAppointment: Appointment = {
      date: selectedDate,
      time: selectedTime,
      timeLabel: timeSlot.label,
    };

    // Check if appointment already exists for this date and time
    const exists = formData.appointments.some(
      apt => apt.date === selectedDate && apt.time === selectedTime
    );

    if (!exists) {
      setValue('appointments', [...formData.appointments, newAppointment], {
        shouldValidate: true,
      });
    } else {
      toast.error('This appointment option has already been added.');
    }
  };

  const handleRemoveAppointment = (index: number): void => {
    const updatedAppointments = formData.appointments.filter((_, i) => i !== index);
    setValue('appointments', updatedAppointments, { shouldValidate: true });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:px-6">
      <div className="py-8 text-center text-[28px] font-semibold leading-[100%] tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
        Choose Preferred Dates (2 to 3)
      </div>

      {errors.appointments && (
        <div className="mb-4 text-center text-red-500">{errors.appointments.message}</div>
      )}

      <div className="flex flex-col space-y-8 md:space-x-20 lg:flex-row lg:space-y-0">
        {/* Calendar Section */}
        <div className="flex-shrink-0 lg:max-w-none">
          <div className="space-y-4">
            <Label className="text-[16px] font-semibold leading-[100%] tracking-normal sm:text-[18.87px]">
              Select a date
            </Label>

            <div className="mx-auto h-auto w-full max-w-[430px] rounded-[20px] border border-[#D3D3D3] p-4 sm:h-[400px] sm:rounded-[26px] sm:p-6 md:h-[430px] lg:mx-0">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  disabled={isCurrentMonth()}
                  className={`rounded p-1 ${isCurrentMonth() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <ChevronLeft
                    className={`h-6 w-6 rounded-full p-1 text-[#0069FF] sm:h-8 sm:w-8 ${isCurrentMonth() ? 'bg-gray-200' : 'bg-[#E8F1FF]'}`}
                  />
                </button>
                <span className="text-base font-medium sm:text-lg">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="cursor-pointer rounded p-1"
                >
                  <ChevronRight className="h-6 w-6 rounded-full bg-[#E8F1FF] p-1 text-[#0069FF] sm:h-8 sm:w-8" />
                </button>
              </div>

              {/* Days header */}
              <div className="mb-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 sm:mb-4 sm:gap-2 sm:text-sm">
                {daysOfWeek.map(day => (
                  <div key={day} className="rounded-full">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((day, index) => (
                  <div key={index} className="flex flex-col items-center justify-center">
                    {day ? (
                      <button
                        type="button"
                        className={getButtonClass(day)}
                        onClick={() => handleDateClick(day)}
                      >
                        {day.getDate()}
                        {isToday(day) && (
                          <div className="bottom-1.25 absolute left-1/2 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-white"></div>
                        )}
                      </button>
                    ) : (
                      <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="flex-shrink-0">
          <div className="space-y-4">
            <Label className="text-[16px] font-semibold leading-[100%] tracking-normal sm:text-[18.87px]">
              Select Time
            </Label>

            <div className="space-y-3">
              {timeSlots.map(slot => (
                <label
                  key={slot.id}
                  className="flex cursor-pointer items-center space-x-2 sm:space-x-3"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="time"
                      value={slot.id}
                      checked={selectedTime === slot.id}
                      onChange={e => setSelectedTime(e.target.value)}
                      className="sr-only"
                    />
                    <div className="h-4 w-4 rounded-full border-2 border-gray-400 bg-transparent">
                      {selectedTime === slot.id && (
                        <div className="m-0.5 h-2 w-2 rounded-full bg-[#000093]"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-normal leading-[140%] tracking-normal sm:text-base">
                    {slot.label}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 h-[35px] w-[120px] cursor-pointer rounded-[25px] bg-[#000080] text-sm text-white hover:opacity-90 sm:h-[39px] sm:w-[135px] sm:rounded-[29px] sm:text-base"
            >
              Add →
            </button>
          </div>
        </div>

        {/* Selected Options */}
        <div className="min-w-0 flex-1">
          <div className="space-y-4">
            <Label className="text-[16px] font-semibold leading-[100%] tracking-normal sm:text-[18.87px]">
              Selected Date & Time ({formData.appointments.length}/3)
            </Label>

            <div className="space-y-3">
              {formData.appointments.map((apt, index) => (
                <div key={index} className="relative rounded-lg p-3">
                  <div className="mb-2 text-[16px] font-semibold leading-[100%] tracking-normal sm:text-[18.87px]">
                    Option {index + 1}
                  </div>
                  <div className="text-sm font-normal leading-[140%] tracking-normal sm:text-base">
                    {apt.date}
                  </div>
                  <div className="text-sm font-normal leading-[140%] tracking-normal sm:text-base">
                    {apt.timeLabel}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAppointment(index)}
                    className="absolute right-2 top-2 text-lg text-red-500 hover:text-red-700 sm:text-xl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col space-y-6 lg:flex-row lg:space-x-8 lg:space-y-0">
        {/* Left Section */}
        <div className="flex-1 space-y-4">
          <h3 className="text-base font-medium sm:text-lg">
            Do you prefer an in-person or virtual appointment?
          </h3>

          <div className="space-y-3">
            {Object.values(ClaimantPreference).map(preference => (
              <label
                key={preference}
                className="flex cursor-pointer items-center space-x-2 sm:space-x-3"
              >
                <div className="relative">
                  <input
                    type="radio"
                    {...register('preference')}
                    value={preference}
                    className="sr-only"
                  />
                  <div className="h-4 w-4 rounded-full border-2 border-gray-400 bg-transparent">
                    {watch('preference') === preference && (
                      <div className="m-0.5 h-2 w-2 rounded-full bg-[#000093]"></div>
                    )}
                  </div>
                </div>
                <span className="text-sm capitalize sm:text-base">
                  {preference === ClaimantPreference.IN_PERSON
                    ? 'In-Person'
                    : preference === ClaimantPreference.VIRTUAL
                      ? 'Virtual'
                      : 'Either'}
                </span>
              </label>
            ))}
          </div>

          {errors.preference && (
            <div className="text-sm text-red-500">{errors.preference.message}</div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex-1 space-y-4">
          <h3 className="text-base font-medium sm:text-lg">
            Do you have any accessibility needs or other notes for our scheduling team?
          </h3>

          <div className="relative">
            <textarea
              {...register('accessibilityNotes')}
              placeholder="Please avoid Fridays. Prefer wheelchair-accessible clinics."
              maxLength={200}
              className="h-28 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:h-32 sm:text-base"
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-500 sm:text-sm">
              {(watch('accessibilityNotes') || '').length}/200
            </div>
          </div>

          {errors.accessibilityNotes && (
            <div className="text-sm text-red-500">{errors.accessibilityNotes.message}</div>
          )}
        </div>
      </div>

      {/* Check for Examiners Button */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onCheckExaminers}
          className="rounded-xl bg-[#000093] px-8 py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#000080]"
        >
          Check for Examiners
        </button>
      </div>
    </div>
  );
};

export default AppointmentOptions;
