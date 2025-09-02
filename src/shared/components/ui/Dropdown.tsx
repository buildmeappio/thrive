import { MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select an option',
  icon = <MapPin size={16} className="text-[#A4A4A4]" />,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id} className="text-sm font-normal text-[#000000]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="relative h-[55px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] pr-8 pl-10 text-[14px] font-normal tracking-[0.5%] text-[#A4A4A4] shadow-none focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none [&>svg]:hidden" // Hide default chevron
        >
          <div className="absolute top-1/2 left-3 -translate-y-1/2">{icon}</div>
          <SelectValue placeholder={placeholder} />
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-[#A4A4A4]" />
          </div>
        </SelectTrigger>

        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
