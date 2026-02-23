import { MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { type DropdownOption } from '@/domains/ime-referral/types/CaseInfo';

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
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="font-poppins text-sm font-medium text-[#000000]">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className={`relative w-full rounded-[7.56px] ${className ? className : 'h-11 bg-[#F2F5F6]'} pr-8 text-sm font-normal tracking-[0.5%] shadow-none focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none [&>svg]:hidden ${
            icon ? 'pl-10' : 'pl-3'
          } ${value ? 'text-[#000000]' : 'text-[#4D4D4D]'}`}
        >
          {icon && <div className="absolute top-1/2 left-3 -translate-y-1/2">{icon}</div>}
          <SelectValue placeholder={placeholder} />
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-[#A4A4A4]" />
          </div>
        </SelectTrigger>

        <SelectContent
          className="z-50 max-h-[250px] overflow-y-auto rounded-md border-none bg-white shadow-lg [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          position="popper"
        >
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
