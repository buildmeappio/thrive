"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { DayOfWeek, daysOptions, timeOptions } from "@/constants/options";

interface WeeklyHoursProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const WeeklyHours: React.FC<WeeklyHoursProps> = ({ form }) => {
  const weeklyHours = form.watch("weeklyHours");

  const addTimeSlot = (day: DayOfWeek) => {
    const currentSlots = weeklyHours[day].timeSlots;

    // Get the end time of the last slot
    const lastSlot = currentSlots[currentSlots.length - 1];
    const lastEndTime = lastSlot.endTime;

    // Find the index of the last end time in timeOptions
    const lastEndIndex = timeOptions.indexOf(lastEndTime);

    // Set new slot start time to be after the last end time
    // Default to next available time, or use the last end time if it's the last option
    const newStartTime =
      lastEndIndex < timeOptions.length - 1
        ? timeOptions[lastEndIndex + 1]
        : lastEndTime;

    // Set new slot end time to be 3 hours after start (or last available time)
    const newStartIndex = timeOptions.indexOf(newStartTime);
    const newEndTime =
      newStartIndex < timeOptions.length - 3
        ? timeOptions[newStartIndex + 3]
        : timeOptions[timeOptions.length - 1];

    form.setValue(`weeklyHours.${day}.timeSlots` as any, [
      ...currentSlots,
      { startTime: newStartTime, endTime: newEndTime },
    ]);
  };

  const removeTimeSlot = (day: DayOfWeek, index: number) => {
    const currentSlots = weeklyHours[day].timeSlots;
    form.setValue(
      `weeklyHours.${day}.timeSlots` as any,
      currentSlots.filter((_, i) => i !== index)
    );
  };

  const toggleDay = (day: DayOfWeek) => {
    const isEnabled = weeklyHours[day].enabled;
    form.setValue(`weeklyHours.${day}.enabled` as any, !isEnabled);

    // If enabling and no time slots exist, add a default one
    if (!isEnabled && weeklyHours[day].timeSlots.length === 0) {
      form.setValue(`weeklyHours.${day}.timeSlots` as any, [
        { startTime: "8:00 AM", endTime: "11:00 AM" },
      ]);
    }
    // If disabling, keep the time slots (don't clear them)
  };

  return (
    <div className="space-y-4 pl-3 py-6">
      <style jsx>{`
        select[size="1"] option {
          padding: 8px;
        }
      `}</style>
      {daysOptions.map((day) => {
        const dayData = weeklyHours[day.value as DayOfWeek];

        // Safety check: if dayData is undefined, skip this day
        if (!dayData) {
          return null;
        }

        return (
          <div key={day.value} className="flex items-start gap-4">
            {/* Day Checkbox */}
            <div className="flex items-center min-w-[120px] pt-2">
              <input
                type="checkbox"
                id={day.value}
                checked={dayData.enabled}
                onChange={() => toggleDay(day.value as DayOfWeek)}
                className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF]"
              />
              <label
                htmlFor={day.value}
                className={`ml-2 text-sm font-medium ${
                  dayData.enabled ? "text-gray-900" : "text-gray-400"
                }`}>
                {day.label}
              </label>
            </div>

            {/* Time Slots */}
            <div className="flex-1 space-y-2">
              {dayData.timeSlots.length > 0 ? (
                dayData.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        form.setValue(
                          `weeklyHours.${
                            day.value as DayOfWeek
                          }.timeSlots.${index}.startTime` as any,
                          e.target.value
                        )
                      }
                      disabled={!dayData.enabled}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                      style={{ maxHeight: "200px" }}
                      size={1}>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        form.setValue(
                          `weeklyHours.${
                            day.value as DayOfWeek
                          }.timeSlots.${index}.endTime` as any,
                          e.target.value
                        )
                      }
                      disabled={!dayData.enabled}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                      style={{ maxHeight: "200px" }}
                      size={1}>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    {/* Show + icon only on the first slot */}
                    {index === 0 && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day.value as DayOfWeek)}
                        disabled={!dayData.enabled}
                        className="p-2 text-[#00A8FF] hover:text-[#0097E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Add time slot">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    {/* Show delete icon only on 2nd, 3rd slots, etc (not on the first slot) */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeTimeSlot(day.value as DayOfWeek, index)
                        }
                        disabled={!dayData.enabled}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove time slot">
                        <Trash2 className="w-4 h-4" />
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
};

export default WeeklyHours;
