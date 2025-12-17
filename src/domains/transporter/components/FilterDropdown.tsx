"use client";

import React from "react";

interface FilterDropdownProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  gradientId?: string;
}

export default function FilterDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onChange,
  icon,
  gradientId,
}: FilterDropdownProps) {
  const displayValue =
    value === "all"
      ? label
      : options.find((opt) => opt.value === value)?.label || value;

  return (
    <div className="relative filter-dropdown">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
          value !== "all"
            ? "border-[#00A8FF] text-[#00A8FF]"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {icon || (
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            style={{
              stroke: gradientId ? `url(#${gradientId})` : "currentColor",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 4V12M12 8H4"
            />
          </svg>
        )}
        <span>{displayValue}</span>
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("all");
              }}
              className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                value === "all" ? "bg-gray-100 text-[#00A8FF]" : ""
              }`}
            >
              All {label}s
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                }}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                  value === option.value ? "bg-gray-100 text-[#00A8FF]" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
