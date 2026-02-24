import React, { forwardRef } from 'react';
import { AsYouType, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Phone, LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui';

interface PhoneInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ name, value, onChange, onBlur, disabled, className, icon }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove +1 prefix if user tries to type it
      const cleanValue = inputValue.replace(/^\+1\s*/, '');

      const digitsOnly = cleanValue.replace(/\D/g, '');

      if (digitsOnly.length > 10) {
        return;
      }

      // Format with +1 prefix
      const formatter = new AsYouType('CA');
      formatter.input(`+1${digitsOnly}`);
      const formatted = formatter.getNumber()?.formatInternational() || '';

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: formatted,
        },
      };

      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      const isDigit = /[0-9]/.test(e.key);
      const isFormatChar = /[\s\-().]/.test(e.key);

      if (!isDigit && !allowedKeys.includes(e.key) && !isFormatChar) {
        e.preventDefault();
      }
    };

    return (
      <Input
        ref={ref}
        name={name}
        icon={icon || Phone}
        type="tel"
        placeholder="+1 (123) 456-7890"
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onBlur={onBlur}
        disabled={disabled}
        className={className}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;

export const validateCanadianPhoneNumber = (value: string | undefined): boolean => {
  if (!value) return false;

  try {
    let digits: any = value.replace(/\D/g, '');

    // If the number starts with 1 and has 11 digits, remove the leading 1
    // (This handles cases where +1 prefix is included in the formatted value)
    if (digits.startsWith('1') && digits.length === 11) {
      digits = digits.substring(1);
    }

    // Should have exactly 10 digits now
    if (digits.length !== 10) return false;

    const phoneWithCountryCode: any = `+1${digits}`;

    return isValidPhoneNumber(phoneWithCountryCode, 'CA');
  } catch {
    return false;
  }
};

export const getE164PhoneNumber = (value: string): string | null => {
  try {
    let digits: any = value.replace(/\D/g, '');

    // If the number starts with 1 and has 11 digits, remove the leading 1
    // (This handles cases where +1 prefix is included in the formatted value)
    if (digits.startsWith('1') && digits.length === 11) {
      digits = digits.substring(1);
    }

    if (digits.length === 10) {
      const phoneNumber: any = parsePhoneNumber(`+1${digits}`, 'CA');
      return phoneNumber?.format('E.164') || null;
    }
    return null;
  } catch {
    return null;
  }
};
