import React, { forwardRef } from "react";
import {
  AsYouType,
  parsePhoneNumber,
  isValidPhoneNumber,
} from "libphonenumber-js";
import { Phone, LucideIcon } from "lucide-react";
import { Input } from "@/components/ui";

interface PhoneInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  placeholder?: string;
  error?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ name, value, onChange, onBlur, disabled, className, icon, placeholder, error }, ref) => {
    // Remove +1 prefix from value if present (for display)
    const displayValue = value ? value.replace(/^\+1\s*/, "") : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove +1 prefix if user tries to type it
      const cleanValue = inputValue.replace(/^\+1\s*/, "");

      const digitsOnly = cleanValue.replace(/\D/g, "");

      if (digitsOnly.length > 10) {
        return;
      }

      // Format without +1 prefix (keep formatting like (123) 456-7890)
      const formatter = new AsYouType("CA");
      formatter.input(`+1${digitsOnly}`);
      const formatted = formatter.getNumber()?.formatNational() || "";

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

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      
      // Extract digits from pasted text
      const digitsOnly = pastedText.replace(/\D/g, "");
      
      if (digitsOnly.length > 10) {
        // Take only first 10 digits
        const tenDigits = digitsOnly.slice(0, 10);
        const formatter = new AsYouType("CA");
        formatter.input(`+1${tenDigits}`);
        const formatted = formatter.getNumber()?.formatNational() || "";
        
        // Create synthetic event to trigger onChange
        const input = e.currentTarget;
        const syntheticEvent = {
          ...e,
          target: {
            ...input,
            name,
            value: formatted,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      } else if (digitsOnly.length > 0) {
        // Format the pasted digits
        const formatter = new AsYouType("CA");
        formatter.input(`+1${digitsOnly}`);
        const formatted = formatter.getNumber()?.formatNational() || "";
        
        // Create synthetic event to trigger onChange
        const input = e.currentTarget;
        const syntheticEvent = {
          ...e,
          target: {
            ...input,
            name,
            value: formatted,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      }
    };

    return (
      <Input
        ref={ref}
        name={name}
        icon={icon || Phone}
        type="tel"
        placeholder={placeholder || "Enter your phone number"}
        value={displayValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onPaste={handlePaste}
        onBlur={onBlur}
        disabled={disabled}
        className={className}
        error={error}
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
