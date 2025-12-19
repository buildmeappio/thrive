"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SummaryPanelProps } from "@/domains/dashboard/types";

export default function SummaryPanel({
  earnings,
  invoiced,
  totalIMEs,
  period,
  dropdownOptions = ["Month", "10 Days", "3 Months", "Year"],
  onPeriodChange,
}: SummaryPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(
    period || dropdownOptions[0] || "Month",
  );

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <section
      data-tour="summary-panel"
      className="rounded-[29px] w-full bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
      aria-labelledby="summary-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-6">
        <h3
          id="summary-heading"
          className="font-degular font-[600] text-[26px] sm:text-[24px] md:text-[29.01px] leading-tight tracking-[-0.02em] text-black"
        >
          Summary
        </h3>

        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[110px] h-[34px] rounded-[34px] border-0 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white text-sm font-medium tracking-[-0.02em] px-4 hover:bg-[#2A2A2A] transition-colors whitespace-nowrap shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dropdownOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Metrics */}
      <div className="space-y-6">
        {/* Earnings and Invoiced Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[16px] sm:text-[14px] font-poppins font-medium text-[#5B5B5B] mb-2">
              Earnings
            </p>
            <p className="text-[32px] sm:text-[28px] font-poppins font-bold text-[#00A8FF] leading-tight">
              {earnings}
            </p>
          </div>
          <div>
            <p className="text-[16px] sm:text-[14px] font-poppins font-medium text-[#5B5B5B] mb-2">
              Invoiced
            </p>
            <p className="text-[32px] sm:text-[28px] font-poppins font-bold text-[#00A8FF] leading-tight">
              {invoiced}
            </p>
          </div>
        </div>

        {/* Total IMEs */}
        <div>
          <p className="text-[16px] sm:text-[14px] font-poppins font-medium text-[#5B5B5B] mb-2">
            Total IMEs
          </p>
          <p className="text-[32px] sm:text-[28px] font-poppins font-bold text-[#00A8FF] leading-tight">
            {totalIMEs}
          </p>
        </div>
      </div>
    </section>
  );
}
