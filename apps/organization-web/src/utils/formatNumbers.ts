import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import log from './log';

export const getE164PhoneNumber = (value: string | undefined): string | null => {
  if (!value) return null;

  try {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      const phoneNumber = parsePhoneNumberFromString(`+${digitsOnly}`, 'CA');
      return phoneNumber?.format('E.164') || null;
    }

    if (digitsOnly.length === 10) {
      const phoneNumber = parsePhoneNumberFromString(digitsOnly, 'CA');
      return phoneNumber?.format('E.164') || null;
    }

    return null;
  } catch {
    log.error('Error parsing phone number to E.164:', value);
    return null;
  }
};

export const formatE164ForDisplay = (e164Value: string | undefined | null): string | null => {
  if (!e164Value) return null;

  try {
    const phoneNumber = parsePhoneNumberFromString(e164Value);

    if (phoneNumber?.isValid()) {
      const nationalFormat = phoneNumber.format('NATIONAL');

      return `+${phoneNumber.countryCallingCode} ${nationalFormat}`;
    }

    return e164Value;
  } catch {
    log.error('Error formatting E.164 number for display:', e164Value);
    return e164Value;
  }
};

export const validateCanadianPhoneNumber = (value: string | undefined): boolean => {
  if (!value) return false;

  try {
    const digitsOnly = value.replace(/\D/g, '');

    // Check if it's a valid length (10 digits for Canadian numbers, or 11 if it starts with 1)
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      // For 11-digit numbers starting with 1, validate the format
      // The remaining 10 digits should be a valid Canadian number format
      const remainingDigits = digitsOnly.slice(1);
      // Check if it's a valid format (not checking actual validity, just format)
      return /^[2-9]\d{2}[2-9]\d{6}$/.test(remainingDigits);
    }

    if (digitsOnly.length === 10) {
      // For 10-digit numbers, check if it matches Canadian phone number format
      // Format: NXX-XXXX where N is 2-9 and X is 0-9
      // This checks the format pattern, not the actual validity
      return /^[2-9]\d{2}[2-9]\d{6}$/.test(digitsOnly);
    }

    return false;
  } catch {
    return false;
  }
};
