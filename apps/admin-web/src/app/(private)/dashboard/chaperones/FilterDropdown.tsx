'use client';

import React from 'react';

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
    value === 'all' ? label : options.find(opt => opt.value === value)?.label || value;

  return (
    <div className="filter-dropdown relative">
      <button
        onClick={onToggle}
        className={`font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
          value !== 'all'
            ? 'border-[#00A8FF] text-[#00A8FF]'
            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {icon || (
          <svg
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            style={{
              stroke: gradientId ? `url(#${gradientId})` : 'currentColor',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4V12M12 8H4" />
          </svg>
        )}
        <span>{displayValue}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-56">
          <div className="max-h-48 overflow-y-auto py-1.5 sm:max-h-64 sm:py-2">
            <button
              onClick={e => {
                e.stopPropagation();
                onChange('all');
              }}
              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                value === 'all' ? 'bg-gray-100 text-[#00A8FF]' : ''
              }`}
            >
              All {label}s
            </button>
            {options.map(option => (
              <button
                key={option.value}
                onClick={e => {
                  e.stopPropagation();
                  onChange(option.value);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                  value === option.value ? 'bg-gray-100 text-[#00A8FF]' : ''
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
