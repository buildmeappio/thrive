"use client";

import React from "react";
import { daysOptions, timeOptions, DayOfWeek } from "@/constants/options";
import { WeeklyHoursState } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: WeeklyHoursState;
  onChange: (next: WeeklyHoursState) => void;
  disabled?: boolean;
};

export default function WeeklyHours({ value, onChange, disabled }: Props) {
  const addTimeSlot = (day: DayOfWeek) => {
    const currentSlots = value[day].timeSlots;
    const lastSlot = currentSlots[currentSlots.length - 1];
    const lastEndIndex = timeOptions.indexOf(lastSlot?.endTime ?? "8:00 AM");
    const newStartTime =
      lastEndIndex >= 0 && lastEndIndex < timeOptions.length - 1
        ? timeOptions[lastEndIndex + 1]
        : timeOptions[timeOptions.length - 1];
    const newStartIndex = timeOptions.indexOf(newStartTime);
    const newEndTime =
      newStartIndex < timeOptions.length - 3
        ? timeOptions[newStartIndex + 3]
        : timeOptions[timeOptions.length - 1];
    onChange({
      ...value,
      [day]: {
        ...value[day],
        timeSlots: [
          ...currentSlots,
          { startTime: newStartTime, endTime: newEndTime },
        ],
      },
    });
  };

  const removeTimeSlot = (day: DayOfWeek, index: number) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        timeSlots: value[day].timeSlots.filter((_, i) => i !== index),
      },
    });
  };

  const toggleDay = (day: DayOfWeek) => {
    const isEnabled = value[day].enabled;
    const next = {
      ...value,
      [day]: { ...value[day], enabled: !isEnabled },
    };
    // If enabling and no time slots, add default
    if (!isEnabled && value[day].timeSlots.length === 0) {
      next[day].timeSlots = [{ startTime: "8:00 AM", endTime: "11:00 AM" }];
    }
    onChange(next);
  };

  return (
    <div className="space-y-4 pl-3 py-6">
      {daysOptions.map((day) => {
        const key = day.value as DayOfWeek;
        const dayData = value[key];
        if (!dayData) return null;
        return (
          <div
            key={day.value}
            className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
            <div className="flex items-center min-w-0 sm:min-w-[120px] pt-2 flex-shrink-0">
              <input
                type="checkbox"
                id={day.value}
                checked={dayData.enabled}
                disabled={disabled}
                onChange={() => toggleDay(key)}
                className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF]"
              />
              <label
                htmlFor={day.value}
                className={`ml-2 text-sm font-medium whitespace-nowrap ${
                  dayData.enabled ? "text-gray-900" : "text-gray-400"
                }`}>
                {day.label}
              </label>
            </div>
            <div className="flex-1 space-y-2 min-w-0 w-full max-w-full">
              {dayData.timeSlots.length > 0 ? (
                dayData.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="grid gap-2 items-center w-full"
                    style={{ gridTemplateColumns: "1fr 1fr auto" }}>
                    <div className="min-w-0 w-full">
                      <Select
                        value={slot.startTime}
                        onValueChange={(val) =>
                          onChange({
                            ...value,
                            [key]: {
                              ...dayData,
                              timeSlots: dayData.timeSlots.map((s, i) =>
                                i === index ? { ...s, startTime: val } : s
                              ),
                            },
                          })
                        }
                        disabled={disabled || !dayData.enabled}>
                        <SelectTrigger className="w-full px-4 py-2 h-auto border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0 w-full">
                      <Select
                        value={slot.endTime}
                        onValueChange={(val) =>
                          onChange({
                            ...value,
                            [key]: {
                              ...dayData,
                              timeSlots: dayData.timeSlots.map((s, i) =>
                                i === index ? { ...s, endTime: val } : s
                              ),
                            },
                          })
                        }
                        disabled={disabled || !dayData.enabled}>
                        <SelectTrigger className="w-full px-4 py-2 h-auto border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(key)}
                        disabled={disabled || !dayData.enabled}
                        className="p-2 text-[#00A8FF] hover:text-[#0097E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Add time slot">
                        +
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(key, index)}
                        disabled={disabled || !dayData.enabled}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove time slot">
                        ×
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 italic">
                  No time slots
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
