'use client';

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { WeeklyHours, OverrideHours, Weekday } from '@/domains/services/types/Availability';
import { WeeklyHoursState, OverrideHoursState } from './types';

type UnifiedWeeklyHours = WeeklyHours[] | WeeklyHoursState;
type UnifiedOverrideHours = OverrideHours[] | OverrideHoursState;

type UnifiedAvailabilitySectionProps = {
  weeklyHours: UnifiedWeeklyHours;
  overrideHours: UnifiedOverrideHours;
  onWeeklyHoursChange: (weeklyHours: UnifiedWeeklyHours) => void;
  onOverrideHoursChange: (overrideHours: UnifiedOverrideHours) => void;
  disabled?: boolean;
  dataFormat?: 'chaperone' | 'transporter-interpreter'; // Format indicator
};

// Helper to convert WeeklyHoursState to WeeklyHours[]
const convertStateToArray = (state: WeeklyHoursState): WeeklyHours[] => {
  const dayMap: Record<string, Weekday> = {
    sunday: 'SUNDAY',
    monday: 'MONDAY',
    tuesday: 'TUESDAY',
    wednesday: 'WEDNESDAY',
    thursday: 'THURSDAY',
    friday: 'FRIDAY',
    saturday: 'SATURDAY',
  };

  return Object.entries(state).map(([day, data]) => ({
    dayOfWeek: dayMap[day] || day.toUpperCase() as Weekday,
    enabled: data.enabled,
    timeSlots: data.timeSlots,
  }));
};

// Helper to convert WeeklyHours[] to WeeklyHoursState
const convertArrayToState = (array: WeeklyHours[]): WeeklyHoursState => {
  const state: WeeklyHoursState = {};
  array.forEach((wh) => {
    const dayKey = wh.dayOfWeek.toLowerCase();
    state[dayKey] = {
      enabled: wh.enabled,
      timeSlots: wh.timeSlots,
    };
  });
  return state;
};

