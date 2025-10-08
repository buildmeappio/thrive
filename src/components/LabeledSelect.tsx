'use client';

import { Info, Plus, CalendarDays, Filter } from 'lucide-react';
import { Dropdown } from './Dropdown';

type Option = { label: string; value: string };

const iconMap: Record<string, any> = {
  'Claim Type': Info,
  Specialty: Plus,
  Date: CalendarDays,
  Status: Filter,
};

const LabeledSelect = ({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
}) => {
  const Icon = iconMap[label] || Info;

  return (
    <div className={`relative w-44 ${className}`}>
      <Dropdown
        id={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}
        label=""
        value={value}
        onChange={onChange}
        options={options}
        icon={<Icon className="h-4 w-4 flex-shrink-0 text-blue-900" strokeWidth={2} />}
        placeholder={label}
        className="h-[45px] rounded-full border border-gray-200 bg-white"
      />
    </div>
  );
};
export default LabeledSelect;
