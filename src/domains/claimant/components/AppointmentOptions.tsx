'use client';
import React, { type JSX, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface TimeSlot {
  id: string;
  label: string;
}

interface Appointment {
  date: string;
  time: string;
  timeLabel: string;
}

const timeSlots: TimeSlot[] = [
  { id: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
  { id: 'afternoon', label: 'Afternoon (12:00 PM - 5:00 PM)' },
  { id: 'either', label: 'Either' },
];

const AppointmentOptions = (): JSX.Element => {
  const [currentDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('morning');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentType, setAppointmentType] = useState<string>('in-person');
  const [notes, setNotes] = useState<string>('');

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

  const hasAppointment = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return appointments.some(apt => apt.date === dateStr);
  };

  const getButtonClass = (day: Date): string => {
    const dateStr = formatDate(day);
    const isSelected = selectedDate === dateStr;
    const todayClass = isToday(day);
    const appointmentClass = hasAppointment(day);

    const baseClass = 'h-10 w-10 rounded-full text-sm border-0 cursor-pointer hover:opacity-80';

    if (isSelected) {
      return `${baseClass} bg-[#000093] text-white`;
    } else if (appointmentClass) {
      return `${baseClass} bg-[#E8F1FF] text-black`;
    } else if (todayClass) {
      return `${baseClass} bg-transparent text-[#2E94F0] font-semibold hover:bg-blue-100`;
    } else {
      return `${baseClass} bg-transparent text-gray-900 hover:bg-blue-100`;
    }
  };

  const handleDateClick = (day: Date): void => {
    setSelectedDate(formatDate(day));
  };

  const navigateMonth = (direction: 'prev' | 'next'): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleAdd = (): void => {
    if (!selectedDate) return;

    const timeSlot = timeSlots.find(slot => slot.id === selectedTime);
    if (!timeSlot) return;

    const newAppointment: Appointment = {
      date: selectedDate,
      time: selectedTime,
      timeLabel: timeSlot.label,
    };

    // Check if appointment already exists for this date
    const exists = appointments.some(apt => apt.date === selectedDate);
    if (!exists) {
      setAppointments([...appointments, newAppointment]);
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="w-full">
      <div className="py-12 text-center text-[36px] leading-[100%] font-semibold tracking-normal">
        Choose Preferred Dates (2 to 3)
      </div>

      <div className="flex justify-between">
        {/* Calendar Section */}
        <div className="space-y-4">
          <Label className="text-[18.87px] leading-[100%] font-semibold tracking-normal">
            Select a date
          </Label>

          <div className="h-[430px] w-[430px] rounded-[26px] border border-[#D3D3D3] p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="rounded p-1 hover:bg-gray-100"
              >
                <ChevronLeft className="h-8 w-8 rounded-full bg-[#E8F1FF] p-1 text-[#0069FF]" />
              </button>
              <span className="text-lg font-medium">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="rounded p-1 hover:bg-gray-100"
              >
                <ChevronRight className="h-8 w-8 rounded-full bg-[#E8F1FF] p-1 text-[#0069FF]" />
              </button>
            </div>

            {/* Days header */}
            <div className="mb-4 grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
              {daysOfWeek.map(day => (
                <div key={day} className="p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <div key={index} className="flex items-center justify-center">
                  {day ? (
                    <button className={getButtonClass(day)} onClick={() => handleDateClick(day)}>
                      {day.getDate()}
                    </button>
                  ) : (
                    <div className="h-10 w-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <Label className="text-[18.87px] leading-[100%] font-semibold tracking-normal">
            Select Time
          </Label>

          <div className="space-y-3">
            {timeSlots.map(slot => (
              <label key={slot.id} className="flex cursor-pointer items-center space-x-2">
                <input
                  type="radio"
                  name="time"
                  value={slot.id}
                  checked={selectedTime === slot.id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedTime(e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span className="text-base leading-[140%] font-normal tracking-normal">
                  {slot.label}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleAdd}
            className="mt-4 h-[39px] w-[135px] rounded-[29px] bg-[#000080] text-white hover:opacity-90"
          >
            Add →
          </button>
        </div>

        {/* Selected Options */}
        <div className="space-y-4">
          <Label className="text-[18.87px] leading-[100%] font-semibold tracking-normal">
            Selected Date & Time
          </Label>

          <div className="space-y-3">
            {appointments.map((apt, index) => (
              <div key={index}>
                <div className="mb-2 text-[18.87px] leading-[100%] font-semibold tracking-normal">
                  Option {index + 1}
                </div>
                <div className="text-base leading-[140%] font-normal tracking-normal">
                  {apt.date}
                </div>
                <div className="text-base leading-[140%] font-normal tracking-normal">
                  {apt.timeLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex w-full">
        {/* Left Section */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-medium">
            Do you prefer an in-person or virtual appointment?
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center space-x-2">
              <input
                type="radio"
                name="appointment"
                value="in-person"
                checked={appointmentType === 'in-person'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAppointmentType(e.target.value)
                }
                className="h-4 w-4 text-blue-600"
              />
              <span>In-Person</span>
            </label>

            <label className="flex cursor-pointer items-center space-x-2">
              <input
                type="radio"
                name="appointment"
                value="virtual"
                checked={appointmentType === 'virtual'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAppointmentType(e.target.value)
                }
                className="h-4 w-4 text-blue-600"
              />
              <span>Virtual</span>
            </label>

            <label className="flex cursor-pointer items-center space-x-2">
              <input
                type="radio"
                name="appointment"
                value="either"
                checked={appointmentType === 'either'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAppointmentType(e.target.value)
                }
                className="h-4 w-4 text-blue-600"
              />
              <span>Either</span>
            </label>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-medium">
            Do you have any accessibility needs or other notes for our scheduling team?
          </h3>

          <div className="relative">
            <textarea
              placeholder="Please avoid Fridays. Prefer wheelchair-accessible clinics."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              maxLength={200}
              className="h-32 w-full resize-none rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute right-3 bottom-2 text-sm text-gray-500">
              {notes.length}/200
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppointmentOptions;
