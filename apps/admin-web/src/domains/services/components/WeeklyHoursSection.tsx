'use client';

import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { WeeklyHours, Weekday } from '../types/Availability';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WeeklyHoursSectionProps = {
  weeklyHours: WeeklyHours[];
  onChange: (weeklyHours: WeeklyHours[]) => void;
  disabled?: boolean;
};

type TimeSlotError = {
  day: Weekday;
  slotIndex: number;
  message: string;
};

const DAYS: { value: Weekday; label: string }[] = [
  { value: 'SUNDAY', label: 'Sunday' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
];

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      options.push(`${displayHour}:${displayMinute} ${period}`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;

  return hour24 * 60 + minutes;
};

// Helper function to add hours to a time string
const addHoursToTime = (timeStr: string, hoursToAdd: number): string => {
  // Parse time string (e.g., "10:00 AM")
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  // Convert to 24-hour format
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;

  // Add hours
  hour24 = (hour24 + hoursToAdd) % 24;

  // Convert back to 12-hour format
  const newPeriod = hour24 >= 12 ? 'PM' : 'AM';
  const newHour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return `${newHour}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
};

const WeeklyHoursSection: React.FC<WeeklyHoursSectionProps> = ({
  weeklyHours,
  onChange,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<TimeSlotError[]>([]);

  // Helper function to get valid end time options based on start time
  const getValidEndTimeOptions = (startTime: string, currentEndTime?: string): string[] => {
    const startMinutes = timeToMinutes(startTime);
    const validOptions = timeOptions.filter(time => {
      const timeMinutes = timeToMinutes(time);
      return timeMinutes > startMinutes;
    });

    // If current end time is invalid but exists, include it in the list so it can be displayed
    // This prevents the dropdown from showing empty when the time is invalid
    if (currentEndTime && !validOptions.includes(currentEndTime)) {
      return [currentEndTime, ...validOptions];
    }

    return validOptions;
  };

  // Validate time slots whenever weeklyHours changes
  useEffect(() => {
    const newErrors: TimeSlotError[] = [];

    weeklyHours.forEach(dayHours => {
      if (!dayHours.enabled || dayHours.timeSlots.length === 0) return;

      dayHours.timeSlots.forEach((slot, slotIndex) => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        // Check if start time is greater than or equal to end time
        if (startMinutes >= endMinutes) {
          newErrors.push({
            day: dayHours.dayOfWeek,
            slotIndex,
            message: 'Start time must be before end time',
          });
        }

        // Check for overlaps with other slots on the same day
        for (let otherIndex = slotIndex + 1; otherIndex < dayHours.timeSlots.length; otherIndex++) {
          const otherSlot = dayHours.timeSlots[otherIndex];
          const otherStartMinutes = timeToMinutes(otherSlot.startTime);
          const otherEndMinutes = timeToMinutes(otherSlot.endTime);

          // Check if slots overlap
          const hasOverlap =
            (startMinutes >= otherStartMinutes && startMinutes < otherEndMinutes) ||
            (endMinutes > otherStartMinutes && endMinutes <= otherEndMinutes) ||
            (startMinutes <= otherStartMinutes && endMinutes >= otherEndMinutes);

          if (hasOverlap) {
            // Mark both slots as having overlap errors
            newErrors.push({
              day: dayHours.dayOfWeek,
              slotIndex,
              message: 'Time slots cannot overlap',
            });
            newErrors.push({
              day: dayHours.dayOfWeek,
              slotIndex: otherIndex,
              message: 'Time slots cannot overlap',
            });
          }
        }
      });
    });

    setErrors(newErrors);
  }, [weeklyHours]);

  const getSlotError = (day: Weekday, slotIndex: number): string | undefined => {
    return errors.find(e => e.day === day && e.slotIndex === slotIndex)?.message;
  };

  const handleDayToggle = (day: Weekday, checked: boolean) => {
    const updated = weeklyHours.map(wh =>
      wh.dayOfWeek === day ? { ...wh, enabled: checked } : wh
    );
    onChange(updated);
  };

  const handleAddSlot = (day: Weekday) => {
    const updated = weeklyHours.map(wh => {
      if (wh.dayOfWeek === day) {
        let newStartTime = '8:00 AM';
        let newEndTime = '11:00 AM';

        // If there are existing slots, calculate based on the last slot
        if (wh.timeSlots.length > 0) {
          const lastSlot = wh.timeSlots[wh.timeSlots.length - 1];
          // New slot starts 1 hour after the last slot ends
          newStartTime = addHoursToTime(lastSlot.endTime, 1);
          // New slot ends 1 hour after it starts
          newEndTime = addHoursToTime(newStartTime, 1);
        }

        return {
          ...wh,
          timeSlots: [...wh.timeSlots, { startTime: newStartTime, endTime: newEndTime }],
        };
      }
      return wh;
    });
    onChange(updated);
  };

  const handleRemoveSlot = (day: Weekday, slotIndex: number) => {
    const updated = weeklyHours.map(wh =>
      wh.dayOfWeek === day
        ? {
            ...wh,
            timeSlots: wh.timeSlots.filter((_, idx) => idx !== slotIndex),
          }
        : wh
    );
    onChange(updated);
  };

  const handleUpdateSlot = (
    day: Weekday,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = weeklyHours.map(wh =>
      wh.dayOfWeek === day
        ? {
            ...wh,
            timeSlots: wh.timeSlots.map((slot, idx) =>
              idx === slotIndex ? { ...slot, [field]: value } : slot
            ),
          }
        : wh
    );
    onChange(updated);
  };

  const getDayHours = (day: Weekday): WeeklyHours => {
    return (
      weeklyHours.find(wh => wh.dayOfWeek === day) || {
        dayOfWeek: day,
        enabled: false,
        timeSlots: [],
      }
    );
  };

  return (
    <div className="w-full space-y-4 md:w-1/3">
      {DAYS.map(day => {
        const dayHours = getDayHours(day.value);
        // Ensure enabled days have at least one time slot
        const hasTimeSlots = dayHours.timeSlots.length > 0;

        return (
          <div key={day.value} className="space-y-2">
            {/* First row or all rows */}
            {!hasTimeSlots ? (
              <div className="flex items-center gap-4">
                <div className="flex min-w-[140px] items-center gap-3">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={dayHours.enabled}
                    onCheckedChange={checked => {
                      handleDayToggle(day.value, !!checked);
                      if (checked && dayHours.timeSlots.length === 0) {
                        handleAddSlot(day.value);
                      }
                    }}
                    disabled={disabled}
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className={`font-poppins cursor-pointer select-none text-base ${
                      dayHours.enabled ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {day.label}
                  </label>
                </div>
                <Select value="8:00 AM" disabled={!dayHours.enabled || disabled}>
                  <SelectTrigger className="font-poppins h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm disabled:bg-gray-50 disabled:text-gray-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value="11:00 AM" disabled={!dayHours.enabled || disabled}>
                  <SelectTrigger className="font-poppins h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm disabled:bg-gray-50 disabled:text-gray-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => dayHours.enabled && handleAddSlot(day.value)}
                  disabled={!dayHours.enabled || disabled}
                  className="flex h-10 w-10 items-center justify-center text-cyan-500 hover:text-cyan-600 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <Plus size={24} />
                </button>
              </div>
            ) : (
              dayHours.timeSlots.map((slot, slotIndex) => {
                const error = getSlotError(day.value, slotIndex);
                return (
                  <div key={slotIndex} className="space-y-1">
                    <div className="flex items-center gap-4">
                      {slotIndex === 0 ? (
                        <div className="flex min-w-[140px] items-center gap-3">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={dayHours.enabled}
                            onCheckedChange={checked => handleDayToggle(day.value, !!checked)}
                            disabled={disabled}
                            className="h-5 w-5"
                          />
                          <label
                            htmlFor={`day-${day.value}`}
                            className={`font-poppins cursor-pointer select-none text-base ${
                              dayHours.enabled ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {day.label}
                          </label>
                        </div>
                      ) : (
                        <div className="min-w-[140px]" />
                      )}
                      <Select
                        value={slot.startTime}
                        onValueChange={value =>
                          handleUpdateSlot(day.value, slotIndex, 'startTime', value)
                        }
                        disabled={!dayHours.enabled || disabled}
                      >
                        <SelectTrigger
                          className={`font-poppins h-11 rounded-lg border bg-white px-4 text-sm disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={slot.endTime}
                        onValueChange={value =>
                          handleUpdateSlot(day.value, slotIndex, 'endTime', value)
                        }
                        disabled={!dayHours.enabled || disabled}
                      >
                        <SelectTrigger
                          className={`font-poppins h-11 rounded-lg border bg-white px-4 text-sm disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getValidEndTimeOptions(slot.startTime, slot.endTime).map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {slotIndex === 0 ? (
                        <button
                          type="button"
                          onClick={() => dayHours.enabled && handleAddSlot(day.value)}
                          disabled={!dayHours.enabled || disabled}
                          className="flex h-10 w-10 items-center justify-center text-cyan-500 hover:text-cyan-600 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          <Plus size={24} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day.value, slotIndex)}
                          disabled={!dayHours.enabled || disabled}
                          className="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-red-500 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    {error && (
                      <div className="ml-[140px] flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyHoursSection;
