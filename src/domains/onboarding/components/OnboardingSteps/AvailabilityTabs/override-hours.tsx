"use client";
import React, { useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { timeOptions } from "@/constants/options";

/**
 * OverrideHours Component
 *
 * Note: This component works with LOCAL TIME (12-hour format with AM/PM).
 * Time conversion to/from UTC happens in the parent form component:
 * - When loading: UTC → Local (for display)
 * - When saving: Local → UTC (for database storage)
 */

interface OverrideHoursProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const OverrideHours: React.FC<OverrideHoursProps> = ({ form }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const rawOverrideHours = form.watch("overrideHours");
  const overrideHours = React.useMemo(
    () => rawOverrideHours ?? [],
    [rawOverrideHours]
  );

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

  // Sync selectedDates with overrideHours when component mounts or overrideHours changes
  React.useEffect(() => {
    const dates = new Set(overrideHours.map((oh) => oh.date));
    setSelectedDates(dates);
  }, [overrideHours]);

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const toggleDateSelection = (dateStr: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
      // Remove from overrideHours
      form.setValue(
        "overrideHours",
        overrideHours.filter((oh) => oh.date !== dateStr)
      );
    } else {
      newSelected.add(dateStr);
      // Add to overrideHours
      form.setValue("overrideHours", [
        ...overrideHours,
        {
          date: dateStr,
          timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
        },
      ]);
    }
    setSelectedDates(newSelected);
  };

  const addOverrideTimeSlot = (dateStr: string) => {
    const dateOverride = overrideHours.find((oh) => oh.date === dateStr);
    if (dateOverride) {
      // Get the end time of the last slot
      const lastSlot =
        dateOverride.timeSlots[dateOverride.timeSlots.length - 1];
      const lastEndTime = lastSlot.endTime;

      // Find the index of the last end time in timeOptions
      const lastEndIndex = timeOptions.indexOf(lastEndTime);

      // Set new slot start time to be after the last end time
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

      const updatedOverrides = overrideHours.map((oh) =>
        oh.date === dateStr
          ? {
              ...oh,
              timeSlots: [
                ...oh.timeSlots,
                { startTime: newStartTime, endTime: newEndTime },
              ],
            }
          : oh
      );
      form.setValue("overrideHours", updatedOverrides);
    }
  };

  const removeOverrideTimeSlot = (dateStr: string, slotIndex: number) => {
    const updatedOverrides = overrideHours.map((oh) =>
      oh.date === dateStr
        ? {
            ...oh,
            timeSlots: oh.timeSlots.filter((_, i) => i !== slotIndex),
          }
        : oh
    );
    form.setValue("overrideHours", updatedOverrides);
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  // Check if we're in the current month
  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  // Check if a date is in the past (before today)
  const isPastDate = (date: Date) => {
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return date < todayStart;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      week.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // Add empty cells for remaining days
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return weeks;
  };

  return (
    <div className="flex gap-12 py-6 pl-3">
      {/* Calendar */}
      <div className="bg-[#FCFDFF] border border-gray-300 rounded-2xl p-6 w-[380px] flex-shrink-0 h-[380px]">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={previousMonth}
            disabled={isCurrentMonth}
            className={`p-1.5 rounded-full cursor-pointer transition-colors ${
              isCurrentMonth
                ? "cursor-not-allowed opacity-40"
                : "bg-[#E8F1FF] hover:bg-[#d0e3ff]"
            }`}>
            <ChevronLeft
              className={`w-5 h-5  ${
                isCurrentMonth ? "text-gray-400" : "text-[#00A8FF]"
              }`}
            />
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-full cursor-pointer bg-[#E8F1FF] hover:bg-[#d0e3ff] transition-colors">
            <ChevronRight className="w-5 h-5 text-[#00A8FF]" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendar().map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="aspect-square"
                  />
                );
              }

              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );
              const dateStr = formatDate(date);
              const isSelected = selectedDates.has(dateStr);
              const isToday = today.toDateString() === date.toDateString();
              const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
              const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
              const isPast = isPastDate(date);

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  type="button"
                  onClick={() => !isPast && toggleDateSelection(dateStr)}
                  disabled={isPast}
                  className={`aspect-square rounded-full text-base transition-all relative ${
                    isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#00A8FF] font-bold text-white"
                      : isToday
                      ? "bg-[#00A8FF] font-bold text-white"
                      : isWeekday
                      ? "bg-[#E8F1FF] text-[#00A8FF] font-semibold hover:bg-[#d0e3ff]"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}>
                  {isToday && !isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                  {day}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Override Time Slots */}
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {Array.from(selectedDates).map((dateStr) => {
          const override = overrideHours.find((oh) => oh.date === dateStr);
          if (!override) return null;

          return (
            <div key={dateStr} className="mb-6">
              <div className="space-y-2">
                {override.timeSlots.map((slot, slotIndex) => {
                  // Check if slot overlaps with other slots
                  let hasOverlap = false;
                  for (let i = 0; i < override.timeSlots.length; i++) {
                    if (i !== slotIndex) {
                      const otherSlot = override.timeSlots[i];
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
                    <div key={slotIndex} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {/* Show date checkbox only on the first slot */}
                        {slotIndex === 0 && (
                          <>
                            <input
                              type="checkbox"
                              checked
                              onChange={() => toggleDateSelection(dateStr)}
                              className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF]"
                            />
                            <span className="text-sm font-medium text-gray-900 min-w-[100px]">
                              {dateStr}
                            </span>
                          </>
                        )}

                        {/* Add spacing for subsequent slots to align with first slot */}
                        {slotIndex > 0 && <div className="w-4 h-4"></div>}
                        {slotIndex > 0 && <div className="min-w-[100px]"></div>}
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
                              const updatedOverrides = overrideHours.map((oh) =>
                                oh.date === dateStr
                                  ? {
                                      ...oh,
                                      timeSlots: oh.timeSlots.map((s, i) =>
                                        i === slotIndex
                                          ? {
                                              ...s,
                                              startTime: newStartTime,
                                              endTime: newEndTime,
                                            }
                                          : s
                                      ),
                                    }
                                  : oh
                              );
                              form.setValue("overrideHours", updatedOverrides);
                            } else {
                              const updatedOverrides = overrideHours.map((oh) =>
                                oh.date === dateStr
                                  ? {
                                      ...oh,
                                      timeSlots: oh.timeSlots.map((s, i) =>
                                        i === slotIndex
                                          ? { ...s, startTime: newStartTime }
                                          : s
                                      ),
                                    }
                                  : oh
                              );
                              form.setValue("overrideHours", updatedOverrides);
                            }
                          }}
                          className={`px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px] ${
                            isInvalid ? "border-red-500" : "border-gray-300"
                          }`}>
                          {timeOptions.map((time) => {
                            const isValid = isValidStartTime(
                              override.timeSlots,
                              slotIndex,
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
                              const updatedOverrides = overrideHours.map((oh) =>
                                oh.date === dateStr
                                  ? {
                                      ...oh,
                                      timeSlots: oh.timeSlots.map((s, i) =>
                                        i === slotIndex
                                          ? {
                                              ...s,
                                              startTime: newStartTime,
                                              endTime: newEndTime,
                                            }
                                          : s
                                      ),
                                    }
                                  : oh
                              );
                              form.setValue("overrideHours", updatedOverrides);
                            } else {
                              const updatedOverrides = overrideHours.map((oh) =>
                                oh.date === dateStr
                                  ? {
                                      ...oh,
                                      timeSlots: oh.timeSlots.map((s, i) =>
                                        i === slotIndex
                                          ? { ...s, endTime: newEndTime }
                                          : s
                                      ),
                                    }
                                  : oh
                              );
                              form.setValue("overrideHours", updatedOverrides);
                            }
                          }}
                          className={`px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px] ${
                            isInvalid ? "border-red-500" : "border-gray-300"
                          }`}>
                          {timeOptions.map((time) => {
                            const isValid = isValidEndTime(
                              override.timeSlots,
                              slotIndex,
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
                        {slotIndex === 0 && (
                          <button
                            type="button"
                            onClick={() => addOverrideTimeSlot(dateStr)}
                            className="p-2 text-[#00A8FF] hover:text-[#0097E5] transition-colors"
                            title="Add time slot">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Show delete icon only on 2nd, 3rd slots, etc (not on the first slot) */}
                        {slotIndex > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeOverrideTimeSlot(dateStr, slotIndex)
                            }
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                })}
              </div>
            </div>
          );
        })}

        {selectedDates.size === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p>Select dates from the calendar to set override hours</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverrideHours;
