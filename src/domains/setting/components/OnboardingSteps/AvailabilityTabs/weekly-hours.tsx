"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { DayOfWeek, daysOptions, timeOptions } from "@/constants/options";

/**
 * WeeklyHours Component
 *
 * Note: This component works with LOCAL TIME (12-hour format with AM/PM).
 * Time conversion to/from UTC happens in the parent form component:
 * - When loading: UTC → Local (for display)
 * - When saving: Local → UTC (for database storage)
 */

interface WeeklyHoursProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const WeeklyHours: React.FC<WeeklyHoursProps> = ({ form }) => {
  const weeklyHours = form.watch("weeklyHours");

  // Helper function to check if a time slot spans midnight (cross-day)
  const isCrossDaySlot = (startTime: string, endTime: string): boolean => {
    const startIndex = timeOptions.indexOf(startTime);
    const endIndex = timeOptions.indexOf(endTime);
    if (startIndex === -1 || endIndex === -1) return false;
    // If end index is less than start index, it spans midnight
    return endIndex < startIndex;
  };

  // Helper function to check if times are valid
  const isValidTimeSlot = (startTime: string, endTime: string): boolean => {
    if (startTime === endTime) return false;

    const startIndex = timeOptions.indexOf(startTime);
    const endIndex = timeOptions.indexOf(endTime);
    if (startIndex === -1 || endIndex === -1) return false;

    // Cross-day slots (spanning midnight) are always valid if not equal
    if (endIndex < startIndex) return true;

    // Same-day slots: start must be before end
    return startIndex < endIndex;
  };

