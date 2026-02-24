'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { OverrideHours } from '../types/Availability';
import {
  formatOverrideDisplayDate,
  overrideDateToLocalDate,
} from '@/components/availability/converters';
import { format } from 'date-fns';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type OverrideHoursSectionProps = {
  overrideHours: OverrideHours[];
  onChange: (overrideHours: OverrideHours[]) => void;
  disabled?: boolean;
};

type TimeSlotError = {
  date: string;
  slotIndex: number;
  message: string;
};

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

const OverrideHoursSection: React.FC<OverrideHoursSectionProps> = ({
  overrideHours,
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

  // Validate time slots whenever overrideHours changes
  useEffect(() => {
    const newErrors: TimeSlotError[] = [];

    overrideHours.forEach(dateHours => {
      dateHours.timeSlots.forEach((slot, slotIndex) => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        // Check if start time is greater than or equal to end time
        if (startMinutes >= endMinutes) {
          newErrors.push({
            date: dateHours.date,
            slotIndex,
            message: 'Start time must be before end time',
          });
        }

        // Check for overlaps with other slots on the same date
        for (
          let otherIndex = slotIndex + 1;
          otherIndex < dateHours.timeSlots.length;
          otherIndex++
        ) {
          const otherSlot = dateHours.timeSlots[otherIndex];
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
              date: dateHours.date,
              slotIndex,
              message: 'Time slots cannot overlap',
            });
            newErrors.push({
              date: dateHours.date,
              slotIndex: otherIndex,
              message: 'Time slots cannot overlap',
            });
          }
        }
      });
    });

    setErrors(newErrors);
  }, [overrideHours]);

  const getSlotError = (date: string, slotIndex: number): string | undefined => {
    return errors.find(e => e.date === date && e.slotIndex === slotIndex)?.message;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = overrideHours.find(oh => oh.date === dateStr);

    if (!existing) {
      // Add new date with one time slot
      onChange([
        ...overrideHours,
        {
          date: dateStr,
          timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
        },
      ]);
    } else {
      // Remove date if clicking on an existing one
      onChange(overrideHours.filter(oh => oh.date !== dateStr));
    }
  };

  const handleAddSlot = (dateStr: string) => {
    const updated = overrideHours.map(oh => {
      if (oh.date === dateStr) {
        let newStartTime = '8:00 AM';
        let newEndTime = '11:00 AM';

        // If there are existing slots, calculate based on the last slot
        if (oh.timeSlots.length > 0) {
          const lastSlot = oh.timeSlots[oh.timeSlots.length - 1];
          // New slot starts 1 hour after the last slot ends
          newStartTime = addHoursToTime(lastSlot.endTime, 1);
          // New slot ends 1 hour after it starts
          newEndTime = addHoursToTime(newStartTime, 1);
        }

        return {
          ...oh,
          timeSlots: [...oh.timeSlots, { startTime: newStartTime, endTime: newEndTime }],
        };
      }
      return oh;
    });
    onChange(updated);
  };

  const handleRemoveSlot = (dateStr: string, slotIndex: number) => {
    const updated = overrideHours
      .map(oh => {
        if (oh.date === dateStr) {
          const newTimeSlots = oh.timeSlots.filter((_, idx) => idx !== slotIndex);
          // If no time slots left, remove the entire date
          if (newTimeSlots.length === 0) {
            return null;
          }
          return { ...oh, timeSlots: newTimeSlots };
        }
        return oh;
      })
      .filter(Boolean) as OverrideHours[];

    onChange(updated);
  };

  const handleUpdateSlot = (
    dateStr: string,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = overrideHours.map(oh =>
      oh.date === dateStr
        ? {
            ...oh,
            timeSlots: oh.timeSlots.map((slot, idx) =>
              idx === slotIndex ? { ...slot, [field]: value } : slot
            ),
          }
        : oh
    );
    onChange(updated);
  };

  const handleToggleDate = (dateStr: string, checked: boolean) => {
    if (!checked) {
      onChange(overrideHours.filter(oh => oh.date !== dateStr));
    }
  };

  const getSelectedDates = (): Date[] => {
    return overrideHours
      .map(oh => overrideDateToLocalDate(oh.date))
      .filter((date): date is Date => !!date);
  };

  // Sort override hours by date
  const sortedOverrideHours = [...overrideHours].sort((a, b) => {
    const dateA = overrideDateToLocalDate(a.date);
    const dateB = overrideDateToLocalDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      {/* Calendar */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="[--cell-size:2.75rem] [&_[role=grid]]:min-h-[280px]">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleDateSelect}
            disabled={disabled}
            showOutsideDays={false}
            modifiers={{
              today: date => {
                const today = new Date();
                return date.toDateString() === today.toDateString();
              },
              weekday: date => {
                const day = date.getDay();
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const isOverride = getSelectedDates().some(
                  d => d.toDateString() === date.toDateString()
                );
                // Only apply weekday style if it's not today and not an override date
                return day >= 1 && day <= 5 && !isToday && !isOverride;
              },
              hasOverride: date => {
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const isOverride = getSelectedDates().some(
                  d => d.toDateString() === date.toDateString()
                );
                // Only apply override style if it's not today
                return isOverride && !isToday;
              },
            }}
            modifiersClassNames={{
              today:
                "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full hover:from-[#0090DD] hover:to-[#01D4AE] [&_button]:!bg-transparent [&_button]:text-white [&_button]:font-semibold [&_button]:relative [&_button]:after:content-[''] [&_button]:after:absolute [&_button]:after:bottom-1 [&_button]:after:left-1/2 [&_button]:after:-translate-x-1/2 [&_button]:after:w-1 [&_button]:after:h-1 [&_button]:after:bg-white [&_button]:after:rounded-full",
              hasOverride:
                'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full hover:from-[#0090DD] hover:to-[#01D4AE] [&_button]:!bg-transparent [&_button]:text-white [&_button]:font-medium',
              weekday:
                'bg-[#E8F1FF] rounded-full hover:bg-[#D0E4FF] [&_button]:!bg-transparent [&_button]:text-[#00A8FF] [&_button]:font-medium',
            }}
            classNames={{
              caption_label: 'text-xl font-semibold font-poppins text-gray-900',
              button_previous:
                'h-8 w-8 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors text-blue-600 p-0 flex items-center justify-center cursor-pointer [&_svg]:w-6 [&_svg]:h-6',
              button_next:
                'h-8 w-8 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors text-blue-600 p-0 flex items-center justify-center cursor-pointer [&_svg]:w-6 [&_svg]:h-6',
              weekdays: 'flex gap-1 justify-around',
              weekday: 'text-gray-600 font-medium text-sm font-poppins flex-1 text-center',
              week: 'mt-2 flex w-full gap-1 justify-around',
              day: 'rounded-full flex-1 flex items-center justify-center p-1',
              day_button:
                'h-9 w-9 font-normal text-base rounded-full font-poppins hover:bg-gray-100',
              today: '!bg-transparent',
              day_today: '!bg-transparent',
              day_outside: 'invisible',
              day_disabled: 'text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent',
            }}
          />
        </div>
      </div>

      {/* Selected Dates List */}
      <div className="flex w-full flex-col space-y-4 lg:w-auto lg:min-w-[500px] lg:max-w-[600px]">
        {sortedOverrideHours.length > 0 ? (
          sortedOverrideHours.map(override => (
            <div key={override.date} className="space-y-3">
              {override.timeSlots.map((slot, slotIndex) => {
                const error = getSlotError(override.date, slotIndex);
                return (
                  <div key={slotIndex} className="space-y-1">
                    <div className="flex items-center gap-4">
                      {slotIndex === 0 && (
                        <Checkbox
                          id={`date-${override.date}`}
                          checked={true}
                          onCheckedChange={checked => handleToggleDate(override.date, !!checked)}
                          disabled={disabled}
                          className="h-5 w-5"
                        />
                      )}
                      {slotIndex > 0 && <div className="w-5" />}

                      {slotIndex === 0 && (
                        <label
                          htmlFor={`date-${override.date}`}
                          className="font-poppins min-w-[100px] cursor-pointer text-base text-gray-900"
                        >
                          {formatOverrideDisplayDate(override.date)}
                        </label>
                      )}
                      {slotIndex > 0 && <div className="min-w-[100px]" />}

                      <Select
                        value={slot.startTime}
                        onValueChange={value =>
                          handleUpdateSlot(override.date, slotIndex, 'startTime', value)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger
                          className={`font-poppins h-11 flex-1 rounded-lg border bg-white px-4 text-sm disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                          handleUpdateSlot(override.date, slotIndex, 'endTime', value)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger
                          className={`font-poppins h-11 flex-1 rounded-lg border bg-white px-4 text-sm disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                          onClick={() => handleAddSlot(override.date)}
                          disabled={disabled}
                          className="flex h-10 w-10 items-center justify-center text-cyan-500 transition-colors hover:text-cyan-600 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          <Plus size={24} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(override.date, slotIndex)}
                          disabled={disabled}
                          className="flex h-10 w-10 items-center justify-center text-gray-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    {error && (
                      <div className="ml-[125px] flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center">
            <p className="font-poppins text-center text-base text-gray-500">
              Select dates from the calendar to add override hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverrideHoursSection;