// Helper to convert OverrideHours[] to OverrideHoursState
const convertOverrideArrayToState = (array: OverrideHours[]): OverrideHoursState => {
  return array.map((oh) => {
    // Convert YYYY-MM-DD to MM-DD-YYYY
    const date = new Date(oh.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${month}-${day}-${year}`;
    return {
      date: formattedDate,
      timeSlots: oh.timeSlots,
    };
  });
};

// Helper to convert OverrideHoursState to OverrideHours[]
const convertOverrideStateToArray = (state: OverrideHoursState): OverrideHours[] => {
  return state.map((oh) => {
    // Convert MM-DD-YYYY to YYYY-MM-DD
    const dateParts = oh.date.split('-');
    if (dateParts.length === 3) {
      const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
      return {
        date: formattedDate,
        timeSlots: oh.timeSlots,
      };
    }
    // Fallback if format is unexpected
    return {
      date: oh.date,
      timeSlots: oh.timeSlots,
    };
  });
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

const DAYS: { value: Weekday; label: string }[] = [
  { value: 'SUNDAY', label: 'Sunday' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
];

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
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  hour24 = (hour24 + hoursToAdd) % 24;
  
  const newPeriod = hour24 >= 12 ? 'PM' : 'AM';
  const newHour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  
  return `${newHour}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
};

export default function UnifiedAvailabilitySection({
  weeklyHours,
  overrideHours,
  onWeeklyHoursChange,
  onOverrideHoursChange,
  disabled = false,
  dataFormat = 'chaperone',
}: UnifiedAvailabilitySectionProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "override">("weekly");

  // Normalize weekly hours to array format
  const normalizedWeeklyHours: WeeklyHours[] = Array.isArray(weeklyHours)
    ? weeklyHours
    : convertStateToArray(weeklyHours);

  // Normalize override hours to array format
  const normalizedOverrideHours: OverrideHours[] = Array.isArray(overrideHours)
    ? overrideHours
    : convertOverrideStateToArray(overrideHours);

  // Handle weekly hours changes
  const handleWeeklyHoursChange = (updated: WeeklyHours[]) => {
    if (dataFormat === 'chaperone') {
      onWeeklyHoursChange(updated);
    } else {
      onWeeklyHoursChange(convertArrayToState(updated));
    }
  };

  // Handle override hours changes
  const handleOverrideHoursChange = (updated: OverrideHours[]) => {
    if (dataFormat === 'chaperone') {
      onOverrideHoursChange(updated);
    } else {
      onOverrideHoursChange(convertOverrideArrayToState(updated));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-black font-poppins">
          Availability
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-gray-50 px-6">
        <button
          type="button"
          onClick={() => setActiveTab("weekly")}
          className={`px-6 py-4 font-poppins font-medium text-base transition-all duration-200 relative ${
            activeTab === "weekly"
              ? "text-black bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          Weekly Hours
          {activeTab === "weekly" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("override")}
          className={`px-6 py-4 font-poppins font-medium text-base transition-all duration-200 relative ${
            activeTab === "override"
              ? "text-black bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          Override Hours
          {activeTab === "override" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "weekly" ? (
          <UnifiedWeeklyHoursSection
            weeklyHours={normalizedWeeklyHours}
            onChange={handleWeeklyHoursChange}
            disabled={disabled}
          />
        ) : (
          <UnifiedOverrideHoursSection
            overrideHours={normalizedOverrideHours}
            onChange={handleOverrideHoursChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

// Weekly Hours Section Component
type UnifiedWeeklyHoursSectionProps = {
  weeklyHours: WeeklyHours[];
  onChange: (weeklyHours: WeeklyHours[]) => void;
  disabled?: boolean;
};

type TimeSlotError = {
  day: Weekday;
  slotIndex: number;
  message: string;
};

function UnifiedWeeklyHoursSection({
  weeklyHours,
  onChange,
  disabled = false,
}: UnifiedWeeklyHoursSectionProps) {
  const [errors, setErrors] = useState<TimeSlotError[]>([]);

  // Helper function to get valid end time options based on start time
  const getValidEndTimeOptions = (startTime: string, currentEndTime?: string): string[] => {
    const startMinutes = timeToMinutes(startTime);
    const validOptions = timeOptions.filter(time => {
      const timeMinutes = timeToMinutes(time);
      return timeMinutes > startMinutes;
    });
    
    if (currentEndTime && !validOptions.includes(currentEndTime)) {
      return [currentEndTime, ...validOptions];
    }
    
    return validOptions;
  };

  // Validate time slots whenever weeklyHours changes
  React.useEffect(() => {
    const newErrors: TimeSlotError[] = [];

    weeklyHours.forEach((dayHours) => {
      if (!dayHours.enabled || dayHours.timeSlots.length === 0) return;

      dayHours.timeSlots.forEach((slot, slotIndex) => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        if (startMinutes >= endMinutes) {
          newErrors.push({
            day: dayHours.dayOfWeek,
            slotIndex,
            message: 'Start time must be before end time',
          });
        }

        for (let otherIndex = slotIndex + 1; otherIndex < dayHours.timeSlots.length; otherIndex++) {
          const otherSlot = dayHours.timeSlots[otherIndex];
          const otherStartMinutes = timeToMinutes(otherSlot.startTime);
          const otherEndMinutes = timeToMinutes(otherSlot.endTime);

          const hasOverlap =
            (startMinutes >= otherStartMinutes && startMinutes < otherEndMinutes) ||
            (endMinutes > otherStartMinutes && endMinutes <= otherEndMinutes) ||
            (startMinutes <= otherStartMinutes && endMinutes >= otherEndMinutes);

          if (hasOverlap) {
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
    return errors.find((e) => e.day === day && e.slotIndex === slotIndex)?.message;
  };

  const handleDayToggle = (day: Weekday, checked: boolean) => {
    const updated = weeklyHours.map((wh) =>
      wh.dayOfWeek === day ? { ...wh, enabled: checked } : wh
    );
    onChange(updated);
  };

  const handleAddSlot = (day: Weekday) => {
    const updated = weeklyHours.map((wh) => {
      if (wh.dayOfWeek === day) {
        let newStartTime = '8:00 AM';
        let newEndTime = '11:00 AM';
        
        if (wh.timeSlots.length > 0) {
          const lastSlot = wh.timeSlots[wh.timeSlots.length - 1];
          newStartTime = addHoursToTime(lastSlot.endTime, 1);
          newEndTime = addHoursToTime(newStartTime, 1);
        }
        
        return { 
          ...wh, 
          timeSlots: [...wh.timeSlots, { startTime: newStartTime, endTime: newEndTime }] 
        };
      }
      return wh;
    });
    onChange(updated);
  };

  const handleRemoveSlot = (day: Weekday, slotIndex: number) => {
    const updated = weeklyHours.map((wh) =>
      wh.dayOfWeek === day
        ? { ...wh, timeSlots: wh.timeSlots.filter((_, idx) => idx !== slotIndex) }
        : wh
    );
    onChange(updated);
  };

  const handleUpdateSlot = (day: Weekday, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = weeklyHours.map((wh) =>
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
    return weeklyHours.find((wh) => wh.dayOfWeek === day) || {
      dayOfWeek: day,
      enabled: false,
      timeSlots: [],
    };
  };

  return (
    <div className="space-y-4 w-full md:w-1/3">
      {DAYS.map((day) => {
        const dayHours = getDayHours(day.value);
        const hasTimeSlots = dayHours.timeSlots.length > 0;
        
        return (
          <div key={day.value} className="space-y-2">
            {!hasTimeSlots ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={dayHours.enabled}
                    onCheckedChange={(checked) => {
                      handleDayToggle(day.value, !!checked);
                      if (checked && dayHours.timeSlots.length === 0) {
                        handleAddSlot(day.value);
                      }
                    }}
                    disabled={disabled}
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className={`text-base font-poppins cursor-pointer select-none ${
                      dayHours.enabled ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {day.label}
                  </label>
                </div>
                <Select value="8:00 AM" disabled={!dayHours.enabled || disabled}>
                  <SelectTrigger className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-poppins disabled:bg-gray-50 disabled:text-gray-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value="11:00 AM" disabled={!dayHours.enabled || disabled}>
                  <SelectTrigger className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-poppins disabled:bg-gray-50 disabled:text-gray-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => dayHours.enabled && handleAddSlot(day.value)}
                  disabled={!dayHours.enabled || disabled}
                  className="flex items-center justify-center w-10 h-10 text-cyan-500 hover:text-cyan-600 disabled:text-gray-300 disabled:cursor-not-allowed"
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
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={dayHours.enabled}
                            onCheckedChange={(checked) => handleDayToggle(day.value, !!checked)}
                            disabled={disabled}
                            className="w-5 h-5"
                          />
                          <label
                            htmlFor={`day-${day.value}`}
                            className={`text-base font-poppins cursor-pointer select-none ${
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
                        onValueChange={(value) => handleUpdateSlot(day.value, slotIndex, 'startTime', value)}
                        disabled={!dayHours.enabled || disabled}
                      >
                        <SelectTrigger className={`h-11 rounded-lg border bg-white px-4 text-sm font-poppins disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={slot.endTime}
                        onValueChange={(value) => handleUpdateSlot(day.value, slotIndex, 'endTime', value)}
                        disabled={!dayHours.enabled || disabled}
                      >
                        <SelectTrigger className={`h-11 rounded-lg border bg-white px-4 text-sm font-poppins disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getValidEndTimeOptions(slot.startTime, slot.endTime).map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {slotIndex === 0 ? (
                        <button
                          type="button"
                          onClick={() => dayHours.enabled && handleAddSlot(day.value)}
                          disabled={!dayHours.enabled || disabled}
                          className="flex items-center justify-center w-10 h-10 text-cyan-500 hover:text-cyan-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <Plus size={24} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day.value, slotIndex)}
                          disabled={!dayHours.enabled || disabled}
                          className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-500 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 ml-[140px] text-red-500 text-sm">
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
}

// Override Hours Section Component
type UnifiedOverrideHoursSectionProps = {
  overrideHours: OverrideHours[];
  onChange: (overrideHours: OverrideHours[]) => void;
  disabled?: boolean;
};

type OverrideTimeSlotError = {
  date: string;
  slotIndex: number;
  message: string;
};

function UnifiedOverrideHoursSection({
  overrideHours,
  onChange,
  disabled = false,
}: UnifiedOverrideHoursSectionProps) {
  const [errors, setErrors] = useState<OverrideTimeSlotError[]>([]);

  // Helper function to get valid end time options based on start time
  const getValidEndTimeOptions = (startTime: string, currentEndTime?: string): string[] => {
    const startMinutes = timeToMinutes(startTime);
    const validOptions = timeOptions.filter(time => {
      const timeMinutes = timeToMinutes(time);
      return timeMinutes > startMinutes;
    });
    
    if (currentEndTime && !validOptions.includes(currentEndTime)) {
      return [currentEndTime, ...validOptions];
    }
    
    return validOptions;
  };

  // Validate time slots whenever overrideHours changes
  React.useEffect(() => {
    const newErrors: OverrideTimeSlotError[] = [];

    overrideHours.forEach((dateHours) => {
      dateHours.timeSlots.forEach((slot, slotIndex) => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        if (startMinutes >= endMinutes) {
          newErrors.push({
            date: dateHours.date,
            slotIndex,
            message: 'Start time must be before end time',
          });
        }

        for (let otherIndex = slotIndex + 1; otherIndex < dateHours.timeSlots.length; otherIndex++) {
          const otherSlot = dateHours.timeSlots[otherIndex];
          const otherStartMinutes = timeToMinutes(otherSlot.startTime);
          const otherEndMinutes = timeToMinutes(otherSlot.endTime);

          const hasOverlap =
            (startMinutes >= otherStartMinutes && startMinutes < otherEndMinutes) ||
            (endMinutes > otherStartMinutes && endMinutes <= otherEndMinutes) ||
            (startMinutes <= otherStartMinutes && endMinutes >= otherEndMinutes);

          if (hasOverlap) {
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
    return errors.find((e) => e.date === date && e.slotIndex === slotIndex)?.message;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = overrideHours.find((oh) => oh.date === dateStr);
    
    if (!existing) {
      onChange([...overrideHours, {
        date: dateStr,
        timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
      }]);
    } else {
      onChange(overrideHours.filter((oh) => oh.date !== dateStr));
    }
  };

  const handleAddSlot = (dateStr: string) => {
    const updated = overrideHours.map((oh) => {
      if (oh.date === dateStr) {
        let newStartTime = '8:00 AM';
        let newEndTime = '11:00 AM';
        
        if (oh.timeSlots.length > 0) {
          const lastSlot = oh.timeSlots[oh.timeSlots.length - 1];
          newStartTime = addHoursToTime(lastSlot.endTime, 1);
          newEndTime = addHoursToTime(newStartTime, 1);
        }
        
        return { 
          ...oh, 
          timeSlots: [...oh.timeSlots, { startTime: newStartTime, endTime: newEndTime }] 
        };
      }
      return oh;
    });
    onChange(updated);
  };

  const handleRemoveSlot = (dateStr: string, slotIndex: number) => {
    const updated = overrideHours.map((oh) => {
      if (oh.date === dateStr) {
        const newTimeSlots = oh.timeSlots.filter((_, idx) => idx !== slotIndex);
        if (newTimeSlots.length === 0) {
          return null;
        }
        return { ...oh, timeSlots: newTimeSlots };
      }
      return oh;
    }).filter(Boolean) as OverrideHours[];
    
    onChange(updated);
  };

  const handleUpdateSlot = (dateStr: string, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = overrideHours.map((oh) =>
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
      onChange(overrideHours.filter((oh) => oh.date !== dateStr));
    }
  };

  const getSelectedDates = (): Date[] => {
    return overrideHours.map((oh) => new Date(oh.date));
  };

  const sortedOverrideHours = [...overrideHours].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Calendar */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm">
        <div className="[--cell-size:2.75rem] [&_[role=grid]]:min-h-[280px]">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleDateSelect}
            disabled={disabled}
            showOutsideDays={false}
            modifiers={{ 
              today: (date) => {
                const today = new Date();
                return date.toDateString() === today.toDateString();
              },
              weekday: (date) => {
                const day = date.getDay();
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const isOverride = getSelectedDates().some(d => d.toDateString() === date.toDateString());
                return day >= 1 && day <= 5 && !isToday && !isOverride;
              },
              hasOverride: (date) => {
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const isOverride = getSelectedDates().some(d => d.toDateString() === date.toDateString());
                return isOverride && !isToday;
              },
            }}
            modifiersClassNames={{
              today: 'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full hover:from-[#0090DD] hover:to-[#01D4AE] [&_button]:!bg-transparent [&_button]:text-white [&_button]:font-semibold [&_button]:relative [&_button]:after:content-[\'\'] [&_button]:after:absolute [&_button]:after:bottom-1 [&_button]:after:left-1/2 [&_button]:after:-translate-x-1/2 [&_button]:after:w-1 [&_button]:after:h-1 [&_button]:after:bg-white [&_button]:after:rounded-full',
              hasOverride: 'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full hover:from-[#0090DD] hover:to-[#01D4AE] [&_button]:!bg-transparent [&_button]:text-white [&_button]:font-medium',
              weekday: 'bg-[#E8F1FF] rounded-full hover:bg-[#D0E4FF] [&_button]:!bg-transparent [&_button]:text-[#00A8FF] [&_button]:font-medium',
            }}
            classNames={{
              caption_label: "text-xl font-semibold font-poppins text-gray-900",
              button_previous: "h-8 w-8 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors text-blue-600 p-0 flex items-center justify-center cursor-pointer [&_svg]:w-6 [&_svg]:h-6",
              button_next: "h-8 w-8 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors text-blue-600 p-0 flex items-center justify-center cursor-pointer [&_svg]:w-6 [&_svg]:h-6",
              weekdays: "flex gap-1 justify-around",
              weekday: "text-gray-600 font-medium text-sm font-poppins flex-1 text-center",
              week: "mt-2 flex w-full gap-1 justify-around",
              day: "rounded-full flex-1 flex items-center justify-center p-1",
              day_button: "h-9 w-9 font-normal text-base rounded-full font-poppins hover:bg-gray-100",
              today: "!bg-transparent",
              day_today: "!bg-transparent",
              day_outside: "invisible",
              day_disabled: "text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent",
            }}
          />
        </div>
      </div>

      {/* Selected Dates List */}
      <div className="flex flex-col space-y-4 w-full lg:w-auto lg:min-w-[500px] lg:max-w-[600px]">
        {sortedOverrideHours.length > 0 ? (
          sortedOverrideHours.map((override) => (
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
                          onCheckedChange={(checked) => handleToggleDate(override.date, !!checked)}
                          disabled={disabled}
                          className="w-5 h-5"
                        />
                      )}
                      {slotIndex > 0 && <div className="w-5" />}
                      
                      {slotIndex === 0 && (
                        <label
                          htmlFor={`date-${override.date}`}
                          className="min-w-[100px] text-base font-poppins text-gray-900 cursor-pointer"
                        >
                          {format(new Date(override.date), 'MM-dd-yyyy')}
                        </label>
                      )}
                      {slotIndex > 0 && <div className="min-w-[100px]" />}
                      
                      <Select
                        value={slot.startTime}
                        onValueChange={(value) => handleUpdateSlot(override.date, slotIndex, 'startTime', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className={`flex-1 h-11 rounded-lg border bg-white px-4 text-sm font-poppins disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={slot.endTime}
                        onValueChange={(value) => handleUpdateSlot(override.date, slotIndex, 'endTime', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className={`flex-1 h-11 rounded-lg border bg-white px-4 text-sm font-poppins disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getValidEndTimeOptions(slot.startTime, slot.endTime).map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {slotIndex === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddSlot(override.date)}
                          disabled={disabled}
                          className="flex items-center justify-center w-10 h-10 text-cyan-500 hover:text-cyan-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={24} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(override.date, slotIndex)}
                          disabled={disabled}
                          className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 ml-[125px] text-red-500 text-sm">
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
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-gray-500 font-poppins text-center text-base">
              Select dates from the calendar to add override hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

