import React, { forwardRef } from 'react';
import { AsYouType, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui';

interface PhoneInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ name, value, onChange, onBlur, disabled, className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const digitsOnly = inputValue.replace(/\D/g, '');

      // Allow 11 digits only if it starts with "1"
      const maxLength = digitsOnly.startsWith('1') ? 11 : 10;

      if (digitsOnly.length > maxLength) {
        return;
      }

      const formatter = new AsYouType('CA');
      const formatted = formatter.input(inputValue);

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
        icon={Phone}
        type="tel"
        placeholder="(123) 456-7890"
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

// ✅ Validation allows 10 or 11 digits (11 only if starts with 1)
export const validateCanadianPhoneNumber = (value: string | undefined): boolean => {
  if (!value) return false;

  try {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return isValidPhoneNumber(`+${digitsOnly}`, 'CA');
    }

    if (digitsOnly.length === 10) {
      return isValidPhoneNumber(`+1${digitsOnly}`, 'CA');
    }

    return false;
  } catch {
    return false;
  }
};

// ✅ Convert to E.164 (handles both 10- and 11-digit inputs)
export const getE164PhoneNumber = (value: string): string | null => {
  try {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      const phoneNumber = parsePhoneNumber(`+${digitsOnly}`, 'CA');
      return phoneNumber?.format('E.164') || null;
    }

    if (digitsOnly.length === 10) {
      const phoneNumber = parsePhoneNumber(`+1${digitsOnly}`, 'CA');
      return phoneNumber?.format('E.164') || null;
    }

    return null;
  } catch {
    return null;
  }
};
