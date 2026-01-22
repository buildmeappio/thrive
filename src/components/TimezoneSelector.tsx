'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Dropdown } from './Dropdown';
import { Label } from '@/components/ui/label';
import ErrorMessages from '@/constants/ErrorMessages';

// Common IANA timezones, focusing on North America
export const timezoneOptions = [
  // Canada
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
  { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
  { value: 'America/Edmonton', label: 'Mountain Time (Edmonton)' },
  { value: 'America/Winnipeg', label: 'Central Time (Winnipeg)' },
  { value: 'America/Halifax', label: 'Atlantic Time (Halifax)' },
  { value: 'America/St_Johns', label: "Newfoundland Time (St. John's)" },
  { value: 'America/Whitehorse', label: 'Pacific Time (Whitehorse)' },
  { value: 'America/Yellowknife', label: 'Mountain Time (Yellowknife)' },
  { value: 'America/Iqaluit', label: 'Eastern Time (Iqaluit)' },
  // United States
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/Phoenix', label: 'Mountain Time (Phoenix)' },
  { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)' },
  // Other common timezones
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
];

interface TimezoneSelectorProps {
  name?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  name = 'timezone',
  label = 'Timezone',
  required = true,
  className = '',
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="font-poppins text-sm font-medium text-[#000000]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Dropdown
            id={name}
            label=""
            value={field.value || ''}
            onChange={field.onChange}
            options={timezoneOptions}
            placeholder="Select timezone"
            required={required}
          />
        )}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default TimezoneSelector;
