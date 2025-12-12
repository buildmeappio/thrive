"use client";

import { useState } from "react";
import WeeklyHoursSection from "@/domains/services/components/WeeklyHoursSection";
import OverrideHoursSection from "@/domains/services/components/OverrideHoursSection";
import {
  WeeklyHours,
  OverrideHours,
} from "@/domains/services/types/Availability";

type Props = {
  weeklyHours: WeeklyHours[];
  overrideHours: OverrideHours[];
  onWeeklyHoursChange: (weeklyHours: WeeklyHours[]) => void;
  onOverrideHoursChange: (overrideHours: OverrideHours[]) => void;
  disabled?: boolean;
};

const AvailabilityTabs = ({
  weeklyHours,
  overrideHours,
  onWeeklyHoursChange,
  onOverrideHoursChange,
  disabled = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"weekly" | "override">("weekly");

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-black font-poppins">
          Availability
        </h2>
      </div>

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

      <div className="p-8">
        {activeTab === "weekly" ? (
          <WeeklyHoursSection
            weeklyHours={weeklyHours}
            onChange={onWeeklyHoursChange}
            disabled={disabled}
          />
        ) : (
          <OverrideHoursSection
            overrideHours={overrideHours}
            onChange={onOverrideHoursChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default AvailabilityTabs;
