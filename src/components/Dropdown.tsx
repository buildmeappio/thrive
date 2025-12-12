"use client";
import React from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Checkbox } from "./ui";

export interface DropdownProps {
  id: string;
  label?: string;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[]) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  error?: string;
  multiSelect?: boolean;
  from?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  label = "",
  value,
  onChange,
  options,
  required = false,
  placeholder = "Select an option",
  icon = <MapPin size={16} color="#A4A4A4" strokeWidth={2} />,
  className = "",
  error,
  multiSelect = false,
  from = "",
  disabled = false,
}) => {
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set<string>();
    return options.filter((o) =>
      seen.has(o.value) ? false : (seen.add(o.value), true),
    );
  }, [options]);

  const maxVisibleItems = 5;
  const itemHeight = 40;
  const shouldScroll = uniqueOptions.length > maxVisibleItems;
  const contentStyle = shouldScroll
    ? {
        maxHeight: `${itemHeight * maxVisibleItems}px`,
        overflowY: "auto" as const,
      }
    : {};

  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside for multiselect
  React.useEffect(() => {
    if (!multiSelect || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [multiSelect, open]);

  // Use the value prop directly for multiselect - don't maintain separate state
  const selectedValues = React.useMemo(() => {
    if (multiSelect) {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value.length > 0)
        return value.split(",");
      return [];
    } else {
      return typeof value === "string" ? [value] : [];
    }
  }, [value, multiSelect]);

  const handleMultiSelectChange = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newValues);
  };

  const handleSingleSelectChange = (val: string) => {
    onChange(val);
  };

  const displayValue = multiSelect
    ? selectedValues.length === 0
      ? ""
      : (() => {
          const selectedLabels = uniqueOptions
            .filter((opt) => selectedValues.includes(opt.value))
            .map((opt) => opt.label);
          if (selectedLabels.length === 0) return "";
          // Show all values comma-separated
          return selectedLabels.join(", ");
        })()
    : uniqueOptions.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-normal text-[#000000]">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative mt-1">
        {!multiSelect ? (
          <Select
            value={typeof value === "string" ? value || undefined : undefined}
            onValueChange={handleSingleSelectChange}
            name={id}
          >
            <SelectTrigger
              id={id}
              disabled={disabled}
              className={`h-[55px] w-full text-[#000000] rounded-[7.56px] border-none shadow-none ${
                from === "profile-info-form" ? "bg-[#F9F9F9]" : "bg-[#F2F5F6]"
              } ${
                icon ? "pl-10" : "pl-3"
              } text-[14px] leading-[120%] font-normal tracking-[0.5%] hover:bg-opacity-80 transition-colors focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${
                error ? "ring-2 ring-red-500/30" : ""
              }`}
              aria-required={required}
            >
              {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {icon}
                </div>
              )}
              <SelectValue
                placeholder={placeholder}
                className="text-[#000000]"
              />
            </SelectTrigger>
            <SelectContent style={contentStyle}>
              {uniqueOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id={id}
              disabled={disabled}
              className={`h-[55px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] pr-8 ${
                icon ? "pl-10" : "pl-3"
              } text-[14px] leading-[120%] font-normal tracking-[0.5%] text-left hover:bg-opacity-80 transition-colors focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 relative ${
                error ? "ring-2 ring-red-500/30" : ""
              }`}
              onClick={() => setOpen((o) => !o)}
              tabIndex={0}
            >
              {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {icon}
                </div>
              )}
              <span
                className={
                  displayValue
                    ? "whitespace-nowrap overflow-x-auto block text-[#000000] [&::-webkit-scrollbar]:hidden"
                    : "block text-[#A4A4A4]"
                }
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  overflowX: "auto",
                }}
              >
                {displayValue || placeholder}
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="#A4A4A4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            {open && (
              <div className="scrollbar-thin absolute z-50 mt-2 w-full max-h-[200px] rounded-md bg-white shadow-lg border border-gray-200 overflow-y-auto">
                <ul className="py-1">
                  {uniqueOptions.map((option) => (
                    <li
                      key={option.value}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMultiSelectChange(option.value);
                      }}
                    >
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={() => {}}
                        checkedColor="#00A8FF"
                        checkIconColor="white"
                      />
                      <span className="ml-2">{option.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {error && error.trim() && error.trim() !== " " && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;
