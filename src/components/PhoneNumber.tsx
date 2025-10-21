import React, { forwardRef } from 'react';
import { AsYouType } from 'libphonenumber-js';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui';
import type { LucideIcon } from 'lucide-react';

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
      const digitsOnly = inputValue.replace(/\D/g, '');

      // Allow 11 digits only if it starts with "1"
      const maxLength = digitsOnly.startsWith('1') ? 11 : 10;
      if (digitsOnly.length > maxLength) return;

      const formatter = new AsYouType('CA');
      const formatted = formatter.input(digitsOnly);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && value) {
        e.preventDefault();

        let digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length === 0) return;

        // Remove the last digit manually
        digitsOnly = digitsOnly.slice(0, -1);

        // Reformat with AsYouType
        const formatter = new AsYouType('CA');
        const newFormatted = formatter.input(digitsOnly);

        const syntheticEvent = {
          ...e,
          target: {
            name,
            value: newFormatted,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
        return;
      }

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
        placeholder="(234) 956-7890"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        disabled={disabled}
        className={className}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
