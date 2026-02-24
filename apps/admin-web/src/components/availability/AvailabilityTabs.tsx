'use client';

import { useState } from 'react';
import WeeklyHoursSection from '@/domains/services/components/WeeklyHoursSection';
import OverrideHoursSection from '@/domains/services/components/OverrideHoursSection';
import { WeeklyHours, OverrideHours } from '@/domains/services/types/Availability';

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
  const [activeTab, setActiveTab] = useState<'weekly' | 'override'>('weekly');

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-6">
        <h2 className="font-poppins text-xl font-semibold text-black">Availability</h2>
      </div>

      <div className="flex gap-0 border-b border-gray-200 bg-gray-50 px-6">
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`font-poppins relative px-6 py-4 text-base font-medium transition-all duration-200 ${
            activeTab === 'weekly'
              ? 'bg-white text-black'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          Weekly Hours
          {activeTab === 'weekly' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('override')}
          className={`font-poppins relative px-6 py-4 text-base font-medium transition-all duration-200 ${
            activeTab === 'override'
              ? 'bg-white text-black'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          Override Hours
          {activeTab === 'override' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
          )}
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'weekly' ? (
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