  // Helper function to check if two time slots overlap
  const doSlotsOverlap = (
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean => {
    const start1Index = timeOptions.indexOf(start1);
    const end1Index = timeOptions.indexOf(end1);
    const start2Index = timeOptions.indexOf(start2);
    const end2Index = timeOptions.indexOf(end2);

    if (
      start1Index === -1 ||
      end1Index === -1 ||
      start2Index === -1 ||
      end2Index === -1
    ) {
      return false;
    }

    const isSlot1CrossDay = end1Index < start1Index;
    const isSlot2CrossDay = end2Index < start2Index;

    // If both are same-day slots
    if (!isSlot1CrossDay && !isSlot2CrossDay) {
      // Overlap if: start1 < end2 AND start2 < end1
      return start1Index < end2Index && start2Index < end1Index;
    }

    // If both are cross-day slots, they always overlap (both span midnight)
    if (isSlot1CrossDay && isSlot2CrossDay) {
      return true;
    }

    // If one is cross-day and one is same-day
    // Cross-day slot overlaps with same-day if same-day is within the cross-day range
    if (isSlot1CrossDay) {
      // Slot1 spans midnight, check if slot2 overlaps
      return start2Index >= start1Index || end2Index <= end1Index;
    } else {
      // Slot2 spans midnight, check if slot1 overlaps
      return start1Index >= start2Index || end1Index <= end2Index;
    }
  };

  // Helper function to check if a time is valid for start considering previous slots
  const isValidStartTime = (
    allSlots: Array<{ startTime: string; endTime: string }>,
    currentIndex: number,
    startTime: string,
    endTime: string,
    time: string
  ): boolean => {
    if (time === endTime) return false;

    const timeIndex = timeOptions.indexOf(time);
    const endIndex = timeOptions.indexOf(endTime);
    if (timeIndex === -1 || endIndex === -1) return false;

    // Check if current slot itself is valid
    if (isCrossDaySlot(startTime, endTime)) {
      if (time === endTime) return false;
    } else {
      if (timeIndex >= endIndex) return false;
    }

    // Check overlap with previous slots
    for (let i = 0; i < currentIndex; i++) {
      const prevSlot = allSlots[i];
      if (doSlotsOverlap(time, endTime, prevSlot.startTime, prevSlot.endTime)) {
        return false;
      }
    }

    // Check overlap with next slot (if exists)
    if (currentIndex < allSlots.length - 1) {
      const nextSlot = allSlots[currentIndex + 1];
      if (doSlotsOverlap(time, endTime, nextSlot.startTime, nextSlot.endTime)) {
        return false;
      }
    }

    return true;
  };

  // Helper function to check if a time is valid for end considering other slots
  const isValidEndTime = (
    allSlots: Array<{ startTime: string; endTime: string }>,
    currentIndex: number,
    startTime: string,
    endTime: string,
    time: string
  ): boolean => {
    if (time === startTime) return false;

    const timeIndex = timeOptions.indexOf(time);
    const startIndex = timeOptions.indexOf(startTime);
    if (timeIndex === -1 || startIndex === -1) return false;

    // Check if current slot itself is valid
    if (isCrossDaySlot(startTime, endTime)) {
      if (time === startTime) return false;
    } else {
      if (timeIndex <= startIndex) return false;
    }

    // Check overlap with previous slots
    for (let i = 0; i < currentIndex; i++) {
      const prevSlot = allSlots[i];
      if (
        doSlotsOverlap(startTime, time, prevSlot.startTime, prevSlot.endTime)
      ) {
        return false;
      }
    }

    // Check overlap with next slot (if exists)
    if (currentIndex < allSlots.length - 1) {
      const nextSlot = allSlots[currentIndex + 1];
      if (
        doSlotsOverlap(startTime, time, nextSlot.startTime, nextSlot.endTime)
      ) {
        return false;
      }
    }

    return true;
  };

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
                dayData.timeSlots.map((slot, index) => {
                  // Check if slot overlaps with other slots
                  let hasOverlap = false;
                  for (let i = 0; i < dayData.timeSlots.length; i++) {
                    if (i !== index) {
                      const otherSlot = dayData.timeSlots[i];
                      if (
                        doSlotsOverlap(
                          slot.startTime,
                          slot.endTime,
                          otherSlot.startTime,
                          otherSlot.endTime
                        )
                      ) {
                        hasOverlap = true;
                        break;
                      }
                    }
                  }

                  const isInvalid =
                    !isValidTimeSlot(slot.startTime, slot.endTime) ||
                    hasOverlap;

                  return (
                    <div key={index} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <select
                          value={slot.startTime}
                          onChange={(e) => {
                            const newStartTime = e.target.value;
                            // If new start time equals end time, adjust end time
                            if (newStartTime === slot.endTime) {
                              const startIndex =
                                timeOptions.indexOf(newStartTime);
                              const newEndTime =
                                startIndex < timeOptions.length - 1
                                  ? timeOptions[startIndex + 1]
                                  : timeOptions[0]; // Wrap around to first time for cross-day
                              form.setValue(
                                `weeklyHours.${
                                  day.value as DayOfWeek
                                }.timeSlots.${index}` as any,
                                { startTime: newStartTime, endTime: newEndTime }
                              );
                            } else {
                              form.setValue(
                                `weeklyHours.${
                                  day.value as DayOfWeek
                                }.timeSlots.${index}.startTime` as any,
                                newStartTime
                              );
                            }
                          }}
                          disabled={!dayData.enabled}
                          className={`px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                            isInvalid ? "border-red-500" : "border-gray-300"
                          }`}
                          style={{ maxHeight: "200px" }}
                          size={1}>
                          {timeOptions.map((time) => {
                            const isValid = isValidStartTime(
                              dayData.timeSlots,
                              index,
                              slot.startTime,
                              slot.endTime,
                              time
                            );
                            return (
                              <option
                                key={time}
                                value={time}
                                disabled={!isValid && time !== slot.startTime}>
                                {time}
                              </option>
                            );
                          })}
                        </select>

                        <select
                          value={slot.endTime}
                          onChange={(e) => {
                            const newEndTime = e.target.value;
                            // If new end time equals start time, adjust start time
                            if (slot.startTime === newEndTime) {
                              const endIndex = timeOptions.indexOf(newEndTime);
                              const newStartTime =
                                endIndex > 0
                                  ? timeOptions[endIndex - 1]
                                  : timeOptions[timeOptions.length - 1]; // Wrap around to last time for cross-day
                              form.setValue(
                                `weeklyHours.${
                                  day.value as DayOfWeek
                                }.timeSlots.${index}` as any,
                                { startTime: newStartTime, endTime: newEndTime }
                              );
                            } else {
                              form.setValue(
                                `weeklyHours.${
                                  day.value as DayOfWeek
                                }.timeSlots.${index}.endTime` as any,
                                newEndTime
                              );
                            }
                          }}
                          disabled={!dayData.enabled}
                          className={`px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                            isInvalid ? "border-red-500" : "border-gray-300"
                          }`}
                          style={{ maxHeight: "200px" }}
                          size={1}>
                          {timeOptions.map((time) => {
                            const isValid = isValidEndTime(
                              dayData.timeSlots,
                              index,
                              slot.startTime,
                              slot.endTime,
                              time
                            );
                            return (
                              <option
                                key={time}
                                value={time}
                                disabled={!isValid && time !== slot.endTime}>
                                {time}
                              </option>
                            );
                          })}
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
                      {isInvalid && (
                        <div className="text-xs text-red-500 ml-2">
                          {hasOverlap
                            ? "This time slot overlaps with another slot"
                            : "Start time must be before end time"}
                        </div>
                      )}
                    </div>
                  );
                })
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
