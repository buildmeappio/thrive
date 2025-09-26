import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';

// For multi-select, we use checkboxes in the dropdown and display selected values as comma-separated
export interface DropdownProps {
  id: string;
  label: string;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[]) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  error?: string;
  multiSelect?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select an option',
  icon = <MapPin size={16} color="#A4A4A4" strokeWidth={2} />,
  className = "",
  error,
  multiSelect = false,
}) => {
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set<string>();
    return options.filter(o => (seen.has(o.value) ? false : (seen.add(o.value), true)));
  }, [options]);

  // Calculate max height for 5 items (each item is about 40px high, adjust as needed)
  const maxVisibleItems = 5;
  const itemHeight = 40; // px, adjust if your SelectItem is taller/shorter
  const shouldScroll = uniqueOptions.length > maxVisibleItems;
  const contentStyle = shouldScroll
    ? { maxHeight: `${itemHeight * maxVisibleItems}px`, overflowY: 'auto' as const }
    : {};

  // For multi-select, manage local state for open/close and selected values
  const [open, setOpen] = React.useState(false);

  // Normalize value for multiSelect
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (multiSelect) {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string' && value.length > 0) return value.split(',');
      return [];
    } else {
      return typeof value === 'string' ? [value] : [];
    }
  });

  // For multiSelect, handle checkbox change
  const handleMultiSelectChange = (optionValue: string) => {
    let newSelected: string[];
    if (selectedValues.includes(optionValue)) {
      newSelected = selectedValues.filter(v => v !== optionValue);
    } else {
      newSelected = [...selectedValues, optionValue];
    }
    setSelectedValues(newSelected);
    onChange(newSelected);
  };

  // For single select, just pass through
  const handleSingleSelectChange = (val: string) => {
    onChange(val);
  };

  // Display value for SelectValue in multiSelect mode
  const displayValue = multiSelect
    ? (selectedValues.length === 0
        ? ''
        : uniqueOptions
            .filter(opt => selectedValues.includes(opt.value))
            .map(opt => opt.label)
            .join(', '))
    : (uniqueOptions.find(opt => opt.value === value)?.label || '');

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-normal text-[#000000]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative mt-2">
        {!multiSelect ? (
          <Select
            value={typeof value === 'string' ? value || undefined : undefined}
            onValueChange={handleSingleSelectChange}
            name={id}
          >
            <SelectTrigger
              id={id}
              className={`h-[50px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] pr-8 pl-10 text-[14px] leading-[120%] font-normal tracking-[0.5%] text focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`}
              aria-required={required}
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {icon}
              </div>
              <SelectValue
                placeholder={placeholder}
                className={value === '' ? 'text-[#000000]' : 'text-[#000000]'}
              />
            </SelectTrigger>
            <SelectContent style={contentStyle}>
              {uniqueOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          // Multi-select custom dropdown
          <div className="overflow-y-hidden">
            <button
              type="button"
              id={id}
              className={`h-[50px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] pr-8 pl-10 text-[14px] leading-[120%] font-normal tracking-[0.5%] text-left focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 relative`}
              aria-required={required}
              onClick={() => setOpen(o => !o)}
              tabIndex={0}
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {icon}
              </div>
              <span
                className={
                  displayValue
                    ? "whitespace-nowrap overflow-x-auto block text-[#000000] scrollbar-hide"
                    : "block text-[#A4A4A4] scrollbar-hide"
                }
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  overflowX: "auto"
                }}
              >
                {displayValue || placeholder}
              </span>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#A4A4A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
            {open && (
              <div
                className="absolute z-50 mt-2 w-full rounded-md bg-white shadow-lg border border-gray-200 overflow-y-hidden! overflow-x-hidden"
                style={contentStyle}
                tabIndex={-1}
                onBlur={() => setOpen(false)}
              >
                <ul className="max-h-[200px] overflow-y-auto py-1">
                  {uniqueOptions.map(option => (
                    <li
                      key={option.value}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={e => {
                        e.preventDefault();
                        handleMultiSelectChange(option.value);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.value)}
                        onChange={() => handleMultiSelectChange(option.value)}
                        className="mr-2 accent-[#00A8FF]"
                        tabIndex={-1}
                        readOnly
                      />
                      <span>{option.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Dropdown;