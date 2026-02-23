"use client";

import React, { useMemo, useState } from "react";
import { timeOptions } from "@/constants/options";
import { OverrideHoursState } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: OverrideHoursState;
  onChange: (next: OverrideHoursState) => void;
  disabled?: boolean;
};

export default function OverrideHours({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedSet = useMemo(() => new Set(value.map((v) => v.date)), [value]);

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
    if (selectedSet.has(dateStr)) {
      onChange(value.filter((oh) => oh.date !== dateStr));
    } else {
      onChange([
        ...value,
        {
          date: dateStr,
          timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
        },
      ]);
    }
  };

  const addTimeSlot = (dateStr: string) => {
    const dateOverride = value.find((oh) => oh.date === dateStr);
    if (!dateOverride) return;
    const lastSlot = dateOverride.timeSlots[dateOverride.timeSlots.length - 1];
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
    onChange(
      value.map((oh) =>
        oh.date === dateStr
          ? {
              ...oh,
              timeSlots: [
                ...oh.timeSlots,
                { startTime: newStartTime, endTime: newEndTime },
              ],
            }
          : oh,
      ),
    );
  };

  const removeTimeSlot = (dateStr: string, slotIndex: number) => {
    onChange(
      value.map((oh) =>
        oh.date === dateStr
          ? { ...oh, timeSlots: oh.timeSlots.filter((_, i) => i !== slotIndex) }
          : oh,
      ),
    );
  };

  const previousMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );

  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();
  const isPastDate = (date: Date) => {
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return date < todayStart;
  };

  const weeks = useMemo(() => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const out: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) week.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        out.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      out.push(week);
    }
    return out;
  }, [currentMonth]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 py-6 pl-3 min-w-0">
      <div className="bg-[#FCFDFF] border border-gray-300 rounded-2xl p-4 lg:p-6 w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 h-auto lg:h-[380px] max-w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={previousMonth}
            disabled={isCurrentMonth || disabled}
            className={`p-1.5 rounded-full cursor-pointer transition-colors ${
              isCurrentMonth || disabled
                ? "cursor-not-allowed opacity-40"
                : "bg-[#E8F1FF] hover:bg-[#d0e3ff]"
            }`}
          >
            ‹
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
            disabled={disabled}
            className={`p-1.5 rounded-full cursor-pointer bg-[#E8F1FF] hover:bg-[#d0e3ff] transition-colors ${
              disabled ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            ›
          </button>
        </div>
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
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (day === null)
                return <div key={`${wi}-${di}`} className="aspect-square" />;
              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day,
              );
              const dateStr = formatDate(date);
              const isSelected = selectedSet.has(dateStr);
              const isToday = today.toDateString() === date.toDateString();
              const dow = date.getDay();
              const isWeekday = dow >= 1 && dow <= 5;
              const isPast = isPastDate(date);
              return (
                <button
                  key={`${wi}-${di}`}
                  type="button"
                  onClick={() =>
                    !isPast && !disabled && toggleDateSelection(dateStr)
                  }
                  disabled={isPast || disabled}
                  className={`aspect-square rounded-full text-base transition-all relative ${
                    isPast || disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : isSelected
                        ? "bg-[#00A8FF] font-bold text-white"
                        : isToday
                          ? "bg-[#00A8FF] font-bold text-white"
                          : isWeekday
                            ? "bg-[#E8F1FF] text-[#00A8FF] font-semibold hover:bg-[#d0e3ff]"
                            : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {isToday && !isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                  {day}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div
        className={`flex-1 min-w-0 ${
          disabled ? "" : "overflow-y-auto max-h-[500px]"
        }`}
      >
        {value.map((override) => (
          <div key={override.date} className="mb-6">
            <div className="space-y-2">
              {override.timeSlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="grid gap-2 items-center w-full"
                  style={{ gridTemplateColumns: "auto 1fr 1fr auto" }}
                >
                  {slotIndex === 0 ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked
                        onChange={() =>
                          !disabled && toggleDateSelection(override.date)
                        }
                        disabled={disabled}
                        className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF] flex-shrink-0"
                      />
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {override.date}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-4 h-4"></div>
                      <div className="min-w-[100px]"></div>
                    </div>
                  )}
                  <div className="min-w-0 w-full">
                    <Select
                      value={slot.startTime}
                      onValueChange={(val) =>
                        !disabled &&
                        onChange(
                          value.map((oh) =>
                            oh.date === override.date
                              ? {
                                  ...oh,
                                  timeSlots: oh.timeSlots.map((s, i) =>
                                    i === slotIndex
                                      ? { ...s, startTime: val }
                                      : s,
                                  ),
                                }
                              : oh,
                          ),
                        )
                      }
                      disabled={disabled}
                    >
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
                        !disabled &&
                        onChange(
                          value.map((oh) =>
                            oh.date === override.date
                              ? {
                                  ...oh,
                                  timeSlots: oh.timeSlots.map((s, i) =>
                                    i === slotIndex
                                      ? { ...s, endTime: val }
                                      : s,
                                  ),
                                }
                              : oh,
                          ),
                        )
                      }
                      disabled={disabled}
                    >
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
                  {slotIndex === 0 ? (
                    <button
                      type="button"
                      onClick={() => !disabled && addTimeSlot(override.date)}
                      disabled={disabled}
                      className={`p-2 text-[#00A8FF] hover:text-[#0097E5] transition-colors ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="Add time slot"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        !disabled && removeTimeSlot(override.date, slotIndex)
                      }
                      disabled={disabled}
                      className={`p-2 text-gray-400 hover:text-red-500 transition-colors ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="Remove time slot"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {value.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p>Select dates from the calendar to set override hours</p>
          </div>
        )}
      </div>
    </div>
  );
}
