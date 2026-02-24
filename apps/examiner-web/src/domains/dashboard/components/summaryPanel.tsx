'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SummaryPanelProps } from '@/domains/dashboard/types';

export default function SummaryPanel({
  earnings,
  invoiced,
  totalIMEs,
  period,
  dropdownOptions = ['Month', '10 Days', '3 Months', 'Year'],
  onPeriodChange,
}: SummaryPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period || dropdownOptions[0] || 'Month');

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <section
      data-tour="summary-panel"
      className="w-full rounded-[29px] bg-white p-3 shadow-[0_0_36.92px_rgba(0,0,0,0.08)] sm:p-4 md:p-6"
      aria-labelledby="summary-heading"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5 sm:gap-3 md:mb-6">
        <h3
          id="summary-heading"
          className="font-degular text-lg font-[600] leading-tight tracking-[-0.02em] text-black sm:text-xl md:text-[24px] lg:text-[29.01px]"
        >
          Summary
        </h3>

        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="h-[28px] w-[90px] shrink-0 whitespace-nowrap rounded-[34px] border-0 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 text-xs font-medium tracking-[-0.02em] text-white transition-colors hover:bg-[#2A2A2A] sm:h-[30px] sm:w-[100px] sm:px-3 sm:text-sm md:h-[34px] md:w-[110px] md:px-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dropdownOptions.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Metrics */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Earnings and Invoiced Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="font-poppins mb-1 text-xs font-medium text-[#5B5B5B] sm:mb-1.5 sm:text-sm md:mb-2 md:text-[14px]">
              Earnings
            </p>
            <p className="font-poppins text-xl font-bold leading-tight text-[#00A8FF] sm:text-2xl md:text-[28px] lg:text-[32px]">
              {earnings}
            </p>
          </div>
          <div>
            <p className="font-poppins mb-1 text-xs font-medium text-[#5B5B5B] sm:mb-1.5 sm:text-sm md:mb-2 md:text-[14px]">
              Invoiced
            </p>
            <p className="font-poppins text-xl font-bold leading-tight text-[#00A8FF] sm:text-2xl md:text-[28px] lg:text-[32px]">
              {invoiced}
            </p>
          </div>
        </div>

        {/* Total IMEs */}
        <div>
          <p className="font-poppins mb-1 text-xs font-medium text-[#5B5B5B] sm:mb-1.5 sm:text-sm md:mb-2 md:text-[14px]">
            Total IMEs
          </p>
          <p className="font-poppins text-xl font-bold leading-tight text-[#00A8FF] sm:text-2xl md:text-[28px] lg:text-[32px]">
            {totalIMEs}
          </p>
        </div>
      </div>
    </section>
  );
}
