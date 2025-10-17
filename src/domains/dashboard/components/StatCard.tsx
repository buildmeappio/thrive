"use client";

import Image from "@/components/Image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  title: string;
  value: string | number;
  href: string;
  badge?: string;
  icon?: ReactNode;
  iconSrc?: string;
  iconAlt?: string;
  intent?: "primary" | "indigo" | "aqua";
  showDropdown?: boolean;
  dropdownOptions?: string[];
  onDropdownChange?: (value: string) => void;
};

const INTENTS = {
  primary: { bg: "bg-[#00A8FF]", badge: "bg-[#0037A5] text-white", arrow: "bg-[#000080] text-white" },
  indigo: { bg: "bg-[#0C108B]", badge: "bg-[#0000BD] text-white", arrow: "bg-[#00A8FF] text-white" },
  aqua: { bg: "bg-[linear-gradient(90deg,#01F4C8_0%,#00A8FF_100%)]", badge: "bg-[#006599] text-white", arrow: "bg-[#000080] text-white" },
} as const;

export default function StatCard({
  title,
  value,
  href,
  badge,
  icon,
  iconSrc,
  iconAlt = "",
  intent = "primary",
  showDropdown = false,
  dropdownOptions = ["Today", "Tomorrow", "This Week"],
  onDropdownChange,
}: Props) {
  const colors = INTENTS[intent];
  const [selectedFilter, setSelectedFilter] = useState(dropdownOptions[0]);

  const handleDropdownChange = (value: string) => {
    setSelectedFilter(value);
    onDropdownChange?.(value);
  };

  return (
    <div
      className={cn(
        "relative rounded-[22px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)]",
        colors.bg,
        "px-[19px] pt-[17px] pb-[12px] pr-[28px] min-h-[128px]"
      )}
      style={{ fontFamily: "Poppins, system-ui" }}
    >
      {/* top row: icon left, badge/dropdown right */}
      <div className="flex items-start justify-between">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-full">
          {icon ? (
            <span className="text-white w-[16px] h-[16px]">
              {icon}
            </span>
          ) : iconSrc ? (
            <Image
              src={iconSrc}
              alt={iconAlt}
              width={16}
              height={16}
              className="h-[16px] w-[16px]"
            />
          ) : null}
        </span>

        {showDropdown ? (
          <Select value={selectedFilter} onValueChange={handleDropdownChange}>
            <SelectTrigger className="w-[110px] h-[28px] rounded-[34px] border-0 bg-white text-[#000080] text-[12.5px] font-medium tracking-[-0.02em] px-[12px]">
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
        ) : badge ? (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-[34px] h-[28px] px-[12px]",
              "text-[12.5px] font-medium tracking-[-0.02em]",
              colors.badge
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {/* title */}
      <div className="mt-3">
        <p className="text-white text-[18px] font-semibold tracking-[-0.03em] leading-none">
          {title}
        </p>
      </div>

      {/* value + arrow */}
      <div className="mt-2 flex items-end justify-between">
        <span className="relative inline-block leading-none">
          <span className="absolute -left-[10px] -top-[6px] h-[43px] w-[35px] rounded-[8px]" />
          <span className="relative text-white text-[35px] leading-[43px] font-semibold">
            {value}
          </span>
        </span>

        <Link
          href={href}
          aria-label="Open"
          className={cn(
            "grid place-items-center h-[28px] w-[28px] rounded-full",
            colors.arrow
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
