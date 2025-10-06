import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface DatePickerInputProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  name?: string;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  name,
  error,
  label,
  placeholder = "Select date",
  required,
  disabled,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    value ? (typeof value === "string" ? new Date(value) : value) : null
  );

  React.useEffect(() => {
    if (value) {
      setSelectedDate(typeof value === "string" ? new Date(value) : value);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date ?? null);
    if (onChange) onChange(date ?? null);
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor={name} className="text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Input
            name={name}
            icon={CalendarIcon}
            type="text"
            placeholder={placeholder}
            value={selectedDate ? format(selectedDate, "MMMM dd, yyyy") : ""}
            readOnly
            disabled={disabled}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={handleDateSelect}
            className="rounded-lg border bg-white"
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DatePickerInput;
