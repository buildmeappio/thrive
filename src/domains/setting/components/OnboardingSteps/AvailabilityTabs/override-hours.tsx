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
  const overrideHours = form.watch("overrideHours") || [];

  // Sync selectedDates with overrideHours when component mounts or overrideHours changes
  React.useEffect(() => {
    const dates = new Set(overrideHours.map((oh) => oh.date));
    setSelectedDates(dates);
  }, [overrideHours.length]); // Only re-run when the number of override hours changes

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
                {override.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
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
                        const updatedOverrides = overrideHours.map((oh) =>
                          oh.date === dateStr
                            ? {
                                ...oh,
                                timeSlots: oh.timeSlots.map((s, i) =>
                                  i === slotIndex
                                    ? { ...s, startTime: e.target.value }
                                    : s
                                ),
                              }
                            : oh
                        );
                        form.setValue("overrideHours", updatedOverrides);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px]">
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <select
                      value={slot.endTime}
                      onChange={(e) => {
                        const updatedOverrides = overrideHours.map((oh) =>
                          oh.date === dateStr
                            ? {
                                ...oh,
                                timeSlots: oh.timeSlots.map((s, i) =>
                                  i === slotIndex
                                    ? { ...s, endTime: e.target.value }
                                    : s
                                ),
                              }
                            : oh
                        );
                        form.setValue("overrideHours", updatedOverrides);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px]">
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
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
                ))}
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
