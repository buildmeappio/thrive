'use client';
import { Info } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { ReactNode } from 'react';

type Option = { label: string; value: string };

const LabeledSelect = ({
  label,
  value,
  onChange,
  options,
  icon,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  icon?: ReactNode;
  className?: string;
}) => {
  const defaultIcon = <Info className="h-4 w-4 flex-shrink-0 text-blue-900" strokeWidth={2} />;

  return (
    <div className={`relative w-44 ${className}`}>
      <Dropdown
        id={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}
        label=""
        value={value}
        onChange={onChange}
        options={options}
        icon={icon || defaultIcon}
        placeholder={label}
        className="h-[45px] rounded-full border border-gray-200 bg-white"
      />
    </div>
  );
};

export default LabeledSelect;
