import React, { forwardRef } from "react";
import {
  AsYouType,
  parsePhoneNumber,
  isValidPhoneNumber,
} from "libphonenumber-js";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui";

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

      const digitsOnly = inputValue.replace(/\D/g, "");

      if (digitsOnly.length > 10) {
        return;
      }

      const formatter = new AsYouType("CA");
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
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
      ];
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

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;

export const validateCanadianPhoneNumber = (
  value: string | undefined
): boolean => {
  if (!value) return false;

  try {
    const digits: any = value.replace(/\D/g, "");

    if (digits.length !== 10) return false;

    const phoneWithCountryCode: any = `+1${digits}`;

    return isValidPhoneNumber(phoneWithCountryCode, "CA");
  } catch {
    return false;
  }
};

export const getE164PhoneNumber = (value: string): string | null => {
  try {
    const digits: any = value.replace(/\D/g, "");
    if (digits.length === 10) {
      const phoneNumber: any = parsePhoneNumber(`+1${digits}`, "CA");
      return phoneNumber?.format("E.164") || null;
    }
    return null;
  } catch {
    return null;
  }
};
