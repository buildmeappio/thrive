import React from 'react';
import { MapPin } from 'lucide-react';
import type { DropdownProps } from '@/shared/types/dropdown/DropdownProps';

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select an option',
  icon = <MapPin size={16} color="#A4A4A4" strokeWidth={2} />,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-normal text-[#000000]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`h-[55px] w-full appearance-none rounded-[7.56px] border-none bg-[#F2F5F6] pr-8 pl-10 text-[14px] leading-[100%] font-normal tracking-[0.5%] ${
            value === '' ? 'text-[#A4A4A4]' : 'text-[#A4A4A4]'
          } focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="" disabled className="text-[#9EA9AA]">
            {placeholder}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform">
          {icon}
        </div>
        <svg
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform"
          width="15"
          height="15"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="#A4A4A4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
