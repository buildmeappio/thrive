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
  placeholder?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ name, value, onChange, onBlur, disabled, className, icon, placeholder }, ref) => {
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

        const input = e.target as HTMLInputElement;
        const cursorPos = input.selectionStart || 0;

        if (cursorPos === 0) return;

        // Find which digit position the cursor is at
        let digitCount = 0;
        let digitIndex = -1;

        for (let i = 0; i < cursorPos; i++) {
          if (/\d/.test(value[i])) {
            digitCount++;
            digitIndex = digitCount - 1;
          }
        }

        if (digitIndex === -1) return;

        // Remove the digit at the cursor position
        let digitsOnly = value.replace(/\D/g, '');
        digitsOnly = digitsOnly.slice(0, digitIndex) + digitsOnly.slice(digitIndex + 1);

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

        // Restore cursor position after formatting
        setTimeout(() => {
          let newCursorPos = 0;
          let digitsFound = 0;

          for (let i = 0; i < newFormatted.length && digitsFound < digitIndex; i++) {
            if (/\d/.test(newFormatted[i])) {
              digitsFound++;
            }
            newCursorPos = i + 1;
          }

          input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);

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
        placeholder={placeholder || '(234) 956-7890'}
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
