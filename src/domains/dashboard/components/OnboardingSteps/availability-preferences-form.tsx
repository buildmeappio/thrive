"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useForm } from "@/hooks/use-form-hook";
import { FormProvider } from "@/components/form";
import {
  CircleCheck,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  availabilityPreferencesSchema,
  AvailabilityPreferencesInput,
} from "../../schemas/onboardingSteps.schema";
import { availabilityInitialValues } from "../../constants";
import { DayOfWeek, daysOptions, timeOptions } from "@/constants/options";

interface AvailabilityPreferencesFormProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const AvailabilityPreferencesForm: React.FC<
  AvailabilityPreferencesFormProps
> = ({ onComplete, onCancel: _onCancel }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [examinerProfileId, setExaminerProfileId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "weeklyHours" | "overrideHours" | "bookingOptions"
  >("weeklyHours");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const form = useForm<AvailabilityPreferencesInput>({
    schema: availabilityPreferencesSchema,
    defaultValues: availabilityInitialValues,
    mode: "onSubmit",
  });

  const weeklyHours = form.watch("weeklyHours");
  const overrideHours = form.watch("overrideHours") || [];

  // Fetch availability preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!session?.user?.accountId) return;

      setLoading(true);
      try {
        // TODO: Implement getAvailabilityPreferencesAction
        // const result = await getAvailabilityPreferencesAction(session.user.accountId);
        // if (result.success && "data" in result && result.data) {
        //   setExaminerProfileId(result.data.id);
        //   form.reset(result.data);
        // }

        // For now, set a dummy ID
        setExaminerProfileId("dummy-id");
      } catch (error) {
        console.error("Error fetching availability preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [session, form]);

  const onSubmit = async (values: AvailabilityPreferencesInput) => {
    if (!examinerProfileId) {
      console.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement updateAvailabilityPreferencesAction
      // const result = await updateAvailabilityPreferencesAction({
      //   examinerProfileId,
      //   ...values,
      //   activationStep: "availability",
      // });

      // if (result.success) {
      //   onComplete();
      // }

      // For now, just complete
      console.log("Availability preferences:", values);
      onComplete();
    } catch (error) {
      console.error("Error updating availability preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (day: DayOfWeek) => {
    const currentSlots = weeklyHours[day].timeSlots;
    form.setValue(`weeklyHours.${day}.timeSlots` as any, [
      ...currentSlots,
      { startTime: "8:00 AM", endTime: "11:00 AM" },
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
    if (isEnabled) {
      form.setValue(`weeklyHours.${day}.timeSlots` as any, []);
    } else {
      form.setValue(`weeklyHours.${day}.timeSlots` as any, [
        { startTime: "8:00 AM", endTime: "11:00 AM" },
      ]);
    }
  };

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
      const updatedOverrides = overrideHours.map((oh) =>
        oh.date === dateStr
          ? {
              ...oh,
              timeSlots: [
                ...oh.timeSlots,
                { startTime: "8:00 AM", endTime: "11:00 AM" },
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

  if (loading && !examinerProfileId) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">Set Your Availability</h2>
        <Button
          type="submit"
          form="availability-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center gap-2"
          disabled={loading}>
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("weeklyHours")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "weeklyHours"
              ? "text-[#00A8FF] border-b-2 border-[#00A8FF]"
              : "text-gray-500 hover:text-gray-700"
          }`}>
          Weekly Hours
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("overrideHours")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "overrideHours"
              ? "text-[#00A8FF] border-b-2 border-[#00A8FF]"
              : "text-gray-500 hover:text-gray-700"
          }`}>
          Override Hours
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bookingOptions")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "bookingOptions"
              ? "text-[#00A8FF] border-b-2 border-[#00A8FF]"
              : "text-gray-500 hover:text-gray-700"
          }`}>
          Booking Options
        </button>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="availability-form">
        {/* Weekly Hours Tab */}
        {activeTab === "weeklyHours" && (
          <div className="space-y-4">
            {daysOptions.map((day) => {
              const dayData = weeklyHours[day.value as DayOfWeek];
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
                    {dayData.enabled &&
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
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px]">
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
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[120px]">
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              removeTimeSlot(day.value as DayOfWeek, index)
                            }
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                    {dayData.enabled && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day.value as DayOfWeek)}
                        className="flex items-center gap-2 text-[#00A8FF] text-sm font-medium hover:text-[#0097E5] transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Time Slot
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Override Hours Tab */}
        {activeTab === "overrideHours" && (
          <div className="flex gap-8">
            {/* Calendar */}
            <div className="bg-gray-50 rounded-2xl p-6 min-w-[350px]">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
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
                  className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
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
                    const isToday =
                      new Date().toDateString() === date.toDateString();

                    return (
                      <button
                        key={`${weekIndex}-${dayIndex}`}
                        type="button"
                        onClick={() => toggleDateSelection(dateStr)}
                        className={`aspect-square rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-[#00A8FF] text-white"
                            : isToday
                            ? "bg-[#00A8FF] text-white"
                            : "text-gray-700 hover:bg-blue-50"
                        }`}>
                        {day}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Override Time Slots */}
            <div className="flex-1">
              {Array.from(selectedDates).map((dateStr) => {
                const override = overrideHours.find(
                  (oh) => oh.date === dateStr
                );
                if (!override) return null;

                return (
                  <div key={dateStr} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleDateSelection(dateStr)}
                        className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF]"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {dateStr}
                      </span>
                    </div>

                    <div className="space-y-2 ml-6">
                      {override.timeSlots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex items-center gap-2">
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

                          <button
                            type="button"
                            onClick={() =>
                              removeOverrideTimeSlot(dateStr, slotIndex)
                            }
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addOverrideTimeSlot(dateStr)}
                        className="flex items-center gap-2 text-[#00A8FF] text-sm font-medium hover:text-[#0097E5] transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Time Slot
                      </button>
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
        )}

        {/* Booking Options Tab */}
        {activeTab === "bookingOptions" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Time Between Appointments
              </label>
              <select
                {...form.register("bookingOptions.bufferTime")}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-full max-w-xs">
                <option value="0">No buffer</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Booking Window
              </label>
              <select
                {...form.register("bookingOptions.advanceBooking")}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-full max-w-xs">
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
        )}
      </FormProvider>
    </div>
  );
};

export default AvailabilityPreferencesForm;
